import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5176/stack-folder/', { waitUntil: 'networkidle' });

for (const y of [0, 400, 800, 1200]) {
  await page.evaluate((sy) => window.scrollTo(0, sy), y);
  await page.waitForTimeout(150);
  const data = await page.evaluate(() => {
    return [...document.querySelectorAll('.folder')].map((f, i) => {
      const cs = getComputedStyle(f);
      const r = f.getBoundingClientRect();
      const body = f.querySelector('.body');
      const br = body.getBoundingClientRect();
      const sec = f.closest('.scroll-section');
      const sr = sec.getBoundingClientRect();
      return {
        i,
        folderTop: Math.round(r.top),
        bodyTop: Math.round(br.top),
        position: cs.position,
        top: cs.top,
        zIndex: f.style.zIndex || cs.zIndex,
        sectionTop: Math.round(sr.top),
        sectionBottom: Math.round(sr.bottom),
        sectionH: Math.round(sr.height),
      };
    });
  });
  console.log('scroll', y, JSON.stringify(data.filter((d) => d.sectionBottom > 0 && d.sectionTop < 800), null, 2));
}

await browser.close();
