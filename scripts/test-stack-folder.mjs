/**
 * Tab rail alignment tests for /stack-folder/.
 * Run: STACK_URL=http://localhost:5173/stack-folder/ npm run test:folder
 */
import { chromium } from 'playwright';

const URL = process.env.STACK_URL || 'http://localhost:5173/stack-folder/';
const VERBOSE = process.env.VERBOSE === '1';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });

async function tabTops() {
  return page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.mount .tab')];
    const stick =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-stick')) * 16;
    return {
      scrollY: window.scrollY,
      isFolded: document.querySelector('.mount')?.classList.contains('is-folded'),
      stick,
      tabs: tabs.map((t) => ({
        code: t.querySelector('.tab-code')?.textContent,
        top: Math.round(t.getBoundingClientRect().top),
        left: Math.round(t.getBoundingClientRect().left),
      })),
    };
  });
}

if (VERBOSE) console.log('initial', await tabTops());

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(600);
if (VERBOSE) console.log('max scroll', await tabTops());

await page.click('[data-goto="7"]');
await page.waitForTimeout(800);
if (VERBOSE) console.log('goto L7', await tabTops());

const fail = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.mount .tab')];
  const tops = tabs.map((t) => t.getBoundingClientRect().top);
  const min = Math.min(...tops);
  const max = Math.max(...tops);
  const l7 = tabs.find((t) => t.querySelector('.tab-code')?.textContent === 'L7');
  const l0 = tabs.find((t) => t.querySelector('.tab-code')?.textContent === 'L0');
  const issues = [];
  if (max - min > 30) issues.push(`tab row spread ${Math.round(max - min)}px (want ≤30)`);
  if (l7 && l0 && Math.abs(l7.getBoundingClientRect().top - l0.getBoundingClientRect().top) > 30)
    issues.push('L7 not aligned with L0');
  if (!document.querySelector('.mount')?.classList.contains('is-folded'))
    issues.push('mount not folded at max scroll');
  return issues;
});

await browser.close();

if (fail.length) {
  console.error('FAIL:', fail.join('; '));
  process.exit(1);
}
console.log('PASS: stack-folder tab rail');
