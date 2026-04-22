#!/usr/bin/env node
/**
 * 从 batch manifest.json 重下载未落地的图(URL 24h 内仍有效)
 *
 * Usage:
 *   node api/redownload.js <manifest.json>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadImage } from './apimart.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node api/redownload.js <manifest.json>');
  process.exit(1);
}

const manifest = JSON.parse(await fs.readFile(file, 'utf8'));
const entries = manifest.entries || manifest; // 兼容直接 array
const pending = entries.filter(e => e.status === 'url_only_download_failed' && e.url);

if (!pending.length) {
  console.log('✅ 无需重下 · 所有条目都已落地');
  process.exit(0);
}

console.log(`🔄 补下 ${pending.length} 张`);

let ok = 0, fail = 0;
for (const e of pending) {
  const outDir = path.dirname(e.local_path_intended || path.join(manifest.output_dir || 'assets/generated', 'x'));
  const name = path.basename(e.local_path_intended || `${e.task_id}.png`);
  const checkExpired = e.expires_at && Date.now() / 1000 > e.expires_at;
  if (checkExpired) {
    console.log(`[#${e.index}] ⛔ URL 已过期(${new Date(e.expires_at * 1000).toLocaleString()}) · 跳过`);
    fail++;
    continue;
  }
  try {
    const dl = await downloadImage(e.url, outDir, name, {
      onRetry: (r) => console.log(`[#${e.index}] 🔄 重试 ${r.attempt}/${r.max} · ${r.error}`),
    });
    console.log(`[#${e.index}] ✅ ${dl.local_path} (${(dl.size_bytes/1024/1024).toFixed(2)} MB)`);
    e.status = 'done';
    e.local_path = dl.local_path;
    e.size_bytes = dl.size_bytes;
    delete e.download_error;
    delete e.local_path_intended;
    ok++;
  } catch (err) {
    console.error(`[#${e.index}] ❌ ${err.message}`);
    fail++;
  }
}

// 写回 manifest
await fs.writeFile(file, JSON.stringify(manifest, null, 2));
console.log(`\n📊 补下完成 · ok=${ok} fail=${fail}`);
process.exit(fail > 0 ? 2 : 0);
