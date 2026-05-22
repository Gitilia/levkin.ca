/** Fixed rail — all L0–L7 visible; click to jump (syncs with scroll) */
export function initRailRoller(rail = document.querySelector('.tab-rail')) {
  const tabs = rail ? [...rail.querySelectorAll('.rail-tab')] : [];
  if (!rail || !tabs.length) return;

  function setActive(layer) {
    const n = Math.max(0, Math.min(tabs.length - 1, layer));
    tabs.forEach((btn, i) => btn.classList.toggle('active', i === n));
  }

  function gotoLayer(layer) {
    setActive(layer);
    window.dispatchEvent(
      new CustomEvent('stack-goto-layer', { detail: { layer } }),
    );
  }

  tabs.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      gotoLayer(Number(btn.dataset.layer ?? btn.dataset.goto));
    });
  });

  window.addEventListener('stack-depth', (e) => {
    const layer = Number(e.detail?.active);
    if (Number.isFinite(layer)) setActive(layer);
  });

  setActive(0);
}
