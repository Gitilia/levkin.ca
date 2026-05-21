const STORAGE_KEY = 'levkin-spec-prefs';
const FONT_STEPS = [0.875, 1, 1.125, 1.25, 1.375, 1.5];
const DEFAULT_FONT_INDEX = 1;

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function fontIndexFromScale(scale) {
  const idx = FONT_STEPS.indexOf(scale);
  return idx === -1 ? DEFAULT_FONT_INDEX : idx;
}

const THEME_COLORS = {
  light: '#e8e4dc',
  dim: '#b8b2a6',
  dark: '#080807',
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLORS[theme] || THEME_COLORS.light;
  const input = document.querySelector(`input[name="theme"][value="${theme}"]`);
  if (input) input.checked = true;
}

function applyFontScale(scale) {
  document.documentElement.style.setProperty('--font-scale', String(scale));
  const readout = document.getElementById('font-scale-readout');
  if (readout) readout.textContent = `${Math.round(scale * 100)}%`;
  document.querySelectorAll('.font-btn').forEach((btn) => {
    const action = btn.dataset.action;
    if (action === 'decrease') btn.disabled = scale <= FONT_STEPS[0];
    if (action === 'increase') btn.disabled = scale >= FONT_STEPS[FONT_STEPS.length - 1];
  });
}

function initPreferences() {
  const prefs = loadPrefs();
  const theme = prefs.theme || 'light';
  const fontScale = prefs.fontScale || FONT_STEPS[DEFAULT_FONT_INDEX];
  let fontIndex = fontIndexFromScale(fontScale);

  applyTheme(theme);
  applyFontScale(fontScale);

  document.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener('change', () => {
      const next = { ...loadPrefs(), theme: input.value };
      savePrefs(next);
      applyTheme(input.value);
    });
  });

  document.querySelectorAll('.font-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'reset') fontIndex = DEFAULT_FONT_INDEX;
      else if (action === 'decrease' && fontIndex > 0) fontIndex -= 1;
      else if (action === 'increase' && fontIndex < FONT_STEPS.length - 1) fontIndex += 1;

      const scale = FONT_STEPS[fontIndex];
      const next = { ...loadPrefs(), fontScale: scale };
      savePrefs(next);
      applyFontScale(scale);
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('.clause-anchor[id]');
  const links = document.querySelectorAll('.toc nav a');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((a) => {
      const active = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const onScroll = () => {
      let current = sections[0]?.id;
      const offset = 120;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top - offset <= 0) current = section.id;
      });
      if (current) setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActive(entry.target.id);
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach((s) => observer.observe(s));
}

initPreferences();
initScrollSpy();
