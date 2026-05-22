/**
 * Cal.com inline embed — paste from Event type → consult → Embed → Inline.
 * Uses embed.js (not a raw iframe). No “allowed domains” setting needed for this path.
 * L0 = dark snippet, L7 = light snippet. Screenshot fallback if embed does not mount.
 */
const CAL_ORIGIN = 'https://cal.levkin.ca';
const CAL_LINK = 'ilia/consult';
const EMBED_SCRIPT = `${CAL_ORIGIN}/embed/embed.js`;

const SLOTS = {
  dark: {
    ns: 'consult-l0',
    inlineConfig: {
      layout: 'week_view',
      useSlotsViewOnSmallScreen: 'true',
      theme: 'dark',
    },
    ui: { theme: 'dark', hideEventTypeDetails: true, layout: 'week_view' },
  },
  light: {
    ns: 'consult-l7',
    inlineConfig: {
      layout: 'week_view',
      useSlotsViewOnSmallScreen: 'true',
      theme: 'light',
    },
    ui: { theme: 'light', hideEventTypeDetails: true, layout: 'week_view' },
  },
};

let calApiReady;

/** Loader from Cal embed UI */
function bootCalLoader() {
  if (window.Cal?.loaded) return;
  (function (C, A, L) {
    const p = (a, ar) => {
      a.q.push(ar);
    };
    const d = C.document;
    C.Cal =
      C.Cal ||
      function () {
        const cal = C.Cal;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () {
            p(api, arguments);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(window, EMBED_SCRIPT, 'init');
}

function waitForEmbedScript() {
  return new Promise((resolve) => {
    const finish = () => resolve(window.Cal);
    const attach = (s) => {
      if (s.dataset.calReady) {
        finish();
        return;
      }
      s.addEventListener(
        'load',
        () => {
          s.dataset.calReady = '1';
          finish();
        },
        { once: true },
      );
      s.addEventListener('error', () => resolve(null), { once: true });
    };

    const existing = document.querySelector(`script[src="${EMBED_SCRIPT}"]`);
    if (existing) {
      attach(existing);
      return;
    }

    const mo = new MutationObserver(() => {
      const s = document.querySelector(`script[src="${EMBED_SCRIPT}"]`);
      if (!s) return;
      mo.disconnect();
      attach(s);
    });
    mo.observe(document.head, { childList: true });
    window.setTimeout(() => {
      mo.disconnect();
      finish();
    }, 12000);
  });
}

function loadCalApi() {
  if (!calApiReady) {
    bootCalLoader();
    /* First init pulls in embed.js (same as Cal’s generated snippet) */
    window.Cal('init', 'consult', { origin: CAL_ORIGIN });
    calApiReady = waitForEmbedScript();
  }
  return calApiReady;
}

function mountInline(slot) {
  const targetId = slot.dataset.calTarget;
  const themeKey = slot.dataset.calTheme === 'light' ? 'light' : 'dark';
  const spec = SLOTS[themeKey];
  const el = document.getElementById(targetId);
  if (!el || !spec || !window.Cal?.ns) return;

  window.Cal('init', spec.ns, { origin: CAL_ORIGIN });

  window.Cal.ns[spec.ns]('inline', {
    elementOrSelector: `#${targetId}`,
    config: spec.inlineConfig,
    calLink: CAL_LINK,
  });

  window.Cal.ns[spec.ns]('ui', spec.ui);
}

function watchSlot(slot) {
  const targetId = slot.dataset.calTarget;
  const el = document.getElementById(targetId);
  if (!el) return;

  const showFallback = () => {
    slot.classList.add('is-blocked');
    slot.classList.remove('is-embedded');
  };
  const showEmbed = () => {
    slot.classList.remove('is-blocked');
    slot.classList.add('is-embedded');
  };

  showFallback();

  const hasLiveEmbed = () => {
    const iframe = el.querySelector('iframe');
    return Boolean(iframe && iframe.offsetHeight > 60);
  };

  const obs = new MutationObserver(() => {
    if (hasLiveEmbed()) showEmbed();
  });
  obs.observe(el, { childList: true, subtree: true });

  window.setTimeout(() => {
    obs.disconnect();
    if (!hasLiveEmbed()) showFallback();
  }, 8000);
}

export function initCalEmbeds() {
  const slots = [...document.querySelectorAll('[data-cal-embed]')];
  if (!slots.length) return;

  loadCalApi()
    .then((Cal) => {
      if (!Cal) return;
      slots.forEach((slot) => {
        mountInline(slot);
        watchSlot(slot);
      });
    })
    .catch(() => {
      /* screenshots + ↗ */
    });
}
