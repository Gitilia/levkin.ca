/** Shared scroll-depth tracking + jump-to-layer for stack variants */
export function initStackScroll(options = {}) {
  const {
    sectionSelector = '.scroll-section',
    depthEl = document.getElementById('depth'),
    depthPrefix = 'L',
    tabSelector = '[data-goto], .jump',
  } = options;

  const sections = document.querySelectorAll(sectionSelector);
  if (!sections.length) return;

  const mid = () => window.innerHeight * 0.4;

  function updateDepth() {
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
  }

  document.querySelectorAll(tabSelector).forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const layer = tab.dataset.goto;
      const target = document.querySelector(`${sectionSelector}[data-layer="${layer}"]`);
      if (!target) return;
      const navH = 56;
      const y = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', updateDepth, { passive: true });
  updateDepth();
}
