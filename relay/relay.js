const MESSAGES = [
  {
    morse: '·−·−− · ·−·−− ·−· · ·−·−− −−− · ·−·−− ·−· · ·−·−− ·−−−',
    text: 'Levkin — Canadian software practice. Custom apps, automation (n8n, CI/CD, LLMs), CaseWare, SDET. Remote NA & EU. Taking new work.',
  },
  {
    morse: '−−− ·−·−− · ·−·−− ·−· · ·−·−− ·−−− · ·−·−− ·−· · ·−·−− −−−',
    text: 'Proof: 15+ years enterprise. CaseWare releases cut from 8 hours to under 2 minutes. Automation runs 24/7 — not demos.',
  },
  {
    morse: '·−·−− · ·−·−− ·−· · ·−·−− −−− · ·−·−− ·−· · ·−·−− ·−−−',
    text: 'Discover (15 min) → Proposal (fixed scope) → Ship (tested, documented) → Maintain (optional). auto.levkin.ca · caseware.levkin.ca · iliadobkin.com',
  },
  {
    morse: '−−− ·−·−− · ·−·−− ·−· · ·−·−− ·−−− · ·−·−− ·−· · ·−·−− −−− · ·−·−− ·−· · ·−·−− ·−−−',
    text: 'Error handling required. Documentation required. Tests before live data. Pragmatism: 20-line script beats 200-node workflow when it fits.',
  },
];

const morseEl = document.getElementById('morse');
const decodedEl = document.getElementById('decoded');
const btn = document.getElementById('decode-btn');
let idx = 0;
let typing = false;

function typeMorse(text, cb) {
  typing = true;
  morseEl.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      morseEl.textContent += text[i];
      i++;
      setTimeout(tick, 35 + Math.random() * 40);
    } else {
      typing = false;
      cb?.();
    }
  };
  tick();
}

function showMessage() {
  const msg = MESSAGES[idx % MESSAGES.length];
  decodedEl.classList.add('hidden');
  typeMorse(msg.morse, () => {
    btn.disabled = false;
    btn.textContent = 'Decode ↵';
  });
  btn._pending = msg;
}

btn.addEventListener('click', () => {
  if (typing) return;
  if (btn._pending && decodedEl.classList.contains('hidden')) {
    decodedEl.textContent = btn._pending.text;
    decodedEl.classList.remove('hidden');
    btn.textContent = 'Next signal →';
    btn._pending = null;
    return;
  }
  idx++;
  showMessage();
});

showMessage();
