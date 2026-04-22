#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const examplesDir = path.join(rootDir, 'content', 'examples');
const dataDir = path.join(rootDir, 'data');
const outFile = path.join(dataDir, 'images.json');

const CAT_MAP = {
  portrait: '人像',
  poster: '海报',
  comic: '漫画',
  manga: '漫画',
  environment: '环境',
  'politics-satire': '海报',
};

const STYLE_MAP = {
  '01-moba-midlane-satire': 'cartoon-3d-moba-satire',
  '02-manga-4panel-deep-night': 'manga-screentone',
};

const FALLBACK_META = {
  '01-moba-midlane-satire': {
    title: 'MOBA 中路讽刺梗图',
    title_en: 'MOBA Midlane Satire',
    style: 'cartoon-3d-moba-satire',
    aspect: '16:9',
    category: '海报',
  },
  '02-manga-4panel-deep-night': {
    title: '4 格漫画 · 深夜代码战',
    title_en: 'Deep Night Debug',
    style: 'manga-screentone',
    aspect: '9:16',
    category: '漫画',
  },
};

function parseValue(raw) {
  let value = raw.trim();
  const commentIndex = value.search(/\s+#/);
  if (commentIndex >= 0) value = value.slice(0, commentIndex).trim();
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((item) => parseValue(item.trim()));
  }
  return value;
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return {};
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return {};

  const body = markdown.slice(3, end);
  const meta = {};
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    meta[match[1]] = parseValue(match[2]);
  }
  return meta;
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return markdown;
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return markdown;
  return markdown.slice(end + 4);
}

function extractHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function splitBilingualTitle(rawTitle) {
  const title = rawTitle
    .replace(/^示例\s*\d+\s*[·.]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const parts = title.split(/\s*·\s*/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const second = parts.slice(1).join(' · ');
    const firstHasCjk = /[\u3400-\u9fff]/.test(first);
    const secondHasCjk = /[\u3400-\u9fff]/.test(second);
    return {
      title: firstHasCjk ? first : second,
      title_en: !firstHasCjk ? first : (secondHasCjk ? second : second),
    };
  }
  return { title, title_en: title };
}

function extractTags(markdown, meta) {
  if (Array.isArray(meta.tags)) return meta.tags.map(String);
  const match = markdown.match(/\*\*分类标签\*\*:\s*([^\n]+)/);
  if (!match) return [];
  return Array.from(match[1].matchAll(/`([^`]+)`/g)).map((item) => item[1]);
}

function extractPrompt(markdown) {
  const blocks = Array.from(markdown.matchAll(/```(?:yaml)?\s*\r?\n([\s\S]*?)```/g));
  if (!blocks.length) return '';

  const promptLike = blocks.find((block) => {
    const before = markdown.slice(Math.max(0, block.index - 260), block.index);
    return /Prompt|结构化|字段视图|用户看|复制/i.test(before);
  });
  return (promptLike || blocks[0])[1].trim();
}

function extractAspect(prompt, meta) {
  if (meta.aspect) return String(meta.aspect);
  const candidates = [
    /aspect_ratio:\s*["']?([0-9]+:[0-9]+)["']?/i,
    /aspect ratio\s+([0-9]+:[0-9]+)/i,
    /Aspect ratio\s+([0-9]+:[0-9]+)/i,
    /aspect:\s*["']?([0-9]+:[0-9]+)["']?/i,
  ];
  for (const re of candidates) {
    const match = prompt.match(re);
    if (match) return match[1];
  }
  return '';
}

function pickStyle(meta, tags, id, prompt) {
  if (meta.style) return String(meta.style);
  if (STYLE_MAP[id]) return STYLE_MAP[id];
  const joinedTags = tags.join(' ');
  if (/manga|comic|webtoon/i.test(joinedTags)) return 'manga';
  if (/cyberpunk|neon/i.test(joinedTags)) return 'cyberpunk';
  if (/showa|retro|vintage/i.test(joinedTags)) return 'retro-poster';
  if (/portrait/i.test(joinedTags) || /portrait/i.test(prompt)) return 'portrait';
  return meta.intent ? String(meta.intent) : '';
}

function pickCategory(meta, tags, prompt) {
  if (meta.category && CAT_MAP[meta.category]) return CAT_MAP[meta.category];
  if (tags.some((tag) => /manga|comic|webtoon|4-panel/.test(tag))) return '漫画';
  if (tags.some((tag) => /portrait/.test(tag))) return '人像';
  if (tags.some((tag) => /environment|teahouse|konbini|storefront/.test(tag))) return '环境';
  if (/comic|manga|4-panel/i.test(prompt)) return '漫画';
  return '海报';
}

function extractPalette(prompt) {
  return Array.from(new Set(Array.from(prompt.matchAll(/#[0-9a-fA-F]{6}\b/g)).map((item) => item[0].toLowerCase()))).slice(0, 6);
}

function extractSubject(prompt, title) {
  const subjectMatch = prompt.match(/subject:\s*\n([\s\S]*?)(?:\n#|(?:\n[A-Za-z_]+:\s*\n))/i);
  if (subjectMatch) return subjectMatch[1].trim().split(/\r?\n/).slice(0, 4).join(' ').replace(/\s+/g, ' ');
  const firstSentence = prompt.split(/\n|\./).map((part) => part.trim()).find(Boolean);
  return firstSentence || title;
}

function extractLighting(prompt) {
  const match = prompt.match(/(?:lighting|light_sources|光照):\s*(?:"([^"]+)"|([^\n]+))/i);
  if (match) return (match[1] || match[2]).trim();
  const sentence = prompt.split(/\n/).find((line) => /light|lighting|sunlight|neon|glow|晨光|黄昏|霓虹/i.test(line));
  return sentence ? sentence.trim() : '';
}

function extractExcludes(prompt) {
  const excludeSection = prompt.match(/(?:exclude|Exclude|fail_modes_to_avoid):\s*(?:\n([\s\S]*?)(?:\n\n|# ═|$)|([^\n]+))/);
  const raw = (excludeSection && (excludeSection[1] || excludeSection[2])) || '';
  const quoted = Array.from(raw.matchAll(/"([^"]+)"/g)).map((item) => item[1]);
  if (quoted.length) return quoted.slice(0, 10);
  return raw
    .split(/\r?\n|;|,/) 
    .map((line) => line.replace(/^[-\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 10);
}

function buildImage(fileName) {
  const filePath = path.join(examplesDir, fileName);
  const markdown = fs.readFileSync(filePath, 'utf8');
  const body = stripFrontmatter(markdown);
  const meta = parseFrontmatter(markdown);
  const id = String(meta.id || path.basename(fileName, '.md'));
  const fallback = FALLBACK_META[id] || {};
  const heading = extractHeading(body);
  const titles = splitBilingualTitle(String(meta.name || heading || fallback.title || id));
  const tags = extractTags(markdown, meta);
  const prompt = extractPrompt(body);
  const aspect = extractAspect(prompt, meta) || fallback.aspect || '';
  const style = pickStyle(meta, tags, id, prompt) || fallback.style || '';
  const category = fallback.category || pickCategory(meta, tags, prompt);

  return {
    id,
    title: fallback.title || titles.title,
    title_en: fallback.title_en || titles.title_en,
    prompt,
    tags,
    style,
    aspect,
    image_url: null,
    category,
    model: String(meta.model || 'gpt-image-2'),
    author_model: 'prompt-atlas',
    likes: 0,
    source_md: `content/examples/${fileName}`,
    atoms: {
      subject: extractSubject(prompt, fallback.title || titles.title),
      style_signatures: tags.slice(0, 6),
      color_palette: extractPalette(prompt),
      lighting: extractLighting(prompt),
      exclude: extractExcludes(prompt),
    },
  };
}

function main() {
  const files = fs.readdirSync(examplesDir)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const images = files.map(buildImage);

  const payload = {
    schema_version: 'v0.2',
    product: 'prompt-atlas',
    display_name: 'GPT Image 2 Hub',
    source: 'content/examples/*.md',
    generated_by: 'tools/build-images-json.js',
    image_count: images.length,
    images,
  };

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  for (const image of images) {
    console.log(`[images] ${image.id} · ${image.title} · ${image.aspect || 'no-aspect'} · ${image.tags.length} tags`);
  }
  console.log(`[images] wrote ${path.relative(rootDir, outFile)} · ${images.length} images`);
}

main();
