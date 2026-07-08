/**
 * Tab rail alignment tests for /stack-folder/ (desktop + mobile).
 * Run: STACK_URL=http://localhost:5175/stack-folder/ npm run test:folder
 */
import { chromium, devices } from 'playwright';

const URL = process.env.STACK_URL || 'http://localhost:5175/stack-folder/';
const VERBOSE = process.env.VERBOSE === '1';

async function runViewport(name, contextOptions) {
  const browser = await chromium.launch();
  const page = await browser.newPage(contextOptions);
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

  if (VERBOSE) console.log(`${name} initial`, await tabTops());

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  if (VERBOSE) console.log(`${name} max scroll`, await tabTops());

  const railVisible = await page.evaluate(() => {
    const rail = document.querySelector('.tab-rail');
    if (!rail) return false;
    return getComputedStyle(rail).display !== 'none';
  });

  if (name === 'mobile' && !railVisible) {
    await browser.close();
    return [`${name}: mobile tab rail not visible`];
  }

  const foldIssues = await page.evaluate(({ isMobile }) => {
    const tabs = [...document.querySelectorAll('.mount .tab')];
    const tops = tabs.map((t) => t.getBoundingClientRect().top);
    const min = Math.min(...tops);
    const max = Math.max(...tops);
    const issues = [];
    const spreadLimit = isMobile ? 40 : 30;

    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      issues.push('horizontal overflow');
    }
    if (max - min > spreadLimit) {
      issues.push(`tab row spread ${Math.round(max - min)}px (want ≤${spreadLimit})`);
    }
    if (!document.querySelector('.mount')?.classList.contains('is-folded')) {
      issues.push('mount not folded at max scroll');
    }
    return issues;
  }, { isMobile: name === 'mobile' });

  if (foldIssues.length) {
    await browser.close();
    return foldIssues.map((issue) => `${name}: ${issue}`);
  }

  if (name === 'mobile') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.locator('.tab-rail .rail-tab[data-goto="3"]').tap();
    await page.waitForTimeout(800);
    if (VERBOSE) console.log(`${name} rail goto L3`, await tabTops());
  } else {
    await page.click('[data-goto="7"]');
    await page.waitForTimeout(800);
    if (VERBOSE) console.log(`${name} goto L7`, await tabTops());
  }

  const fail = await page.evaluate(({ isMobile }) => {
    const issues = [];

    if (isMobile) {
      const rail = document.querySelector('.tab-rail .rail-tab[data-goto="3"]');
      const railBox = rail?.getBoundingClientRect();
      if (!railBox || railBox.height < 40) issues.push('rail tap target too small');
      if (window.scrollY < 100) issues.push('rail L3 tap did not scroll');
    } else {
      const tabs = [...document.querySelectorAll('.mount .tab')];
      const tops = tabs.map((t) => t.getBoundingClientRect().top);
      const l7 = tabs.find((t) => t.querySelector('.tab-code')?.textContent === 'L7');
      const l0 = tabs.find((t) => t.querySelector('.tab-code')?.textContent === 'L0');
      if (l7 && l0 && Math.abs(l7.getBoundingClientRect().top - l0.getBoundingClientRect().top) > 30) {
        issues.push('L7 not aligned with L0');
      }
    }

    return issues;
  }, { isMobile: name === 'mobile' });

  await browser.close();
  return fail.map((issue) => `${name}: ${issue}`);
}

const desktop = { viewport: { width: 1400, height: 900 } };
const mobile = { ...devices['iPhone 13'], hasTouch: true };

const results = [
  ...(await runViewport('desktop', desktop)),
  ...(await runViewport('mobile', mobile)),
];

if (results.length) {
  console.error('FAIL:', results.join('; '));
  process.exit(1);
}
console.log('PASS: stack-folder (desktop + mobile)');
