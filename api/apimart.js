import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://api.apimart.ai/v1';
const MODEL = 'gpt-image-2';

export const VALID_SIZES = [
  '1:1',  '16:9', '9:16', '4:3', '3:4',
  '3:2',  '2:3',  '5:4',  '4:5',
  '2:1',  '1:2',  '21:9', '9:21',
];

// 启动时加载 .env(零依赖 · 不依赖 dotenv)
(() => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fsSync.existsSync(envPath)) return;
  const text = fsSync.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
})();

function getKey() {
  const key = process.env.APIMART_KEY;
  if (!key) throw new Error('APIMART_KEY 未设置 · 请在 .env 填入你的 apimart key');
  return key;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function errMsg(json) {
  if (json?.error) return `[${json.error.code}] ${json.error.message}`;
  return JSON.stringify(json);
}

export async function submit({ prompt, size = '1:1', imageUrls }) {
  if (!prompt || !prompt.trim()) throw new Error('prompt 不能为空');
  if (!VALID_SIZES.includes(size)) {
    throw new Error(`size 非法: "${size}" · 只能是 ${VALID_SIZES.join(' / ')}`);
  }
  if (imageUrls && imageUrls.length > 16) {
    throw new Error(`image_urls 超过上限 16(当前 ${imageUrls.length})`);
  }

  const body = { model: MODEL, prompt, n: 1, size };
  if (imageUrls && imageUrls.length) body.image_urls = imageUrls;

  const resp = await fetch(`${API_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await resp.json();
  if (!resp.ok || json.error) throw new Error(`submit 失败 ${errMsg(json)}`);
  const taskId = json?.data?.[0]?.task_id;
  if (!taskId) throw new Error(`submit 响应缺 task_id: ${JSON.stringify(json)}`);
  return taskId;
}

export async function queryTask(taskId) {
  const resp = await fetch(`${API_BASE}/tasks/${taskId}`, {
    headers: { 'Authorization': `Bearer ${getKey()}` },
  });
  const json = await resp.json();
  if (!resp.ok || json.error) throw new Error(`query 失败 ${errMsg(json)}`);
  return json.data;
}

export async function getTokenBalance() {
  const resp = await fetch(`${API_BASE}/balance`, {
    headers: { 'Authorization': `Bearer ${getKey()}` },
  });
  const json = await resp.json();
  if (!resp.ok || !json.success) throw new Error(`balance 查询失败: ${JSON.stringify(json)}`);
  return json;
}

export async function getUserBalance() {
  const resp = await fetch(`${API_BASE}/user/balance`, {
    headers: { 'Authorization': `Bearer ${getKey()}` },
  });
  const json = await resp.json();
  if (!resp.ok || !json.success) throw new Error(`user balance 查询失败: ${JSON.stringify(json)}`);
  return json;
}

export async function queryTaskBatch(taskIds) {
  const resp = await fetch(`${API_BASE}/tasks/batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task_ids: taskIds }),
  });
  const json = await resp.json();
  if (!resp.ok || json.error) throw new Error(`batch query 失败 ${errMsg(json)}`);
  return json.data;
}

export async function pollUntilDone(taskId, {
  onProgress,
  firstDelayMs = 12_000,
  intervalMs = 4_000,
  timeoutMs = 240_000,
} = {}) {
  await sleep(firstDelayMs);
  const start = Date.now();
  let count = 0;
  while (true) {
    count++;
    const data = await queryTask(taskId);
    onProgress?.({ count, status: data.status, progress: data.progress, data });
    if (data.status === 'completed') return data;
    if (data.status === 'failed') {
      const msg = data?.error?.message || JSON.stringify(data);
      throw new Error(`task failed: ${msg}`);
    }
    if (Date.now() - start > timeoutMs) throw new Error(`poll 超时 ${timeoutMs / 1000}s`);
    await sleep(intervalMs);
  }
}

export async function downloadImage(url, outputDir, filename, {
  retries = 3,
  retryDelayMs = 2000,
  onRetry,
} = {}) {
  await fs.mkdir(outputDir, { recursive: true });
  const ext = (url.split('?')[0].match(/\.(\w{2,5})$/)?.[1]) || 'png';
  const baseName = filename || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const full = /\.\w{2,5}$/.test(baseName) ? baseName : `${baseName}.${ext}`;
  const localPath = path.join(outputDir, full);

  let lastErr;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.length < 100) throw new Error(`file too small ${buf.length}B · suspicious`);
      await fs.writeFile(localPath, buf);
      return { local_path: localPath, size_bytes: buf.length, attempts: attempt };
    } catch (e) {
      lastErr = e;
      if (attempt <= retries) {
        onRetry?.({ attempt, max: retries + 1, error: e.message });
        await sleep(retryDelayMs * attempt);
      }
    }
  }
  const err = new Error(`download failed after ${retries + 1} tries: ${lastErr?.message}`);
  err.url = url;
  err.local_path_intended = localPath;
  throw err;
}

/**
 * 一站式 · submit → poll → download
 *
 * @param {object} opts
 * @param {string}   opts.prompt         文本描述(中/英)
 * @param {string}   [opts.size='1:1']   13 种比例之一(VALID_SIZES)
 * @param {string[]} [opts.imageUrls]    图生图 · URL 或 base64 data URI · 最多 16
 * @param {string}   [opts.outputDir]    默认 ./assets/generated
 * @param {string}   [opts.filename]     本地文件名(不含扩展名自动补 .png)
 * @param {boolean}  [opts.download=true] 是否立即下载(图 24h 过期 · 默认 true)
 * @param {Function} [opts.onProgress]   进度回调 · (e) => void
 */
export async function generate(opts) {
  const {
    prompt, size = '1:1', imageUrls,
    outputDir = path.join(process.cwd(), 'assets', 'generated'),
    filename, download = true, onProgress,
  } = opts;

  const taskId = await submit({ prompt, size, imageUrls });
  onProgress?.({ phase: 'submitted', task_id: taskId });

  const data = await pollUntilDone(taskId, {
    onProgress: (e) => onProgress?.({ phase: 'polling', ...e, task_id: taskId }),
  });

  const imgUrl = data?.result?.images?.[0]?.url?.[0];
  const expiresAt = data?.result?.images?.[0]?.expires_at;
  if (!imgUrl) throw new Error(`completed 但无 image url: ${JSON.stringify(data)}`);

  const result = {
    task_id: taskId,
    url: imgUrl,
    expires_at: expiresAt,
    expires_in_human: expiresAt ? new Date(expiresAt * 1000).toLocaleString() : null,
    actual_time_sec: data.actual_time,
    local_path: null,
    size_bytes: 0,
  };

  if (download) {
    try {
      const dl = await downloadImage(imgUrl, outputDir, filename || taskId, {
        onRetry: (r) => onProgress?.({ phase: 'download_retry', ...r, task_id: taskId }),
      });
      result.local_path = dl.local_path;
      result.size_bytes = dl.size_bytes;
      result.download_attempts = dl.attempts;
      onProgress?.({ phase: 'downloaded', ...dl, task_id: taskId });
    } catch (e) {
      // 🔴 关键铁律:下载失败不吞 URL · 用户 24h 内还能手动下
      result.download_error = e.message;
      result.local_path_intended = e.local_path_intended;
      onProgress?.({ phase: 'download_failed', error: e.message, url: imgUrl, task_id: taskId });
    }
  }

  return result;
}
