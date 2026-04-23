#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(THIS_FILE), '..');
const TODO_PATH = path.join(ROOT, 'todo/atlas-todo.json');
const WORKS_ROOT = path.join(ROOT, 'works');
const LOCALES_PATH = path.join(WORKS_ROOT, 'locales.json');
const TAGS_PATH = path.join(WORKS_ROOT, 'tags.json');
const INDEX_PATH = path.join(WORKS_ROOT, 'index.json');

const FALLBACK_REQUIRED_LOCALES = ['en', 'zh-CN'];
const FORBIDDEN_PUBLIC_FIELDS = new Set([
  'task_id',
  'url',
  'local_path',
  'difficulty',
  'research_value',
  'spectacle_score',
  'evaluation',
  'source_todo_ref',
  'created_at',
  'done_at',
  'expires_at',
  'actual_time_sec',
  'size_bytes',
]);
const REQUIRED_PROMPT_SECTIONS = ['Scene:', 'Subject:', 'Important details:', 'Use case:', 'Constraints:'];

function usage() {
  console.log(`works · public gallery and private production maintenance

Usage:
  node tools/works.js validate [item-id]
  node tools/works.js build-index
  node tools/works.js check-public
  node tools/works.js generate <works/.../meta.json>
  node tools/works.js list [--todo-only] [--with-works]
  node tools/works.js show <item-id>
  node tools/works.js sync <item-id>
  node tools/works.js scaffold-package <item-id> <single|series> <package-slug> [--title "..."] [--image <slug>] [--count <n>]

Examples:
  node tools/works.js validate
  node tools/works.js build-index
  node tools/works.js check-public
  node tools/works.js generate works/S/S-19-sem-microscopy/packages/single-pollen-micro-city/images/pollen-micro-city/meta.json
  node tools/works.js scaffold-package A-13 single object-memory --title "Object Memory" --image object-memory
`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function fileExists(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}

function readJsonIfExists(file, fallback) {
  return fileExists(file) ? readJson(file) : fallback;
}

function requiredLocales() {
  const locales = readJsonIfExists(LOCALES_PATH, null);
  return locales?.required_locales || FALLBACK_REQUIRED_LOCALES;
}

function slugify(input) {
  return String(input)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function tierIdFromItemId(id) {
  const m = String(id).match(/^([A-Z])-/);
  if (!m) throw new Error(`Cannot infer tier from id: ${id}`);
  return m[1];
}

function todo() {
  if (!fileExists(TODO_PATH)) {
    throw new Error(`Private todo not found: ${rel(TODO_PATH)}. Public mode supports validate/build-index/check-public only.`);
  }
  return readJson(TODO_PATH);
}

function optionalTodo() {
  return fileExists(TODO_PATH) ? readJson(TODO_PATH) : null;
}

function findItem(data, id) {
  for (const tier of data.tiers || []) {
    for (const item of tier.items || []) {
      if (item.id === id) return { tier, item };
    }
  }
  return null;
}

function allItems(data) {
  const out = [];
  for (const tier of data.tiers || []) {
    for (const item of tier.items || []) out.push({ tier, item });
  }
  return out;
}

function topicSlugFor(item) {
  return item.works?.topic_slug || `${item.id}-${slugify(item.name.split('·')[0] || item.name)}`;
}

function topicPathFor(item) {
  const tier = tierIdFromItemId(item.id);
  return path.join(WORKS_ROOT, tier, topicSlugFor(item), 'topic.json');
}

function rel(file) {
  return path.relative(ROOT, file);
}

function walkFiles(dir, predicate, out = []) {
  if (!fileExists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(file, predicate, out);
    else if (!predicate || predicate(file)) out.push(file);
  }
  return out;
}

function topicFiles() {
  return walkFiles(WORKS_ROOT, (file) => path.basename(file) === 'topic.json').sort();
}

function assertNoForbiddenFields(value, file, errors, trail = []) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenFields(item, file, errors, [...trail, String(index)]));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PUBLIC_FIELDS.has(key)) {
      errors.push(`${file}: forbidden public field ${[...trail, key].join('.')}`);
    }
    assertNoForbiddenFields(child, file, errors, [...trail, key]);
  }
}

function validateLocalizedObject(file, value, errors) {
  const locales = requiredLocales();
  if (!value.i18n || typeof value.i18n !== 'object' || Array.isArray(value.i18n)) {
    errors.push(`${file}: missing i18n`);
    return;
  }
  for (const locale of locales) {
    const entry = value.i18n[locale];
    if (!entry) {
      errors.push(`${file}: missing i18n.${locale}`);
      continue;
    }
    if (typeof entry.title !== 'string' || !entry.title.trim()) {
      errors.push(`${file}: missing i18n.${locale}.title`);
    }
    if (typeof entry.description !== 'string' || !entry.description.trim()) {
      errors.push(`${file}: missing i18n.${locale}.description`);
    }
  }
}

function validateDisplayObject(file, value, errors, requireAlt = false) {
  if (!value.display || typeof value.display !== 'object' || Array.isArray(value.display)) {
    errors.push(`${file}: missing display`);
    return;
  }
  if (!Array.isArray(value.display.audiences)) {
    errors.push(`${file}: display.audiences must be an array`);
  }
  if (!Number.isFinite(value.display.sort_order)) {
    errors.push(`${file}: display.sort_order must be a number`);
  }
  if (requireAlt) {
    const locales = requiredLocales();
    for (const locale of locales) {
      if (typeof value.display.alt?.[locale] !== 'string' || !value.display.alt[locale].trim()) {
        errors.push(`${file}: missing display.alt.${locale}`);
      }
    }
  }
}

function validatePromptSections(file, prompt, errors) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    errors.push(`${file}: prompt must be a non-empty string`);
    return;
  }
  for (const section of REQUIRED_PROMPT_SECTIONS) {
    if (!prompt.includes(section)) errors.push(`${file}: prompt missing ${section}`);
  }
}

function validateTagManifest(errors) {
  const tags = readJsonIfExists(TAGS_PATH, null);
  if (!tags) return;
  const locales = requiredLocales();
  for (const [tag, value] of Object.entries(tags.tags || {})) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) errors.push(`${rel(TAGS_PATH)}: invalid tag slug ${tag}`);
    for (const locale of locales) {
      if (typeof value.labels?.[locale] !== 'string' || !value.labels[locale].trim()) {
        errors.push(`${rel(TAGS_PATH)}: missing tags.${tag}.labels.${locale}`);
      }
    }
  }
}

function scanTopic(item) {
  const topicPath = topicPathFor(item);
  if (!fileExists(topicPath)) return null;
  const topic = readJson(topicPath);
  const topicDir = path.dirname(topicPath);
  const packageEntries = [];
  for (const pkgRef of topic.packages || []) {
    const pkgPath = path.join(topicDir, pkgRef.path || `packages/${pkgRef.id}/package.json`);
    if (!fileExists(pkgPath)) {
      packageEntries.push({ missing: true, package_path: rel(pkgPath), package_slug: pkgRef.id || pkgRef.package_slug });
      continue;
    }
    const pkg = readJson(pkgPath);
    const images = Array.isArray(pkg.images) ? pkg.images : [];
    packageEntries.push({
      package_slug: pkg.id || pkg.package_slug,
      package_type: pkg.type || pkg.package_type,
      package_path: rel(pkgPath),
      image_count: images.length,
      creative_direction: pkg.creative_direction || null,
      missing: false,
    });
  }
  const series = packageEntries.filter((p) => p.package_type === 'series').length;
  const singles = packageEntries.filter((p) => p.package_type === 'single').length;
  const imageCount = packageEntries.reduce((sum, p) => sum + (p.image_count || 0), 0);
  return {
    topic_slug: path.basename(topicDir),
    topic_path: rel(topicPath),
    package_count: packageEntries.filter((p) => !p.missing).length,
    series_package_count: series,
    single_package_count: singles,
    image_count: imageCount,
    packages: packageEntries,
  };
}

function listItems(args) {
  const data = todo();
  const todoOnly = args.includes('--todo-only');
  const withWorks = args.includes('--with-works');
  for (const { item } of allItems(data)) {
    if (todoOnly && item.status !== 'todo') continue;
    const works = item.works;
    const suffix = withWorks
      ? ` works=${works ? `${works.package_count || 0}pkg/${works.image_count || 0}img` : 'none'}`
      : '';
    console.log(`${item.id}\t${item.status || 'todo'}\td${item.difficulty ?? '-'}\t${item.name}${suffix}`);
  }
}

function showItem(id) {
  const data = todo();
  const found = findItem(data, id);
  if (!found) throw new Error(`Item not found: ${id}`);
  console.log(JSON.stringify(found.item, null, 2));
}

function syncItem(id) {
  const data = todo();
  const found = findItem(data, id);
  if (!found) throw new Error(`Item not found: ${id}`);
  const works = scanTopic(found.item);
  if (!works) throw new Error(`No topic found for ${id}. Expected ${rel(topicPathFor(found.item))}`);
  const existingNote = found.item.works?.note;
  found.item.works = {
    ...works,
    note: existingNote || 'Synced from new/works.',
  };
  writeJson(TODO_PATH, data);
  console.log(`synced ${id}: ${works.package_count} packages, ${works.image_count} images`);
}

function validateItem(item, errors) {
  if (!item.works) return;
  const works = scanTopic(item);
  if (!works) {
    errors.push(`${item.id}: works present but topic missing`);
    return;
  }
  const expected = item.works;
  for (const key of ['package_count', 'series_package_count', 'single_package_count', 'image_count']) {
    if ((expected[key] || 0) !== (works[key] || 0)) {
      errors.push(`${item.id}: works.${key}=${expected[key]} but scanned=${works[key]}`);
    }
  }
  for (const pkg of works.packages) {
    if (pkg.missing) {
      errors.push(`${item.id}: missing package ${pkg.package_path}`);
      continue;
    }
    if (!pkg.creative_direction) errors.push(`${item.id}/${pkg.package_slug}: missing creative_direction`);
    const pkgJson = readJson(path.join(ROOT, pkg.package_path));
    const pkgRel = pkg.package_path;
    assertNoForbiddenFields(pkgJson, pkgRel, errors);
    validateLocalizedObject(pkgRel, pkgJson, errors);
    validateDisplayObject(pkgRel, pkgJson, errors);
    const pkgDir = path.dirname(path.join(ROOT, pkg.package_path));
    for (const image of pkgJson.images || []) {
      const metaRel = image.meta || image.path;
      if (!metaRel) {
        errors.push(`${item.id}/${pkg.package_slug}/${image.id}: missing meta path`);
        continue;
      }
      const metaPath = path.join(pkgDir, metaRel);
      let imagePath = image.image ? path.join(pkgDir, image.image) : path.join(path.dirname(metaPath), 'image.png');
      if (!fileExists(metaPath)) errors.push(`${item.id}/${pkg.package_slug}/${image.id}: missing meta.json`);
      if (fileExists(metaPath)) {
        const meta = readJson(metaPath);
        if (!image.image && meta.image) imagePath = path.join(path.dirname(metaPath), meta.image);
        for (const field of ['prompt', 'id', 'title', 'description', 'type', 'image', 'aspect_ratio', 'tags', 'refs']) {
          if (!(field in meta)) errors.push(`${rel(metaPath)}: missing ${field}`);
        }
        const firstKey = Object.keys(meta)[0];
        if (firstKey !== 'prompt') errors.push(`${rel(metaPath)}: prompt must be first key`);
        assertNoForbiddenFields(meta, rel(metaPath), errors);
        validateLocalizedObject(rel(metaPath), meta, errors);
        validateDisplayObject(rel(metaPath), meta, errors, true);
        validatePromptSections(rel(metaPath), meta.prompt, errors);
      }
      if (!fileExists(imagePath)) errors.push(`${item.id}/${pkg.package_slug}/${image.id}: missing image.png`);
    }
  }
}

function validateWorksTree(errors) {
  validateTagManifest(errors);
  for (const topicPath of topicFiles()) {
    const topic = readJson(topicPath);
    const topicRel = rel(topicPath);
    assertNoForbiddenFields(topic, topicRel, errors);
    for (const field of ['id', 'title', 'description', 'packages']) {
      if (!(field in topic)) errors.push(`${topicRel}: missing ${field}`);
    }
    validateLocalizedObject(topicRel, topic, errors);
    validateDisplayObject(topicRel, topic, errors);
    const topicDir = path.dirname(topicPath);
    for (const pkgRef of topic.packages || []) {
      const pkgPath = path.join(topicDir, pkgRef.path || `packages/${pkgRef.id}/package.json`);
      if (!fileExists(pkgPath)) {
        errors.push(`${topicRel}: missing package ${pkgRef.path || pkgRef.id}`);
      }
    }
  }
}

function validate(id) {
  const errors = [];
  const data = optionalTodo();
  if (id && !data) {
    throw new Error(`Private todo is required to validate one item: ${id}`);
  }
  if (id) {
    const found = findItem(data, id);
    if (!found) throw new Error(`Item not found: ${id}`);
    validateItem(found.item, errors);
  } else {
    if (data) {
      for (const { item } of allItems(data)) validateItem(item, errors);
    }
    validateWorksTree(errors);
  }
  if (errors.length) {
    for (const error of errors) console.error(`x ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(id ? `ok ${id}` : 'ok');
}

function topicTodoItemByTopicPath(data, topicPath) {
  if (!data) return null;
  const topicRel = rel(topicPath);
  return allItems(data).find(({ item }) => item.works?.topic_path === topicRel)?.item || null;
}

function imageEntryForIndex(topic, topicPath, pkg, pkgPath, imageRef, meta, metaPath) {
  const pkgDir = path.dirname(pkgPath);
  const imagePath = path.join(path.dirname(metaPath), meta.image || 'image.png');
  const imageRel = rel(imagePath);
  return {
    id: `${topic.id}/${pkg.id}/${meta.id}`,
    image_id: meta.id,
    package_id: pkg.id,
    topic_id: topic.id,
    tier: topic.id.split('-')[0],
    title: meta.title,
    description: meta.description,
    i18n: meta.i18n || {},
    display: meta.display || {},
    type: meta.type || pkg.type,
    aspect_ratio: meta.aspect_ratio,
    tags: meta.tags || [],
    refs: meta.refs || [],
    image: imageRel,
    meta_path: rel(metaPath),
    package_path: rel(pkgPath),
    topic_path: rel(topicPath),
    package_title: pkg.title,
    topic_title: topic.title,
    package_ref_image: imageRef.image ? rel(path.join(pkgDir, imageRef.image)) : imageRel,
  };
}

function buildIndex() {
  const data = optionalTodo();
  const existingIndex = readJsonIfExists(INDEX_PATH, {});
  const locales = readJsonIfExists(LOCALES_PATH, {
    default_locale: 'en',
    required_locales: FALLBACK_REQUIRED_LOCALES,
    supported_locales: FALLBACK_REQUIRED_LOCALES.map((code) => ({ code })),
  });
  const tags = readJsonIfExists(TAGS_PATH, { tags: {} });
  const topics = [];
  const packages = [];
  const images = [];

  for (const topicPath of topicFiles()) {
    const topic = readJson(topicPath);
    const topicDir = path.dirname(topicPath);
    const item = topicTodoItemByTopicPath(data, topicPath);
    const topicPackages = [];

    for (const pkgRef of topic.packages || []) {
      const pkgPath = path.join(topicDir, pkgRef.path || `packages/${pkgRef.id}/package.json`);
      if (!fileExists(pkgPath)) continue;
      const pkg = readJson(pkgPath);
      const pkgDir = path.dirname(pkgPath);
      const packageImages = [];
      for (const imageRef of pkg.images || []) {
        const metaRel = imageRef.meta || imageRef.path;
        if (!metaRel) continue;
        const metaPath = path.join(pkgDir, metaRel);
        if (!fileExists(metaPath)) continue;
        const meta = readJson(metaPath);
        const indexed = imageEntryForIndex(topic, topicPath, pkg, pkgPath, imageRef, meta, metaPath);
        images.push(indexed);
        packageImages.push(indexed.id);
      }
      const indexedPkg = {
        id: pkg.id,
        topic_id: topic.id,
        tier: topic.id.split('-')[0],
        type: pkg.type,
        title: pkg.title,
        description: pkg.description,
        creative_direction: pkg.creative_direction,
        i18n: pkg.i18n || {},
        display: pkg.display || {},
        cover_image: pkg.cover_image ? rel(path.join(pkgDir, pkg.cover_image)) : null,
        image_count: packageImages.length,
        images: packageImages,
        package_path: rel(pkgPath),
        topic_path: rel(topicPath),
      };
      packages.push(indexedPkg);
      topicPackages.push(indexedPkg.id);
    }

    topics.push({
      id: topic.id,
      todo_id: item?.id || topic.id.split('-').slice(0, 2).join('-'),
      tier: topic.id.split('-')[0],
      title: topic.title,
      description: topic.description,
      i18n: topic.i18n || {},
      display: topic.display || {},
      package_count: topicPackages.length,
      image_count: packages
        .filter((pkg) => pkg.topic_id === topic.id)
        .reduce((sum, pkg) => sum + pkg.image_count, 0),
      packages: topicPackages,
      topic_path: rel(topicPath),
    });
  }

  const index = {
    generated_at: existingIndex.generated_at || new Date().toISOString(),
    schema_version: 1,
    default_locale: locales.default_locale || 'en',
    required_locales: locales.required_locales || FALLBACK_REQUIRED_LOCALES,
    supported_locales: locales.supported_locales || [],
    tag_labels: tags.tags || {},
    stats: {
      topic_count: topics.length,
      package_count: packages.length,
      image_count: images.length,
    },
    topics,
    packages,
    images,
  };
  writeJson(INDEX_PATH, index);
  console.log(`built ${rel(INDEX_PATH)}: ${topics.length} topics, ${packages.length} packages, ${images.length} images`);
}

function getArg(args, name, fallback = undefined) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

function generateImage(args) {
  const metaArg = args[0];
  if (!metaArg) throw new Error('Usage: generate <works/.../meta.json>');
  const metaPath = path.resolve(ROOT, metaArg);
  if (!metaPath.startsWith(WORKS_ROOT + path.sep)) {
    throw new Error(`Meta path must be inside works/: ${metaArg}`);
  }
  if (!fileExists(metaPath)) throw new Error(`Missing meta.json: ${metaArg}`);
  const meta = readJson(metaPath);
  const errors = [];
  validatePromptSections(rel(metaPath), meta.prompt, errors);
  if (errors.length) throw new Error(errors.join('\n'));
  const outDir = path.dirname(metaPath);
  execFileSync('image2gen', [
    meta.prompt,
    '--size',
    meta.aspect_ratio || '1:1',
    '--out',
    outDir,
    '--name',
    path.basename(meta.image || 'image.png', '.png'),
  ], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function checkPublic() {
  const errors = [];
  validateWorksTree(errors);
  const privatePathPatterns = [
    /^new\/todo\//,
    /^new\/prototype\//,
    /^new\/research-materials\//,
    /^content\//,
    /^assets\//,
    /^api\//,
    /^docs\//,
    /^frontend\//,
    /^src\//,
    /^spec\//,
    /^\.claude\//,
  ];
  try {
    const tracked = execFileSync('git', ['ls-files'], {
      cwd: path.resolve(ROOT, '..'),
      encoding: 'utf8',
    }).split('\n').filter(Boolean);
    for (const file of tracked) {
      if (privatePathPatterns.some((pattern) => pattern.test(file))) {
        errors.push(`private or legacy file is tracked: ${file}`);
      }
    }
  } catch {
    // Not a git checkout. Schema validation above still gives useful public checks.
  }
  if (errors.length) {
    for (const error of errors) console.error(`x ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('ok public boundary');
}

function scaffoldPackage(args) {
  const [id, type, packageSlug] = args;
  if (!id || !type || !packageSlug || !['single', 'series'].includes(type)) {
    throw new Error('Usage: scaffold-package <item-id> <single|series> <package-slug> [--title "..."] [--image <slug>] [--count <n>]');
  }
  const data = todo();
  const found = findItem(data, id);
  if (!found) throw new Error(`Item not found: ${id}`);
  const item = found.item;
  const tier = tierIdFromItemId(id);
  const topicSlug = topicSlugFor(item);
  const topicDir = path.join(WORKS_ROOT, tier, topicSlug);
  const topicPath = path.join(topicDir, 'topic.json');
  const title = getArg(args, '--title', packageSlug.split('-').map((s) => s[0]?.toUpperCase() + s.slice(1)).join(' '));
  const count = Number(getArg(args, '--count', type === 'series' ? '3' : '1'));
  const baseImageSlug = getArg(args, '--image', type === 'series' ? '01-image' : 'hero');
  const fullPackageSlug = packageSlug.startsWith(`${type}-`) ? packageSlug : `${type}-${packageSlug}`;
  const pkgDir = path.join(topicDir, 'packages', fullPackageSlug);
  const pkgPath = path.join(pkgDir, 'package.json');
  if (fileExists(pkgPath)) throw new Error(`Package already exists: ${rel(pkgPath)}`);

  let topic = fileExists(topicPath)
    ? readJson(topicPath)
    : {
        id: topicSlug,
        title: item.name,
      description: item.example || item.dimension || '',
      i18n: {
        en: {
          title: item.name,
          description: item.example || item.dimension || '',
        },
        'zh-CN': {
          title: item.name,
          description: item.example || item.dimension || '',
        },
      },
      display: {
        featured: false,
        sort_order: 100,
        audiences: ['gallery'],
      },
      packages: [],
    };
  topic.packages = topic.packages || [];
  topic.packages.push({
    id: fullPackageSlug,
    type,
    title,
    path: `packages/${fullPackageSlug}/package.json`,
  });
  writeJson(topicPath, topic);

  const imageSlugs = [];
  for (let i = 1; i <= count; i++) {
    if (type === 'single') imageSlugs.push(baseImageSlug);
    else {
      const base = baseImageSlug.replace(/^\d+-/, '');
      imageSlugs.push(`${String(i).padStart(2, '0')}-${base}`);
    }
  }

  const images = imageSlugs.map((slug) => ({
    id: slug,
    title: slug.split('-').map((s) => s[0]?.toUpperCase() + s.slice(1)).join(' '),
    image: `images/${slug}/image.png`,
    meta: `images/${slug}/meta.json`,
  }));
  const pkg = {
    id: fullPackageSlug,
    type,
    title,
    description: '',
    creative_direction: 'TODO: explain how this package differs from existing packages under this topic.',
    cover_image: images[0]?.image || null,
    i18n: {
      en: {
        title,
        description: '',
      },
      'zh-CN': {
        title,
        description: '',
      },
    },
    display: {
      featured: false,
      sort_order: 100,
      audiences: ['gallery'],
    },
    images,
  };
  writeJson(pkgPath, pkg);

  for (const image of images) {
    const imageDir = path.join(pkgDir, 'images', image.id);
    writeJson(path.join(imageDir, 'meta.json'), {
      prompt: 'Scene: TODO\n\nSubject: TODO\n\nImportant details: TODO\n\nUse case: TODO\n\nConstraints: TODO',
      id: image.id,
      title: image.title,
      description: '',
      type,
      image: 'image.png',
      aspect_ratio: '16:9',
      tags: [],
      refs: [],
      i18n: {
        en: {
          title: image.title,
          description: '',
        },
        'zh-CN': {
          title: image.title,
          description: '',
        },
      },
      display: {
        featured: false,
        sort_order: 100,
        audiences: ['gallery'],
        alt: {
          en: image.title,
          'zh-CN': image.title,
        },
      },
    });
  }

  const scanned = scanTopic(item) || {
    topic_slug: topicSlug,
    topic_path: rel(topicPath),
    package_count: 0,
    series_package_count: 0,
    single_package_count: 0,
    image_count: 0,
    packages: [],
  };
  item.works = {
    ...scanned,
    note: item.works?.note || 'Package scaffolded; fill creative_direction, prompts, then generate images.',
  };
  writeJson(TODO_PATH, data);
  console.log(`created ${rel(pkgPath)}`);
}

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || ['-h', '--help', 'help'].includes(command)) usage();
  else if (command === 'list') listItems(args);
  else if (command === 'show') showItem(args[0]);
  else if (command === 'sync') syncItem(args[0]);
  else if (command === 'validate') validate(args[0]);
  else if (command === 'build-index') buildIndex();
  else if (command === 'check-public') checkPublic();
  else if (command === 'generate') generateImage(args);
  else if (command === 'scaffold-package') scaffoldPackage(args);
  else throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
