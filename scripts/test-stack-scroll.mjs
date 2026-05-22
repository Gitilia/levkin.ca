/**
 * Automated scroll/blur tests for stack-folder.
 * Run: node scripts/test-stack-scroll.mjs
 */
import { chromium } from 'playwright';

const URL = process.env.STACK_URL || 'http://localhost:5173/stack-folder/';
const VIEWPORT = { width: 1280, height: 800 };

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function pass(msg) {
  console.log('PASS:', msg);
}

async function readState(page) {
  return page.evaluate(() => {
    const stick =
      parseFloat(getComputedStyle(document.documentElement).fontSize) * 3;
    const l7Tab = document.querySelector('.f7 .tab');
    const l0 = document.querySelector('.f0');
    const l0Body = document.querySelector('.f0 .body');
    const folderBlur = l0?.style.getPropertyValue('--stack-blur') || '';
    const filter = l0Body ? getComputedStyle(l0Body).filter : '';
    const blurMatch = filter.match(/blur\(([\d.]+)px\)/);
    const blurPx = blurMatch ? parseFloat(blurMatch[1]) : 0;
    return {
      scrollY: window.scrollY,
      docMax: document.documentElement.scrollHeight - innerHeight,
      l7TabTop: l7Tab?.getBoundingClientRect().top ?? null,
      stick,
      l0Covered: l0?.classList.contains('is-covered'),
      l0BlurPx: blurPx,
      folderBlur,
      l0Filter: filter,
      runway: getComputedStyle(document.querySelector('.mount')).getPropertyValue(
        '--stack-runway',
      ),
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const top = await readState(page);
  if (top.l0Covered || top.l0BlurPx > 0.1) {
    fail(`L0 blurred at top (covered=${top.l0Covered}, blur=${top.l0BlurPx})`);
  } else {
    pass('L0 clear at scroll top');
  }

  await page.evaluate(() => window.scrollTo(0, 999999));
  await page.waitForTimeout(350);
  const end = await readState(page);

  if (end.l7TabTop === null) fail('L7 tab missing');
  else   if (Math.abs(end.l7TabTop - end.stick) > 8) {
    fail(`L7 tab not on stick: top=${end.l7TabTop} stick=${end.stick} scrollY=${end.scrollY}`);
  } else {
    pass(`L7 on stick at max scroll (y=${end.scrollY}, tabTop=${end.l7TabTop.toFixed(1)})`);
  }

  if (end.l0BlurPx < 2) {
    fail(`L0 not blurred when stacked (blur=${end.l0BlurPx})`);
  } else {
    pass(`L0 blurred when stacked (blur=${end.l0BlurPx}px)`);
  }

  const midY = Math.floor(end.scrollY * 0.45);
  await page.evaluate((y) => window.scrollTo(0, y), midY);
  await page.waitForTimeout(200);
  const mid = await readState(page);
  if (mid.l0BlurPx > 2) {
    fail(`L0 still heavily blurred mid-scroll out (blur=${mid.l0BlurPx} at y=${mid.scrollY})`);
  } else {
    pass(`L0 unfades when scrolling out (blur=${mid.l0BlurPx}px at y=${mid.scrollY})`);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  const back = await readState(page);
  if (back.l0Covered || back.l0BlurPx > 0.1) {
    fail(`L0 still blurred after scroll to top (covered=${back.l0Covered}, blur=${back.l0BlurPx})`);
  } else {
    pass('L0 unfades after scroll back to top');
  }

  const maxY = end.scrollY;
  await page.evaluate((y) => window.scrollTo(0, y), maxY);
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  const back2 = await readState(page);
  if (back2.l0Covered || back2.l0BlurPx > 0.1) {
    fail(`L0 stuck after down-up cycle (blur=${back2.l0BlurPx})`);
  } else {
    pass('L0 unfades after full down-up cycle');
  }

  await browser.close();
  if (process.exitCode) {
    console.log('\nTests failed.');
    process.exit(1);
  }
  console.log('\nAll tests passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
