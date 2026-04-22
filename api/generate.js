#!/usr/bin/env node
import { generate, VALID_SIZES } from './apimart.js';

const argv = process.argv.slice(2);

function usage() {
  console.log(`
Usage:
  npm run gen -- "<prompt>" [options]
  node api/generate.js "<prompt>" [options]

Options:
  --size <ratio>     图片比例(默认 1:1)
                     可选: ${VALID_SIZES.join(' / ')}
  --ref <url>        图生图参考图(可多次传 · 最多 16 张 · URL 或 base64 data URI)
  --name <filename>  保存本地文件名(默认用 task_id)
  --out <dir>        输出目录(默认 assets/generated)
  --no-download      只返回 URL 不下载(不推荐 · 图 24h 过期)

Examples:
  npm run gen -- "a corgi astronaut on the moon, cinematic"
  npm run gen -- "水彩画 一只橘猫" --size 16:9
  npm run gen -- "把这张变成水彩风" --ref https://example.com/p.jpg
`);
}

function getOpt(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}
function getAllOpts(flag) {
  const out = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === flag && argv[i + 1]) out.push(argv[i + 1]);
  return out;
}

const prompt = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);

if (!prompt || argv.includes('-h') || argv.includes('--help')) {
  usage();
  process.exit(prompt ? 0 : 1);
}

const size = getOpt('--size') || '1:1';
const refs = getAllOpts('--ref');
const filename = getOpt('--name');
const outputDir = getOpt('--out');
const download = !argv.includes('--no-download');

console.log(`🎨 prompt: ${prompt}`);
console.log(`📐 size:   ${size}`);
if (refs.length) console.log(`🖼️  refs:   ${refs.length} 张`);

const startTs = Date.now();

try {
  const r = await generate({
    prompt, size,
    imageUrls: refs.length ? refs : undefined,
    filename, outputDir, download,
    onProgress: (e) => {
      if (e.phase === 'submitted') console.log(`✓ submitted · task_id=${e.task_id}`);
      if (e.phase === 'polling') process.stdout.write(`\r⏳ [${e.count}] ${e.status} ${e.progress}%    `);
      if (e.phase === 'downloaded') process.stdout.write('\n');
    },
  });

  const elapsed = ((Date.now() - startTs) / 1000).toFixed(1);
  console.log(`\n✅ 完成 · 用时 ${elapsed}s(API ${r.actual_time_sec}s)`);
  console.log(`   task_id: ${r.task_id}`);
  console.log(`   URL (24h 过期): ${r.url}`);
  if (r.local_path) {
    console.log(`   本地: ${r.local_path} (${(r.size_bytes / 1024 / 1024).toFixed(2)} MB)`);
  }
  if (r.expires_in_human) console.log(`   过期: ${r.expires_in_human}`);
} catch (e) {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
}
