const MESSAGES = [
  {
    morse: '·−·−− · ·−·−− ·−· · ·−·−− −−− · ·−·−− ·−· · ·−·−− ·−−−',
    text: 'Levkin builds production software for teams under pressure. Custom systems, automation, enterprise tooling.',
  },
  {
    morse: '−−− ·−·−− · ·−·−− ·−· · ·−·−− ·−−− · ·−·−− ·−· · ·−·−− −−− · ·−·−− ·−· · ·−·−− ·−−−',
    text: 'Error handling required. Documentation required. Tests before live data. Scope creep rejected.',
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
