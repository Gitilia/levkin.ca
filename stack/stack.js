const layers = document.querySelectorAll('.layer');
const depthEl = document.getElementById('depth');
const rulerSpans = document.querySelectorAll('.stack-ruler span');

function updateDepth() {
  const mid = window.innerHeight * 0.45;
  let active = 0;

  layers.forEach((layer) => {
    const rect = layer.getBoundingClientRect();
    if (rect.top <= mid && rect.bottom > mid) {
      active = Number(layer.dataset.layer);
    }
  });

  depthEl.textContent = `depth: L${active}`;

  rulerSpans.forEach((span, i) => {
    span.classList.toggle('active', i === active);
  });
}

window.addEventListener('scroll', updateDepth, { passive: true });
updateDepth();
