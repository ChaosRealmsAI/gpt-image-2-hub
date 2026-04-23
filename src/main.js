import './styles.css';

const DATA_URL = './works/index.json';
const LANG_KEY = 'prompt-atlas-lang';
const VIEW_MODE_KEY = 'prompt-atlas-view-mode';

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
    sectionTopics: '分类',
    viewModeExpanded: '展开',
    viewModeCollapsed: '封面',
    openOriginal: '新窗口预览',
    download: '下载原图',
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
    sectionTopics: 'Topics',
    viewModeExpanded: 'All',
    viewModeCollapsed: 'Cover',
    openOriginal: 'Open original',
    download: 'Download',
  },
};

const LANGS = [
  { id: 'zh-CN', label: '简体中文' },
  { id: 'en', label: 'English' },
];

const state = {
  data: null,
  lang: normalizeLang(localStorage.getItem(LANG_KEY) || 'zh-CN'),
  viewMode: localStorage.getItem(VIEW_MODE_KEY) === 'expanded' ? 'expanded' : 'collapsed',
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

function shuffleImages(images) {
  for (let i = images.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
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

        <div class="section-label">${esc(t('sectionTopics'))}</div>
        <nav class="topics" id="topics-nav" aria-label="topics"></nav>
      </aside>

      <main class="main">
        <header class="topbar">
          <label class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="search" placeholder="${esc(t('searchPh'))}" value="${esc(state.search)}" />
          </label>
          <div class="top-right">
            <a class="icon-btn" href="https://github.com/ChaosRealmsAI/gpt-image-2-hub" target="_blank" rel="noopener" aria-label="github">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.55 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18A11 11 0 0 1 12 6.8c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.02 2.8-.02 3.18 0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>
            </a>
            <a class="icon-btn" href="https://x.com/WYuxuan60660" target="_blank" rel="noopener" aria-label="x">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <div class="lang-dd" id="lang-dd">
              <button class="lang-dd-trigger" id="lang-dd-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <svg class="lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span class="lang-dd-label" id="lang-dd-label">${esc(LANGS.find((l) => l.id === state.lang)?.label || '简体中文')}</span>
                <svg class="lang-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <ul class="lang-dd-menu" id="lang-dd-menu" role="listbox">
                ${LANGS.map((lang) => `
                  <li class="lang-dd-option ${lang.id === state.lang ? 'active' : ''}" data-lang="${esc(lang.id)}" role="option" aria-selected="${lang.id === state.lang}">
                    <span class="lang-dd-dot"></span>
                    <span class="lang-dd-name">${esc(lang.label)}</span>
                    ${lang.id === state.lang ? `<svg class="lang-dd-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </header>

        <div class="filter-bar" id="filter-bar-anchor">
          <div class="filter-title" id="filter-title"></div>
          <div class="filter-right">
            <div class="view-mode" id="view-mode-group" role="radiogroup" aria-label="view mode">
              <button class="vm-btn ${state.viewMode === 'collapsed' ? 'active' : ''}" data-mode="collapsed" type="button" role="radio" aria-checked="${state.viewMode === 'collapsed'}">${esc(t('viewModeCollapsed'))}</button>
              <button class="vm-btn ${state.viewMode === 'expanded' ? 'active' : ''}" data-mode="expanded" type="button" role="radio" aria-checked="${state.viewMode === 'expanded'}">${esc(t('viewModeExpanded'))}</button>
            </div>
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
          <div class="modal-actions">
            <a class="modal-action" id="m-open" href="#" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span id="m-open-label">${esc(t('openOriginal'))}</span>
            </a>
            <a class="modal-action" id="m-download" download>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span id="m-download-label">${esc(t('download'))}</span>
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

function renderFilterTitle() {
  const bar = $('#filter-title');
  if (!bar) return;
  const active = topicItems().find((item) => item.id === state.activeTopic) || topicItems()[0];
  bar.innerHTML = `
    <span class="t">${esc(active.label)}</span>
    <span class="n">${filteredImages().length}</span>
  `;
}

function renderViewModeGroup() {
  const group = $('#view-mode-group');
  if (!group) return;
  group.querySelectorAll('.vm-btn').forEach((button) => {
    const active = button.dataset.mode === state.viewMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-checked', String(active));
  });
}

function filteredImages() {
  const q = state.search.trim().toLowerCase();
  const images = (state.data?.images || []).filter((image) => {
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

  if (state.viewMode !== 'collapsed') return images;

  // Collapsed mode: only dedupe `series` packages to their cover (first image by order).
  // `single` packages keep every image — each entry in a single package is an independent work.
  const seenSeries = new Set();
  return images.reduce((acc, image) => {
    if (!isSeries(image) || !image.package_id) {
      acc.push(image);
      return acc;
    }
    if (seenSeries.has(image.package_id)) return acc;
    seenSeries.add(image.package_id);
    acc.push(peersOf(image)[0] || image);
    return acc;
  }, []);
}

function renderCard(image) {
  const peers = isSeries(image) ? peersOf(image) : null;
  const primaryTitle = titleOf(image);
  const secondaryTitle = secondaryTitleOf(image);
  const packageTitle = packageLabel(packageOf(image));
  const isCollapsedSeries = peers && peers.length > 1 && state.viewMode === 'collapsed';
  return `
    <article class="card ${isCollapsedSeries ? 'is-stack' : ''}" data-id="${esc(image.id)}" style="--hue:${hashHue(image.id)}">
      ${isCollapsedSeries ? '<span class="stack-layer stack-2" aria-hidden="true"></span><span class="stack-layer stack-1" aria-hidden="true"></span>' : ''}
      <div class="cover" style="--ar:${ratio(image.aspect_ratio)}">
        <img src="${esc(imageUrl(image.image))}" alt="${esc(image.display?.alt?.[state.lang] || primaryTitle)}" loading="lazy" onerror="this.classList.add('failed')" />
        <div class="cover-placeholder">🎨</div>
        ${peers && peers.length > 1 ? `
          <span class="series-badge" title="${esc(`${packageTitle} · ${peers.length}`)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M8 21h10a2 2 0 0 0 2-2V9"/></svg>
            <span class="n">${esc(t('series'))} · ${peers.length}</span>
          </span>
        ` : ''}
        <div class="card-overlay">
          <div class="card-title">${esc(primaryTitle)}</div>
          <div class="card-en">${esc(secondaryTitle)}</div>
        </div>
        <button class="mini-btn" data-copy="${esc(image.id)}" type="button" title="${esc(t('copy'))}" aria-label="${esc(t('copy'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
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
  renderFilterTitle();
  renderGallery();
  if (state.modal) openModal(state.modal.id);
}

function setActiveTopic(id) {
  state.activeTopic = id;
  renderTopicsNav();
  renderFilterTitle();
  renderGallery();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const topicItem = event.target.closest('.topic-item');
    if (topicItem) {
      setActiveTopic(topicItem.dataset.topic);
      return;
    }

    const viewModeButton = event.target.closest('.vm-btn');
    if (viewModeButton) {
      const mode = viewModeButton.dataset.mode === 'expanded' ? 'expanded' : 'collapsed';
      if (mode !== state.viewMode) {
        state.viewMode = mode;
        localStorage.setItem(VIEW_MODE_KEY, mode);
        renderViewModeGroup();
        renderFilterTitle();
        renderGallery();
      }
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

  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'search') {
      state.search = event.target.value;
      renderFilterTitle();
      renderGallery();
    }
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('#lang-dd-trigger');
    const dd = $('#lang-dd');
    if (trigger && dd) {
      const open = dd.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
      return;
    }
    const option = event.target.closest('.lang-dd-option');
    if (option) {
      state.lang = normalizeLang(option.dataset.lang);
      applyLang();
      return;
    }
    if (dd && !event.target.closest('#lang-dd')) {
      dd.classList.remove('open');
      $('#lang-dd-trigger')?.setAttribute('aria-expanded', 'false');
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
  shuffleImages(state.data.images || []);
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
