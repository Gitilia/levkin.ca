const sections = document.querySelectorAll('.scroll-section');
const depthEl = document.getElementById('depth');
const rulerSpans = document.querySelectorAll('.stack-ruler span');

function updateDepth() {
  const mid = window.innerHeight * 0.42;
  let active = 0;
  sections.forEach((sec) => {
    const r = sec.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) active = Number(sec.dataset.layer);
  });
  depthEl.textContent = `L${active}`;
  rulerSpans.forEach((s, i) => s.classList.toggle('active', i === active));
}

window.addEventListener('scroll', updateDepth, { passive: true });
updateDepth();
