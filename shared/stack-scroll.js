/** Scroll depth + jump + hide upcoming cards until they cover the stack */
export function initStackScroll(options = {}) {
  const {
    sectionSelector = '.scroll-section',
    depthEl = document.getElementById('depth'),
    depthPrefix = 'L',
    tabSelector = '[data-goto], .jump',
    panelSelector = '.folder, .layer, .frame, .unit',
  } = options;

  const sections = document.querySelectorAll(sectionSelector);
  if (!sections.length) return;

  const reveal = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--stack-reveal').trim();
    return parseFloat(v) || 344;
  };

  const mid = () => window.innerHeight * 0.42;

  function updateDepth() {
    const rLine = reveal();
    let active = 0;

    sections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid() && r.bottom > mid()) active = Number(sec.dataset.layer);
    });

    if (depthEl) depthEl.textContent = `${depthPrefix}${active}`;

    document.querySelectorAll('.stack-ruler button, .stack-ruler [data-goto], .tab-rail button, .tab[data-goto]').forEach((el) => {
      const n = el.dataset.layer ?? el.dataset.goto;
      if (n === undefined) return;
      el.classList.toggle('active', Number(n) === active);
    });

    sections.forEach((sec) => {
      const layer = Number(sec.dataset.layer);
      const panel = sec.querySelector(panelSelector);
      if (!panel) return;

      const r = sec.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const onStack = Math.abs(pr.top - rLine) < 10;
      const past = r.bottom <= rLine;

      sec.classList.toggle('is-active', layer === active);
      sec.classList.toggle('is-stuck', onStack);
      sec.classList.toggle('is-past', past);
    });
  }

  document.querySelectorAll(tabSelector).forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const layer = tab.dataset.goto;
      const target = document.querySelector(`${sectionSelector}[data-layer="${layer}"]`);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 48;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', updateDepth, { passive: true });
  window.addEventListener('resize', updateDepth, { passive: true });
  updateDepth();
}
