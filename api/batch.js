#!/usr/bin/env node
/**
 * 批量生成 · 全部 submit · 并行 poll · **强保落地**
 *
 *   - 每张生成完立刻下载(自动 3 次重试)
 *   - 下载失败也保留 URL · 24h 内可用 redownload.js 补下
 *   - 最后产出 manifest · 记录每张任务完整状态 · 可续传
 *
 * Usage:
 *   node api/batch.js <prompts.json> [--out <dir>] [--manifest <path>]
 *
 * prompts.json 格式:
 *   [
 *     { "prompt": "a cat", "size": "1:1",  "name": "cat-01" },
 *     { "prompt": "a dog", "size": "16:9", "name": "dog-01", "image_urls": ["..."] }
 *   ]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { generate } from './apimart.js';

const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith('--'));
function getOpt(flag) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; }

if (!file) {
  console.error('Usage: node api/batch.js <prompts.json> [--out <dir>] [--manifest <path>]');
  process.exit(1);
}

const outputDir = getOpt('--out') || path.join(process.cwd(), 'assets', 'generated');
const manifestPath = getOpt('--manifest') || path.join(outputDir, `manifest-${Date.now()}.json`);

const list = JSON.parse(await fs.readFile(file, 'utf8'));
console.log(`📦 批量任务 ${list.length} 条 · 并行提交 · 输出 → ${outputDir}`);
console.log(`📋 manifest → ${manifestPath}\n`);

await fs.mkdir(outputDir, { recursive: true });

const results = await Promise.allSettled(list.map(async (item, i) => {
  const label = `[#${i}${item.name ? ' ' + item.name : ''}]`;
  try {
    const r = await generate({
      prompt: item.prompt,
      size: item.size || '1:1',
      imageUrls: item.image_urls,
      filename: item.name || `batch-${Date.now()}-${i}`,
      outputDir,
      onProgress: (e) => {
        if (e.phase === 'submitted')        console.log(`${label} ✓ submitted · ${e.task_id}`);
        if (e.phase === 'download_retry')   console.log(`${label} 🔄 重试下载 ${e.attempt}/${e.max} · ${e.error}`);
        if (e.phase === 'downloaded')       console.log(`${label} ✅ 落地 ${e.local_path} (${(e.size_bytes/1024/1024).toFixed(2)} MB · ${e.attempts} 次尝试)`);
        if (e.phase === 'download_failed')  console.log(`${label} ⚠️  下载失败但 URL 还在 · ${e.error}`);
      },
    });
    return { index: i, prompt: item.prompt, ...r };
  } catch (e) {
    console.error(`${label} ❌ ${e.message}`);
    return { index: i, prompt: item.prompt, error: e.message, failed: true };
  }
}));

// === 产 manifest ===
const manifest = {
  generated_at: new Date().toISOString(),
  output_dir: outputDir,
  source: path.resolve(file),
  entries: results.map((r, i) => {
    const input = list[i];
    if (r.status === 'rejected') {
      return { index: i, prompt: input.prompt, name: input.name, status: 'unexpected_error', error: String(r.reason) };
    }
    const v = r.value;
    if (v.failed) {
      return { index: i, prompt: input.prompt, name: input.name, status: 'failed_before_url', error: v.error };
    }
    if (v.local_path) {
      return {
        index: i, prompt: input.prompt, name: input.name,
        status: 'done',
        task_id: v.task_id, url: v.url, expires_at: v.expires_at,
        local_path: v.local_path, size_bytes: v.size_bytes,
        actual_time_sec: v.actual_time_sec,
        download_attempts: v.download_attempts,
      };
    }
    // 生成 ok 但下载失败 · URL 还在 · 24h 内可补
    return {
      index: i, prompt: input.prompt, name: input.name,
      status: 'url_only_download_failed',
      task_id: v.task_id, url: v.url, expires_at: v.expires_at,
      local_path_intended: v.local_path_intended,
      download_error: v.download_error,
    };
  }),
};

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

// === 汇总 ===
const byStatus = manifest.entries.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
console.log(`\n📊 汇总 · 总 ${list.length} 条`);
for (const [k, v] of Object.entries(byStatus)) console.log(`   ${k}: ${v}`);

const pending = manifest.entries.filter(e => e.status === 'url_only_download_failed');
if (pending.length) {
  console.log(`\n⚠️  有 ${pending.length} 张下载失败但 URL 保住了 · 24h 内可补下:`);
  console.log(`   node api/redownload.js ${manifestPath}`);
}

const failed = manifest.entries.filter(e => e.status !== 'done').length;
process.exit(failed > 0 ? 2 : 0);
