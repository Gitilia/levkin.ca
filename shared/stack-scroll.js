/** Scroll depth, jump, folder fold state */
export function initStackScroll(options = {}) {
  const {
    sectionSelector = '.layer[data-layer], .folder[data-layer]',
    depthEl = document.getElementById('depth'),
    depthPrefix = 'L',
    tabSelector = '[data-goto], .jump, .layer-id',
    mountSelector = '.mount',
    foldTabs = false,
    interactionMode = 'pin',
  } = options;

  const sections = document.querySelectorAll(sectionSelector);
  if (!sections.length) return;

  const mount = document.querySelector(mountSelector);
  const lastLayer = sections.length - 1;
  const scrollPad = 56;
  let frontLayer = null;
  let layerScrollTops = [];
  let maxScrollY = Infinity;
  let measuringScroll = false;
  const deckTabs = () =>
    mount ? [...mount.querySelectorAll('.folder .tab')] : [];

  function layerAnchor(el) {
    return el.querySelector('.tab') || el.querySelector('.body') || el;
  }

  function tabRowMetrics() {
    const tabs = deckTabs();
    const stick = stackStickPx();
    const tops = tabs.map((t) => t.getBoundingClientRect().top);
    const spread = tops.length ? Math.max(...tops) - Math.min(...tops) : 0;
    const onStick = tops.length
      ? tops.every((top) => Math.abs(top - stick) <= 6)
      : false;
    return { tabs, stick, spread, onStick };
  }

  function stackStickPx() {
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue('--stack-stick').trim();
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return scrollPad;
    if (raw.endsWith('rem')) {
      return n * parseFloat(getComputedStyle(root).fontSize);
    }
    if (raw.endsWith('px')) return n;
    return n;
  }

  function captureLayerAnchors(force = false) {
    if (!force && window.scrollY > 8 && layerScrollTops.length) return;
    const stick = stackStickPx();
    layerScrollTops = [...sections].map((el) =>
      Math.max(0, layerAnchor(el).offsetTop - stick),
    );
  }

  function lastTabEl() {
    return sections[lastLayer]?.querySelector('.tab') ?? null;
  }

  function measureDeskEnd() {
    const tab = lastTabEl();
    if (!tab) return 0;
    return Math.max(0, tab.offsetTop - stackStickPx());
  }

  function ensureStackRunway() {
    if (!mount) return;
    measuringScroll = true;
    try {
      captureLayerAnchors(true);
      mount.style.setProperty('--stack-runway', '0px');
      void mount.offsetHeight;

      const stick = stackStickPx();
      const tab = lastTabEl();
      if (!tab) return;

      for (let i = 0; i < 12; i++) {
        const docMax = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        window.scrollTo({ top: docMax, behavior: 'auto' });
        void mount.offsetHeight;
        const shortfall = Math.ceil(tab.getBoundingClientRect().top - stick);
        if (shortfall <= 1) break;

        const cur =
          parseFloat(getComputedStyle(mount).getPropertyValue('--stack-runway')) || 0;
        mount.style.setProperty('--stack-runway', `${cur + shortfall + 2}px`);
        void mount.offsetHeight;
        captureLayerAnchors(true);
      }
    } finally {
      measuringScroll = false;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function tabsAlignedAtScroll() {
    const { tabs, stick, spread } = tabRowMetrics();
    if (!tabs.length) return false;
    const tops = tabs.map((t) => t.getBoundingClientRect().top);
    return (
      spread <= 1 &&
      tops.every((top) => Math.abs(top - stick) <= 2)
    );
  }

  /** Furthest scroll Y where every tab is flush on the stick line */
  function computeMaxScrollAligned() {
    const docMax = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    if (!deckTabs().length) return 0;

    measuringScroll = true;
    try {
      for (let y = docMax; y >= 0; y -= 1) {
        window.scrollTo({ top: y, behavior: 'auto' });
        void mount?.offsetHeight;
        if (tabsAlignedAtScroll()) return y;
      }
      return 0;
    } finally {
      measuringScroll = false;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function captureMaxScroll() {
    if (window.scrollY <= 8) {
      captureLayerAnchors(true);
      ensureStackRunway();
      captureLayerAnchors(true);
    }
    maxScrollY = computeMaxScrollAligned();
  }

  function isFolded() {
    if (!foldTabs || !mount) return false;
    if (deckTabs().length < sections.length) return false;
    return window.scrollY > 120 && tabsAlignedAtScroll();
  }

  function updateFolded() {
    if (!mount) return;
    mount.classList.toggle('is-folded', isFolded());
  }

  function clampScroll() {
    if (measuringScroll) return;
    if (window.scrollY > maxScrollY) {
      window.scrollTo({ top: maxScrollY, behavior: 'auto' });
    }
  }

  function layerTabTitle(layer) {
    const section = sections[layer];
    const tab = section?.querySelector('.tab');
    if (!tab) return `${depthPrefix}${layer}`;
    const code = tab.querySelector('.tab-code')?.textContent?.trim() ?? `${depthPrefix}${layer}`;
    const label = tab.querySelector('.tab-label')?.textContent?.trim() ?? '';
    return `${code}${label}`;
  }

  function setIndicators(active) {
    if (depthEl) {
      depthEl.textContent =
        active === lastLayer && isFolded()
          ? layerTabTitle(active)
          : `${depthPrefix}${active}`;
    }
    document.querySelectorAll('.stack-ruler button, .stack-ruler [data-goto], .tab-rail button, .tab[data-goto], .layer-id').forEach((el) => {
      const n = el.dataset.layer ?? el.dataset.goto;
      if (n === undefined) return;
      el.classList.toggle('active', Number(n) === active);
    });
  }

  function setFront(layer) {
    frontLayer = layer;
    sections.forEach((el) => {
      el.classList.toggle('is-front', layer !== null && Number(el.dataset.layer) === layer);
    });
    if (layer !== null) setIndicators(layer);
  }

  function clearFront() {
    setFront(null);
  }

  function scrollToLayer(layer) {
    if (isFolded() && layerScrollTops[layer] !== undefined) {
      window.scrollTo({ top: layerScrollTops[layer], behavior: 'smooth' });
      return;
    }

    const target =
      document.getElementById(`layer-${layer}`) ||
      document.querySelector(`${sectionSelector}[data-layer="${layer}"]`);
    if (!target) return;
    let y;
    if (layer === lastLayer) {
      captureMaxScroll();
      y = maxScrollY;
    } else {
      const anchor = layerAnchor(target);
      y = Math.min(
        anchor.getBoundingClientRect().top + window.scrollY - scrollPad,
        maxScrollY,
      );
    }
    const behavior = layer === lastLayer ? 'auto' : 'smooth';
    window.scrollTo({ top: Math.max(0, y), behavior });
    if (layer === lastLayer) {
      requestAnimationFrame(updateDepth);
    }
  }

  function navigateToLayer(layer) {
    clearFront();
    scrollToLayer(layer);
    requestAnimationFrame(() => {
      updateFolded();
      updateDepth();
    });
  }

  function openLayer(layer) {
    if (interactionMode === 'navigate' || isFolded()) {
      navigateToLayer(layer);
      return;
    }

    if (frontLayer === layer) {
      clearFront();
      updateDepth();
      scrollToLayer(layer);
      return;
    }

    if (frontLayer !== null) {
      clearFront();
      scrollToLayer(layer);
      requestAnimationFrame(updateDepth);
      return;
    }

    setFront(layer);
    scrollToLayer(layer);
  }

  function currentActiveLayer() {
    if (isFolded()) return lastLayer;
    const y = window.scrollY;
    let active = 0;
    for (let i = sections.length - 1; i >= 0; i--) {
      const top = layerScrollTops[i];
      if (top !== undefined && y >= top - 4) {
        active = i;
        break;
      }
    }
    return active;
  }

  function updateCovered() {
    sections.forEach((el) => {
      el.classList.remove('is-covered');
      el.style.removeProperty('--stack-blur');
    });
  }

  function updateDepth() {
    if (measuringScroll) return;
    clampScroll();
    updateFolded();
    if (frontLayer !== null) return;
    const active = currentActiveLayer();
    updateCovered();
    setIndicators(active);
    window.dispatchEvent(
      new CustomEvent('stack-depth', { detail: { active } }),
    );
  }

  window.addEventListener('stack-goto-layer', (e) => {
    const layer = Number(e.detail?.layer);
    if (Number.isFinite(layer)) openLayer(layer);
  });

  sections.forEach((panel) => {
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a[href], button[data-goto], .layer-id, .rail-tab, .tab[data-goto], .site-preview, .cta-block, .cal-slot, [data-cal-embed]')) return;
      openLayer(Number(panel.dataset.layer));
    });
  });

  document.querySelectorAll(tabSelector).forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLayer(Number(tab.dataset.goto ?? tab.dataset.layer));
    });
  });

  captureMaxScroll();
  updateDepth();

  window.addEventListener('load', () => {
    if (window.scrollY > 8) window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      captureMaxScroll();
      updateDepth();
    });
  });
  window.addEventListener('resize', () => {
    captureMaxScroll();
    updateDepth();
  }, { passive: true });
  window.addEventListener('scroll', updateDepth, { passive: true });
}
