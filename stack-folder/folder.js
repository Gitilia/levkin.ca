const sections = document.querySelectorAll('.scroll-section');
const depthEl = document.getElementById('depth');
const mid = () => window.innerHeight * 0.42;
function tick() {
  let a = 0;
  sections.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= mid() && r.bottom > mid()) a = +s.dataset.layer; });
  depthEl.textContent = `L${a}`;
}
window.addEventListener('scroll', tick, { passive: true });
tick();
