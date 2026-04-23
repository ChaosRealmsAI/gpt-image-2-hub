import './styles.css';

const DATA_URL = './works/index.json';
const STORE_LANG = 'prompt-atlas-lang';
const STORE_LIKES = 'prompt-atlas-liked';
const URL_PARAMS = new URLSearchParams(window.location.search);

const UI = {
  en: {
    brand: 'Prompt Atlas',
    subtitle: 'GPT Image 2 public works gallery',
    search: 'Search images, prompts, topics, or tags',
    all: 'All',
    featured: 'Featured',
    single: 'Single',
    series: 'Series',
    prompt: 'Prompt',
    copy: 'Copy',
    copied: 'Prompt copied',
    download: 'Download',
    open: 'Open image',
    empty: 'No works match the current filters.',
    loading: 'Loading works...',
    failed: 'Unable to load works/index.json',
    topic: 'Topic',
    package: 'Package',
    model: 'Image model',
    images: 'images',
  },
  'zh-CN': {
    brand: 'Prompt Atlas',
    subtitle: 'GPT Image 2 公开作品图鉴',
    search: '搜索图片、提示词、主题或标签',
    all: '全部',
    featured: '精选',
    single: '单图',
    series: '系列',
    prompt: '提示词',
    copy: '复制',
    copied: '提示词已复制',
    download: '下载',
    open: '打开原图',
    empty: '没有匹配当前筛选的作品。',
    loading: '正在加载作品...',
    failed: '无法加载 works/index.json',
    topic: '主题',
    package: '作品包',
    model: '出图模型',
    images: '张图',
  },
  'zh-TW': {
    brand: 'Prompt Atlas',
    subtitle: 'GPT Image 2 公開作品圖鑑',
    search: '搜尋圖片、提示詞、主題或標籤',
    all: '全部',
    featured: '精選',
    single: '單圖',
    series: '系列',
    prompt: '提示詞',
    copy: '複製',
    copied: '提示詞已複製',
    download: '下載',
    open: '開啟原圖',
    empty: '沒有符合目前篩選的作品。',
    loading: '正在載入作品...',
    failed: '無法載入 works/index.json',
    topic: '主題',
    package: '作品包',
    model: '出圖模型',
    images: '張圖',
  },
  ja: {
    brand: 'Prompt Atlas',
    subtitle: 'GPT Image 2 公開作品ギャラリー',
    search: '画像、プロンプト、トピック、タグを検索',
    all: 'すべて',
    featured: '注目',
    single: '単一',
    series: 'シリーズ',
    prompt: 'プロンプト',
    copy: 'コピー',
    copied: 'コピーしました',
    download: 'ダウンロード',
    open: '画像を開く',
    empty: '条件に一致する作品がありません。',
    loading: '作品を読み込み中...',
    failed: 'works/index.json を読み込めません',
    topic: 'トピック',
    package: 'パッケージ',
    model: '画像モデル',
    images: 'images',
  },
  ko: {
    brand: 'Prompt Atlas',
    subtitle: 'GPT Image 2 공개 작품 갤러리',
    search: '이미지, 프롬프트, 토픽, 태그 검색',
    all: '전체',
    featured: '추천',
    single: '단일',
    series: '시리즈',
    prompt: '프롬프트',
    copy: '복사',
    copied: '복사되었습니다',
    download: '다운로드',
    open: '이미지 열기',
    empty: '조건에 맞는 작품이 없습니다.',
    loading: '작품을 불러오는 중...',
    failed: 'works/index.json을 불러올 수 없습니다',
    topic: '토픽',
    package: '패키지',
    model: '이미지 모델',
    images: 'images',
  },
  es: {
    brand: 'Prompt Atlas',
    subtitle: 'Galería pública de obras GPT Image 2',
    search: 'Buscar imágenes, prompts, temas o etiquetas',
    all: 'Todo',
    featured: 'Destacado',
    single: 'Individual',
    series: 'Serie',
    prompt: 'Prompt',
    copy: 'Copiar',
    copied: 'Prompt copiado',
    download: 'Descargar',
    open: 'Abrir imagen',
    empty: 'No hay obras con estos filtros.',
    loading: 'Cargando obras...',
    failed: 'No se pudo cargar works/index.json',
    topic: 'Tema',
    package: 'Paquete',
    model: 'Modelo',
    images: 'images',
  },
  fr: {
    brand: 'Prompt Atlas',
    subtitle: 'Galerie publique GPT Image 2',
    search: 'Rechercher images, prompts, sujets ou tags',
    all: 'Tout',
    featured: 'Sélection',
    single: 'Image',
    series: 'Série',
    prompt: 'Prompt',
    copy: 'Copier',
    copied: 'Prompt copié',
    download: 'Télécharger',
    open: 'Ouvrir l’image',
    empty: 'Aucune œuvre ne correspond aux filtres.',
    loading: 'Chargement...',
    failed: 'Impossible de charger works/index.json',
    topic: 'Sujet',
    package: 'Package',
    model: 'Modèle',
    images: 'images',
  },
  de: {
    brand: 'Prompt Atlas',
    subtitle: 'Öffentliche GPT Image 2 Galerie',
    search: 'Bilder, Prompts, Themen oder Tags suchen',
    all: 'Alle',
    featured: 'Auswahl',
    single: 'Einzelbild',
    series: 'Serie',
    prompt: 'Prompt',
    copy: 'Kopieren',
    copied: 'Prompt kopiert',
    download: 'Download',
    open: 'Bild öffnen',
    empty: 'Keine Werke passen zu den Filtern.',
    loading: 'Werke werden geladen...',
    failed: 'works/index.json konnte nicht geladen werden',
    topic: 'Thema',
    package: 'Paket',
    model: 'Bildmodell',
    images: 'images',
  },
  'pt-BR': {
    brand: 'Prompt Atlas',
    subtitle: 'Galeria pública GPT Image 2',
    search: 'Buscar imagens, prompts, tópicos ou tags',
    all: 'Tudo',
    featured: 'Destaques',
    single: 'Única',
    series: 'Série',
    prompt: 'Prompt',
    copy: 'Copiar',
    copied: 'Prompt copiado',
    download: 'Baixar',
    open: 'Abrir imagem',
    empty: 'Nenhum trabalho corresponde aos filtros.',
    loading: 'Carregando...',
    failed: 'Não foi possível carregar works/index.json',
    topic: 'Tema',
    package: 'Pacote',
    model: 'Modelo',
    images: 'images',
  },
  ar: {
    brand: 'Prompt Atlas',
    subtitle: 'معرض GPT Image 2 العام',
    search: 'ابحث في الصور أو التعليمات أو الوسوم',
    all: 'الكل',
    featured: 'مختار',
    single: 'صورة',
    series: 'سلسلة',
    prompt: 'التعليمة',
    copy: 'نسخ',
    copied: 'تم نسخ التعليمة',
    download: 'تنزيل',
    open: 'فتح الصورة',
    empty: 'لا توجد أعمال تطابق الفلاتر.',
    loading: 'جار التحميل...',
    failed: 'تعذر تحميل works/index.json',
    topic: 'الموضوع',
    package: 'الحزمة',
    model: 'نموذج الصورة',
    images: 'images',
  },
};

const state = {
  data: null,
  lang: URL_PARAMS.get('lang') || localStorage.getItem(STORE_LANG) || 'zh-CN',
  filter: 'all',
  query: '',
  active: null,
  promptCache: new Map(),
  liked: loadLiked(),
};

const app = document.querySelector('#app');

function loadLiked() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_LIKES) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLiked() {
  localStorage.setItem(STORE_LIKES, JSON.stringify([...state.liked]));
}

function text(key) {
  return (UI[state.lang] || UI.en)[key] || UI.en[key] || key;
}

function localize(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[state.lang] || value.en || value['zh-CN'] || fallback;
}

function localizePair(item, field) {
  const fallback = item[field] || '';
  return item.i18n?.[state.lang]?.[field] || item.i18n?.en?.[field] || item.i18n?.['zh-CN']?.[field] || fallback;
}

function assetUrl(file) {
  if (!file) return '';
  return `./${file.replace(/^new\//, '').replace(/^\.?\//, '')}`;
}

function ratioToCss(ratio) {
  const [w, h] = String(ratio || '1:1').split(':').map(Number);
  return w && h ? `${w}/${h}` : '1/1';
}

function tagLabel(tag) {
  return localize(state.data?.tag_labels?.[tag]?.labels, tag);
}

function allTags() {
  const counts = new Map();
  for (const image of state.data?.images || []) {
    for (const tag of image.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

function imageHaystack(image) {
  const bits = [
    image.id,
    image.topic_id,
    image.package_id,
    image.title,
    image.description,
    image.topic_title,
    image.package_title,
    localizePair(image, 'title'),
    localizePair(image, 'description'),
    ...(image.tags || []),
    ...(image.display?.tags || []),
  ];
  return bits.join(' ').toLowerCase();
}

function filteredImages() {
  const q = state.query.trim().toLowerCase();
  return [...(state.data?.images || [])]
    .filter((image) => {
      if (state.filter === 'featured') return image.display?.featured;
      if (state.filter === 'single') return image.type === 'single';
      if (state.filter === 'series') return image.type === 'series';
      if (state.filter.startsWith('tag:')) return image.tags?.includes(state.filter.slice(4));
      return true;
    })
    .filter((image) => !q || imageHaystack(image).includes(q))
    .sort((a, b) => {
      const af = a.display?.featured ? 0 : 1;
      const bf = b.display?.featured ? 0 : 1;
      return af - bf
        || (a.display?.sort_order || 100) - (b.display?.sort_order || 100)
        || a.title.localeCompare(b.title);
    });
}

function renderShell(body) {
  const locale = state.data?.supported_locales?.find((l) => l.code === state.lang);
  document.documentElement.lang = state.lang;
  document.documentElement.dir = locale?.direction || 'ltr';
  app.innerHTML = `
    <header class="topbar">
      <div class="toprow">
        <a class="brand" href="./" aria-label="Prompt Atlas home">
          <span class="brand-mark">PA</span>
          <span>
            <strong>${text('brand')}</strong>
            <small>${text('subtitle')}</small>
          </span>
        </a>
        <label class="search">
          <span aria-hidden="true">⌕</span>
          <input id="search" value="${escapeHtml(state.query)}" placeholder="${text('search')}" />
        </label>
        <select id="language" class="language" aria-label="Language">
          ${(state.data?.supported_locales || [{ code: 'en', native_label: 'English' }]).map((lang) => `
            <option value="${lang.code}" ${lang.code === state.lang ? 'selected' : ''}>${lang.native_label || lang.code}</option>
          `).join('')}
        </select>
      </div>
      <nav class="filters" aria-label="Gallery filters">${renderFilters()}</nav>
    </header>
    <main>${body}</main>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
  bindShellEvents();
}

function renderFilters() {
  const base = [
    ['all', text('all')],
    ['featured', text('featured')],
    ['single', text('single')],
    ['series', text('series')],
  ];
  const tagFilters = allTags().map((tag) => [`tag:${tag}`, `#${tagLabel(tag)}`]);
  return [...base, ...tagFilters].map(([id, label]) => `
    <button class="filter ${state.filter === id ? 'active' : ''}" data-filter="${id}">${escapeHtml(label)}</button>
  `).join('');
}

function renderGallery() {
  const images = filteredImages();
  renderShell(`
    <section class="stats">
      <div><strong>${state.data.stats.image_count}</strong><span>${text('images')}</span></div>
      <div><strong>${state.data.stats.package_count}</strong><span>${text('package')}</span></div>
      <div><strong>${state.data.stats.topic_count}</strong><span>${text('topic')}</span></div>
    </section>
    ${images.length ? `
      <section class="waterfall" aria-label="Prompt Atlas works">
        ${images.map(renderCard).join('')}
      </section>
    ` : `<p class="empty">${text('empty')}</p>`}
    ${state.active ? renderModal(state.active) : ''}
  `);
  bindGalleryEvents();
}

function renderCard(image) {
  const title = localizePair(image, 'title');
  const description = localizePair(image, 'description');
  const alt = localize(image.display?.alt, title);
  const primaryTag = tagLabel(image.display?.tags?.[0] || image.tags?.[0] || image.type);
  return `
    <article class="card" style="--ratio:${ratioToCss(image.aspect_ratio)}" data-id="${escapeAttr(image.id)}">
      <button class="card-hit" data-open="${escapeAttr(image.id)}" aria-label="${escapeAttr(title)}">
        <span class="media">
          <img src="${assetUrl(image.image)}" alt="${escapeAttr(alt)}" loading="lazy" />
          <span class="pill">${escapeHtml(primaryTag)}</span>
        </span>
        <span class="card-body">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(description)}</span>
        </span>
      </button>
      <footer class="card-meta">
        <span>${escapeHtml(image.aspect_ratio || '')}</span>
        <span>${escapeHtml(image.type)}</span>
        <button class="icon-btn ${state.liked.has(image.id) ? 'liked' : ''}" data-like="${escapeAttr(image.id)}" aria-label="Like">♥</button>
      </footer>
    </article>
  `;
}

function renderModal(image) {
  const title = localizePair(image, 'title');
  const description = localizePair(image, 'description');
  const alt = localize(image.display?.alt, title);
  const prompt = state.promptCache.get(image.id)?.prompt || '';
  const tags = (image.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tagLabel(tag))}</span>`).join('');
  return `
    <div class="modal-scrim open" data-close-modal>
      <article class="modal" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
        <button class="close" data-close-modal aria-label="Close">×</button>
        <div class="modal-media">
          <img src="${assetUrl(image.image)}" alt="${escapeAttr(alt)}" />
        </div>
        <div class="modal-side">
          <p class="eyebrow">${escapeHtml(image.topic_title)} · ${escapeHtml(image.package_title)}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="description">${escapeHtml(description)}</p>
          <div class="tag-row">${tags}</div>
          <dl class="facts">
            <div><dt>${text('topic')}</dt><dd>${escapeHtml(image.topic_id)}</dd></div>
            <div><dt>${text('package')}</dt><dd>${escapeHtml(image.package_id)}</dd></div>
            <div><dt>${text('model')}</dt><dd>gpt-image-2</dd></div>
          </dl>
          <section class="prompt-box">
            <header>
              <span>${text('prompt')}</span>
              <button class="copy" data-copy="${escapeAttr(image.id)}">${text('copy')}</button>
            </header>
            <pre>${prompt ? escapeHtml(prompt) : 'Loading prompt...'}</pre>
          </section>
          <div class="modal-actions">
            <a href="${assetUrl(image.image)}" target="_blank" rel="noopener">${text('open')}</a>
            <a href="${assetUrl(image.image)}" download>${text('download')}</a>
          </div>
        </div>
      </article>
    </div>
  `;
}

function bindShellEvents() {
  document.querySelector('#search')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderGallery();
  });
  document.querySelector('#language')?.addEventListener('change', (event) => {
    state.lang = event.target.value;
    localStorage.setItem(STORE_LANG, state.lang);
    renderGallery();
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      renderGallery();
    });
  });
}

function bindGalleryEvents() {
  document.querySelectorAll('[data-open]').forEach((button) => {
    button.addEventListener('click', () => openImage(button.dataset.open));
  });
  document.querySelectorAll('[data-like]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.like;
      if (state.liked.has(id)) state.liked.delete(id);
      else state.liked.add(id);
      saveLiked();
      renderGallery();
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach((element) => {
    element.addEventListener('click', (event) => {
      if (event.target === element || event.target.matches('.close')) closeModal();
    });
  });
  document.querySelector('[data-copy]')?.addEventListener('click', async (event) => {
    const prompt = state.promptCache.get(event.target.dataset.copy)?.prompt || '';
    await navigator.clipboard.writeText(prompt);
    showToast(text('copied'));
  });
  document.addEventListener('keydown', onEscape);
}

function onEscape(event) {
  if (event.key === 'Escape') closeModal();
}

async function openImage(id) {
  const image = state.data.images.find((item) => item.id === id);
  if (!image) return;
  state.active = image;
  location.hash = `m-${encodeURIComponent(id)}`;
  renderGallery();
  if (!state.promptCache.has(id)) {
    const response = await fetch(assetUrl(image.meta_path));
    state.promptCache.set(id, await response.json());
    renderGallery();
  }
}

function closeModal() {
  if (!state.active) return;
  state.active = null;
  history.replaceState(null, '', location.pathname + location.search);
  renderGallery();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

async function boot() {
  renderShell(`<p class="empty">${text('loading')}</p>`);
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    if (!state.data.supported_locales?.some((lang) => lang.code === state.lang)) {
      state.lang = state.data.default_locale || 'en';
    }
    renderGallery();
    if (location.hash.startsWith('#m-')) {
      const id = decodeURIComponent(location.hash.slice(3));
      window.setTimeout(() => openImage(id), 50);
    }
  } catch (error) {
    console.error(error);
    renderShell(`<p class="empty">${text('failed')}</p>`);
  }
}

boot();
