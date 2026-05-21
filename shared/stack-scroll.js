/** Scroll depth + jump — panels are [data-layer] sticky cards */
export function initStackScroll(options = {}) {
  const {
    sectionSelector = '.layer[data-layer], .folder[data-layer], .frame[data-layer], .unit[data-layer]',
    depthEl = document.getElementById('depth'),
    depthPrefix = 'L',
    tabSelector = '[data-goto], .jump',
  } = options;

  const sections = document.querySelectorAll(sectionSelector);
  if (!sections.length) return;

  const mid = () => window.innerHeight * 0.45;

  function updateDepth() {
    let active = 0;
    sections.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top <= mid() && r.bottom > mid()) active = Number(el.dataset.layer);
    });
    if (depthEl) depthEl.textContent = `${depthPrefix}${active}`;

    document.querySelectorAll('.stack-ruler button, .stack-ruler [data-goto], .tab-rail button, .tab[data-goto]').forEach((tab) => {
      const n = tab.dataset.layer ?? tab.dataset.goto;
      if (n === undefined) return;
      tab.classList.toggle('active', Number(n) === active);
    });
  }

  document.querySelectorAll(tabSelector).forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const layer = tab.dataset.goto ?? tab.dataset.layer;
      const target = document.querySelector(`${sectionSelector}[data-layer="${layer}"]`);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', updateDepth, { passive: true });
  updateDepth();
}
