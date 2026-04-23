import './styles.css';

const DATA_URL = './works/index.json';
const LANG_KEY = 'prompt-atlas-lang';
const HERO_IMAGE = '/hero-rose-v2.png';

const TOPIC_ICONS = {
  'crystal-ball-narrative': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="10" r="6"/><path d="M8 16l-2 5h12l-2-5"/></svg>',
  'high-speed-freeze': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="4" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="20"/></svg>',
  'tessellation-pattern': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
};

const GENERIC_TOPIC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8v8H8z"/></svg>';

const UI = {
  'zh-CN': {
    all: '全部',
    empty: '没有匹配的作品。',
    copied: '提示词已复制',
    promptLabel: '提示词',
    copy: '复制',
    series: '合集',
    single: '单图',
    searchPh: '搜索图片、提示词、主题或标签',
    loading: 'Loading...',
    latest: '最新',
    heroTitle: 'AI <em>视觉灵感</em>库',
    heroSub: '基于 gpt-image-2 的高级玩法图鉴 · 真图 + 一键复刻提示词',
    heroCta: '探索全部',
    navHome: '首页',
    navExplore: '探索',
    navFavorites: '收藏',
    navCreate: '创作',
    navInspire: '灵感',
    sectionTopics: '分类',
    darkMode: '深色模式',
  },
  en: {
    all: 'All',
    empty: 'No matching works.',
    copied: 'Prompt copied',
    promptLabel: 'Prompt',
    copy: 'Copy',
    series: 'Series',
    single: 'Single',
    searchPh: 'Search images, prompts, topics or tags',
    loading: 'Loading...',
    latest: 'Latest',
    heroTitle: 'AI <em>Visual Inspiration</em> Library',
    heroSub: 'A gpt-image-2 atlas with real images and reusable prompts',
    heroCta: 'Explore all',
    navHome: 'Home',
    navExplore: 'Explore',
    navFavorites: 'Saved',
    navCreate: 'Create',
    navInspire: 'Inspire',
    sectionTopics: 'Topics',
    darkMode: 'Dark mode',
  },
};

const LANGS = [
  { id: 'zh-CN', label: '简体中文' },
  { id: 'en', label: 'English' },
];

const state = {
  data: null,
  lang: normalizeLang(localStorage.getItem(LANG_KEY) || 'zh-CN'),
  activeTopic: 'all',
  search: '',
  modal: null,
  promptCache: new Map(),
};

let topicMap = new Map();
let packageMap = new Map();
let peersMap = new Map();
let suppressHash = false;

const app = document.querySelector('#app');
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function normalizeLang(lang) {
  return LANGS.some((item) => item.id === lang) ? lang : 'zh-CN';
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function t(key) {
  return (UI[state.lang] || UI['zh-CN'])[key] || UI['zh-CN'][key] || key;
}

function isZh() {
  return state.lang === 'zh-CN';
}

function localized(item, field) {
  return item?.i18n?.[state.lang]?.[field]
    || item?.i18n?.en?.[field]
    || item?.i18n?.['zh-CN']?.[field]
    || item?.[field]
    || '';
}

function titleOf(image) {
  return localized(image, 'title') || image.title || image.id;
}

function secondaryTitleOf(image) {
  if (isZh()) return image?.i18n?.en?.title || image.title || '';
  return image?.i18n?.['zh-CN']?.title || image.title || '';
}

function topicLabel(topic) {
  return localized(topic, 'title') || topic?.title || topic?.id || '';
}

function packageLabel(pack) {
  return localized(pack, 'title') || pack?.title || pack?.id || '';
}

function tagLabel(tag) {
  return state.data?.tag_labels?.[tag]?.labels?.[state.lang]
    || state.data?.tag_labels?.[tag]?.labels?.en
    || tag;
}

function imageUrl(path) {
  if (!path) return '';
  return `./${String(path).replace(/^\.?\//, '')}`;
}

function ratio(value) {
  return String(value || '1:1').replace(':', '/');
}

function hashHue(value) {
  let h = 0;
  for (const char of String(value)) h = (h * 31 + char.charCodeAt(0)) & 0xffff;
  return h % 360;
}

function topicOf(image) {
  return topicMap.get(image.topic_id);
}

function packageOf(image) {
  return packageMap.get(image.package_id);
}

function peersOf(image) {
  return peersMap.get(image.package_id) || [image];
}

function isSeries(image) {
  return image.type === 'series';
}

function buildIndexes() {
  topicMap = new Map((state.data?.topics || []).map((topic) => [topic.id, topic]));
  packageMap = new Map((state.data?.packages || []).map((pack) => [pack.id, pack]));
  peersMap = new Map();

  for (const image of state.data?.images || []) {
    if (!peersMap.has(image.package_id)) peersMap.set(image.package_id, []);
    peersMap.get(image.package_id).push(image);
  }

  for (const peers of peersMap.values()) {
    peers.sort((a, b) => {
      const ao = Number(a.generation?.order ?? 0);
      const bo = Number(b.generation?.order ?? 0);
      return ao - bo || String(a.id).localeCompare(String(b.id));
    });
  }
}

function renderShell() {
  app.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <a class="brand" href="./" aria-label="home">
          <span class="brand-mark"></span>
          <span class="brand-name">GPT Image 2 Hub</span>
        </a>

        <nav class="nav" aria-label="primary">
          <button class="nav-item active" data-nav="home" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
            ${esc(t('navHome'))}
          </button>
          <button class="nav-item" data-nav="explore" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.09 8.91-2.36 4.9-4.9 2.36 2.36-4.9z"/></svg>
            ${esc(t('navExplore'))}
          </button>
          <button class="nav-item" data-nav="favorites" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${esc(t('navFavorites'))}
          </button>
          <button class="nav-item" data-nav="create" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            ${esc(t('navCreate'))}
          </button>
          <button class="nav-item" data-nav="inspire" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z"/></svg>
            ${esc(t('navInspire'))}
          </button>
        </nav>

        <div class="section-label">${esc(t('sectionTopics'))}</div>
        <nav class="topics" id="topics-nav" aria-label="topics"></nav>

        <div class="sidebar-bottom">
          <div class="theme-toggle" role="button" tabindex="0">
            <span class="theme-toggle-icon"></span>
            <span class="theme-toggle-label">${esc(t('darkMode'))}</span>
            <span class="theme-switch"></span>
          </div>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <label class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="search" placeholder="${esc(t('searchPh'))}" value="${esc(state.search)}" />
          </label>
          <div class="top-right">
            <a class="icon-btn" href="https://github.com" target="_blank" rel="noopener" aria-label="github">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.55 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18A11 11 0 0 1 12 6.8c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.02 2.8-.02 3.18 0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>
            </a>
            <button class="icon-btn" aria-label="notifications" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="dot"></span>
            </button>
            <button class="lang-btn" id="lang-btn" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span id="lang-label">${esc(currentLangLabel())}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </header>

        <section class="hero">
          <img class="hero-img" src="${HERO_IMAGE}" alt="AI 视觉灵感库 Hero" />
          <div class="hero-text">
            <h1 class="hero-title">${t('heroTitle')}</h1>
            <p class="hero-sub">${esc(t('heroSub'))}</p>
            <button class="hero-cta" id="hero-cta" type="button">
              ${esc(t('heroCta'))}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </section>

        <div class="filter-bar" id="filter-bar-anchor">
          <div class="filter-pills" id="filter-pills"></div>
          <div class="filter-right">
            <button class="sort-btn" id="sort-btn" type="button">
              <span id="sort-label">${esc(t('latest'))}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button class="view-btn active" aria-label="grid" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
          </div>
        </div>

        <section class="waterfall" id="waterfall" aria-label="works"></section>
        <div class="foot">✨ GPT Image 2 Hub · AI 生图灵感图鉴</div>
      </main>
    </div>

    <div class="modal-scrim" id="scrim" aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal-close" id="m-close" type="button" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="modal-media">
          <img id="m-img" alt="" />
          <button class="nav-arrow prev" id="m-prev" type="button" aria-label="prev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="nav-arrow next" id="m-next" type="button" aria-label="next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="modal-side">
          <div class="modal-eyebrow" id="m-eyebrow">
            <span class="dot"></span>
            <span id="m-eyebrow-text"></span>
            <span class="pos" id="m-pos"></span>
            <div class="series-dots" id="m-dots"></div>
          </div>
          <h1 class="modal-title" id="m-title"></h1>
          <p class="modal-en" id="m-en"></p>
          <div class="modal-pills" id="m-pills"></div>
          <div class="tag-cloud" id="m-tags"></div>
          <div class="prompt-head">
            <span class="prompt-label" id="m-prompt-label">${esc(t('promptLabel'))}</span>
            <button class="copy-big" id="m-copy" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span id="m-copy-label">${esc(t('copy'))}</span>
            </button>
          </div>
          <pre class="prompt-text" id="m-prompt"></pre>
          <div class="fab-group">
            <a class="fab" id="m-open" href="#" target="_blank" rel="noopener" aria-label="open in new window">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <a class="fab" id="m-download" download aria-label="download">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="toast" id="toast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span id="toast-text">已复制</span>
    </div>
  `;
}

function currentLangLabel() {
  return LANGS.find((lang) => lang.id === state.lang)?.label || '简体中文';
}

function topicItems() {
  const images = state.data?.images || [];
  return [
    {
      id: 'all',
      label: t('all'),
      count: images.length,
      icon: GENERIC_TOPIC_ICON,
    },
    ...(state.data?.topics || []).map((topic) => ({
      id: topic.id,
      label: topicLabel(topic),
      count: Number(topic.image_count || images.filter((image) => image.topic_id === topic.id).length),
      icon: TOPIC_ICONS[topic.id] || GENERIC_TOPIC_ICON,
    })),
  ];
}

function renderTopicsNav() {
  const nav = $('#topics-nav');
  if (!nav) return;
  nav.innerHTML = topicItems().map((item) => `
    <button class="topic-item ${item.id === state.activeTopic ? 'active' : ''}" data-topic="${esc(item.id)}" type="button">
      ${item.icon}
      <span>${esc(item.label)}</span>
      <span class="topic-count">${item.count}</span>
    </button>
  `).join('');
}

function renderFilterPills() {
  const bar = $('#filter-pills');
  if (!bar) return;
  bar.innerHTML = topicItems().map((item) => `
    <button class="filter-pill ${item.id === state.activeTopic ? 'active' : ''}" data-topic="${esc(item.id)}" type="button">
      <span>${esc(item.label)}</span>
      <span class="count">${item.count}</span>
    </button>
  `).join('');
}

function filteredImages() {
  const q = state.search.trim().toLowerCase();
  return (state.data?.images || []).filter((image) => {
    if (state.activeTopic !== 'all' && image.topic_id !== state.activeTopic) return false;
    if (!q) return true;

    const topic = topicOf(image);
    const pack = packageOf(image);
    const hay = [
      titleOf(image),
      image?.i18n?.en?.title,
      image?.title,
      packageLabel(pack),
      pack?.i18n?.en?.title,
      image.package_title,
      topicLabel(topic),
      topic?.i18n?.en?.title,
      image.topic_title,
      ...(image.tags || []).map((tag) => `${tag} ${tagLabel(tag)}`),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function renderCard(image) {
  const topic = topicOf(image);
  const pack = packageOf(image);
  const peers = isSeries(image) ? peersOf(image) : null;
  const primaryTitle = titleOf(image);
  const secondaryTitle = secondaryTitleOf(image);
  const packageTitle = packageLabel(pack);
  return `
    <article class="card" data-id="${esc(image.id)}" style="--hue:${hashHue(image.id)}">
      <div class="cover" style="--ar:${ratio(image.aspect_ratio)}">
        <img src="${esc(imageUrl(image.image))}" alt="${esc(image.display?.alt?.[state.lang] || primaryTitle)}" loading="lazy" onerror="this.classList.add('failed')" />
        <div class="cover-placeholder">🎨</div>
        <span class="tier-pill type-${esc(image.type)}">${esc(isSeries(image) ? t('series') : t('single'))}</span>
        ${peers && peers.length > 1 ? `
          <span class="series-badge" title="${esc(`${packageTitle} · ${peers.length}`)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M8 21h10a2 2 0 0 0 2-2V9"/></svg>
            <span class="n">${peers.length}</span>
          </span>
        ` : ''}
      </div>
      <div class="meta">
        <span class="topic-eyebrow">
          <span class="dot"></span>
          <span class="text">${esc(topicLabel(topic))}</span>
        </span>
        <div class="card-title">${esc(primaryTitle)}</div>
        <div class="card-en">${esc(secondaryTitle)}</div>
        <div class="action-row">
          <span class="aspect-mini">${esc(image.aspect_ratio || '1:1')}</span>
          <button class="mini-btn" data-copy="${esc(image.id)}" type="button" title="${esc(t('copy'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderGallery() {
  const waterfall = $('#waterfall');
  if (!waterfall) return;
  const list = filteredImages();
  waterfall.innerHTML = list.length
    ? list.map(renderCard).join('')
    : `<div class="empty">${esc(t('empty'))}</div>`;
}

async function loadPrompt(image) {
  if (!image) return '';
  if (state.promptCache.has(image.id)) return state.promptCache.get(image.id);
  try {
    const response = await fetch(imageUrl(image.meta_path));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const meta = await response.json();
    const prompt = meta.prompt || '';
    state.promptCache.set(image.id, prompt);
    return prompt;
  } catch (error) {
    const message = `Unable to load prompt from ${image.meta_path}`;
    state.promptCache.set(image.id, message);
    return message;
  }
}

function imageById(id) {
  return (state.data?.images || []).find((image) => image.id === id);
}

async function openModal(id, options = {}) {
  const image = imageById(id);
  if (!image) return;

  state.modal = image;
  const topic = topicOf(image);
  const pack = packageOf(image);
  const peers = isSeries(image) ? peersOf(image) : null;
  const primaryTitle = titleOf(image);
  const secondaryTitle = secondaryTitleOf(image);
  const src = imageUrl(image.image);

  $('#m-img').src = src;
  $('#m-img').alt = image.display?.alt?.[state.lang] || primaryTitle;
  $('#m-title').textContent = primaryTitle;
  $('#m-en').textContent = secondaryTitle;
  $('#m-prompt').textContent = state.promptCache.get(image.id) || t('loading');
  $('#m-open').href = src;
  $('#m-download').href = src;
  $('#m-download').setAttribute('download', `${image.image_id || image.id.split('/').pop() || 'image'}.png`);
  $('#m-prompt-label').textContent = t('promptLabel');
  $('#m-copy-label').textContent = t('copy');

  $('#m-eyebrow-text').textContent = topicLabel(topic);
  const posEl = $('#m-pos');
  const dotsEl = $('#m-dots');
  const prevEl = $('#m-prev');
  const nextEl = $('#m-next');

  if (peers && peers.length > 1) {
    const index = Math.max(0, peers.findIndex((peer) => peer.id === image.id));
    posEl.textContent = `${index + 1} / ${peers.length}`;
    posEl.style.display = '';
    dotsEl.classList.add('show');
    dotsEl.innerHTML = peers.map((peer, i) => `<button class="dot ${i === index ? 'active' : ''}" data-id="${esc(peer.id)}" type="button" aria-label="${i + 1}/${peers.length}"></button>`).join('');
    prevEl.classList.add('show');
    nextEl.classList.add('show');
  } else {
    posEl.textContent = '';
    posEl.style.display = 'none';
    dotsEl.classList.remove('show');
    dotsEl.innerHTML = '';
    prevEl.classList.remove('show');
    nextEl.classList.remove('show');
  }

  $('#m-pills').innerHTML = `
    <span class="m-pill m-pill-topic">● ${esc(topicLabel(topic))}</span>
    <span class="m-pill m-pill-aspect">${esc(image.aspect_ratio || '1:1')}</span>
    <span class="m-pill m-pill-type">${esc(isSeries(image) ? t('series') : t('single'))}</span>
  `;
  $('#m-tags').innerHTML = (image.tags || []).map((tag) => `<span class="tag-chip">#${esc(tagLabel(tag))}</span>`).join('');

  $('#scrim').classList.add('open');
  $('#scrim').setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  if (!options.fromHash) {
    suppressHash = true;
    history.replaceState(null, '', `#m-${encodeURIComponent(image.id)}`);
    suppressHash = false;
  }

  const prompt = await loadPrompt(image);
  if (state.modal?.id === image.id) $('#m-prompt').textContent = prompt;
}

function closeModal(options = {}) {
  $('#scrim')?.classList.remove('open');
  $('#scrim')?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  state.modal = null;

  if (!options.keepHash && location.hash.startsWith('#m-')) {
    suppressHash = true;
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    suppressHash = false;
  }
}

function navModal(delta) {
  if (!state.modal || !isSeries(state.modal)) return;
  const peers = peersOf(state.modal);
  if (peers.length <= 1) return;
  const index = Math.max(0, peers.findIndex((peer) => peer.id === state.modal.id));
  const next = peers[(index + delta + peers.length) % peers.length];
  openModal(next.id);
}

function showToast(message) {
  const toast = $('#toast');
  $('#toast-text').textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__promptAtlasToast);
  window.__promptAtlasToast = setTimeout(() => toast.classList.remove('show'), 2000);
}

async function copyPromptFor(image) {
  if (!image) return;
  const prompt = await loadPrompt(image);
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = prompt;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast(t('copied'));
}

function applyLang() {
  document.documentElement.lang = state.lang;
  localStorage.setItem(LANG_KEY, state.lang);
  renderShell();
  renderTopicsNav();
  renderFilterPills();
  renderGallery();
  if (state.modal) openModal(state.modal.id);
}

function setActiveTopic(id) {
  state.activeTopic = id;
  renderTopicsNav();
  renderFilterPills();
  renderGallery();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const topicItem = event.target.closest('.topic-item');
    if (topicItem) {
      setActiveTopic(topicItem.dataset.topic);
      return;
    }

    const filterPill = event.target.closest('.filter-pill');
    if (filterPill) {
      setActiveTopic(filterPill.dataset.topic);
      return;
    }

    const copyButton = event.target.closest('[data-copy]');
    if (copyButton) {
      event.stopPropagation();
      copyPromptFor(imageById(copyButton.dataset.copy));
      return;
    }

    const card = event.target.closest('.card');
    if (card) {
      openModal(card.dataset.id);
      return;
    }

    if (event.target.closest('#m-close')) {
      closeModal();
      return;
    }

    if (event.target.closest('#m-prev')) {
      navModal(-1);
      return;
    }

    if (event.target.closest('#m-next')) {
      navModal(1);
      return;
    }

    const dot = event.target.closest('#m-dots .dot');
    if (dot) {
      openModal(dot.dataset.id);
      return;
    }

    if (event.target.closest('#m-copy')) {
      copyPromptFor(state.modal);
      return;
    }

    if (event.target.id === 'scrim') {
      closeModal();
      return;
    }

    const navButton = event.target.closest('.nav-item');
    if (navButton) {
      $$('.nav-item').forEach((item) => item.classList.toggle('active', item === navButton));
      return;
    }

    if (event.target.closest('#hero-cta')) {
      $('#filter-bar-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (event.target.closest('#lang-btn')) {
      state.lang = state.lang === 'zh-CN' ? 'en' : 'zh-CN';
      applyLang();
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'search') {
      state.search = event.target.value;
      renderGallery();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!state.modal) return;
    if (event.key === 'Escape') closeModal();
    else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navModal(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      navModal(1);
    }
  });

  window.addEventListener('hashchange', () => {
    if (suppressHash) return;
    if (location.hash.startsWith('#m-')) {
      openModal(decodeURIComponent(location.hash.slice(3)), { fromHash: true });
    } else {
      closeModal({ keepHash: true });
    }
  });
}

async function boot() {
  renderLoading();
  bindEvents();
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  state.data = await response.json();
  buildIndexes();
  applyLang();

  if (location.hash.startsWith('#m-')) {
    openModal(decodeURIComponent(location.hash.slice(3)), { fromHash: true });
  }
}

function renderLoading() {
  app.innerHTML = '<div class="app"><main class="main"><section class="waterfall"><div class="empty">Loading...</div></section></main></div>';
}

boot().catch((error) => {
  console.error(error);
  app.innerHTML = '<div class="app"><main class="main"><section class="waterfall"><div class="empty">Unable to load works/index.json</div></section></main></div>';
});
