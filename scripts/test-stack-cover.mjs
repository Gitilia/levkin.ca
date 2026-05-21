import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const REVEAL = 48 + 44 * 6 + 32; // approx px

async function testCover(page, path, bodySel, getTitle) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const results = [];
  for (const y of [0, 600, 1200, 1800]) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(250);
    const r = await page.evaluate(({ bodySel, reveal }) => {
      const bodies = [...document.querySelectorAll(bodySel)];
      const stacked = bodies.filter((b) => {
        const br = b.getBoundingClientRect();
        return Math.abs(br.top - reveal) < 30 && br.height > 100;
      });
      const top = stacked.sort((a, b) => {
        const az = parseInt(getComputedStyle(a.closest('.folder, .layer, .frame, .unit') || a).zIndex) || 0;
        const bz = parseInt(getComputedStyle(b.closest('.folder, .layer, .frame, .unit') || b).zIndex) || 0;
        return bz - az;
      })[0];
      const el = document.elementFromPoint(innerWidth / 2, reveal + 120);
      const hit = el?.closest('.folder, .layer, .frame, .unit');
      const layer = hit?.closest('[data-layer]')?.dataset?.layer ?? hit?.className?.match(/f(\d)|layer-(\d)|u(\d)/)?.[1];
      return {
        scrollY: scrollY,
        stackedCount: stacked.length,
        topZ: top ? getComputedStyle(top.closest('.folder, .layer, .frame, .unit')).zIndex : null,
        hitLayer: layer,
        hitText: hit?.querySelector('h1, h2, strong')?.textContent?.slice(0, 40),
      };
    }, { bodySel, reveal: REVEAL });
    results.push(r);
  }
  return results;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const folder = await testCover(page, '/stack-folder/', '.folder .body', (b) => b.querySelector('h1,h2')?.textContent);
console.log('folder', JSON.stringify(folder, null, 2));

await page.screenshot({ path: '/tmp/levkin-cover-folder-1200.png' });
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/levkin-cover-folder-1200b.png' });

await browser.close();
