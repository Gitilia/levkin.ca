import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/levkin-stack-test';
mkdirSync(OUT, { recursive: true });

const pages = [
  { name: 'stack', path: '/stack/', bodySel: '.layer-inner' },
  { name: 'stack-folder', path: '/stack-folder/', bodySel: '.folder .body' },
  { name: 'stack-trace', path: '/stack-trace/', bodySel: '.frame-body' },
  { name: 'stack-rack', path: '/stack-rack/', bodySel: '.unit-body' },
];

const scrollY = [0, 400, 800, 1200, 1800, 2400];

async function analyze(page, bodySel) {
  const reveal = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return parseFloat(s.getPropertyValue('--stack-reveal')) ||
      (48 + 44 * 6 + 32);
  });

  return page.evaluate(({ bodySel, reveal }) => {
    const bodies = [...document.querySelectorAll(bodySel)];
    const stacked = bodies.filter((b) => {
      const r = b.getBoundingClientRect();
      return Math.abs(r.top - reveal) < 35 && r.height > 80;
    });
    const visible = bodies.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.height > 80 && r.bottom > 0 && r.top < innerHeight;
    });
    const el = document.elementFromPoint(innerWidth / 2, reveal + 100);
    const panel = el?.closest('.folder, .layer, .frame, .unit');
    const layer = panel?.closest('[data-layer]')?.dataset?.layer;
    const title = panel?.querySelector('h1, h2, strong')?.textContent?.trim().slice(0, 50);
    return {
      scrollY: Math.round(window.scrollY),
      reveal: Math.round(reveal),
      stackedCount: stacked.length,
      visibleCount: visible.length,
      topLayer: layer,
      topTitle: title,
      issues: [],
    };
  }, { bodySel, reveal });
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const { name, path, bodySel } of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const shots = [];
  for (const y of scrollY) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(250);
    const data = await analyze(page, bodySel);
    if (data.stackedCount < 2 && y > 200) data.issues.push('not stacking (need 2+ bodies at reveal line)');
    if (data.visibleCount > 2 && y > 200) data.issues.push(`${data.visibleCount} bodies spread out, not covering`);
    await page.screenshot({ path: join(OUT, `${name}-scroll-${y}.png`) });
    shots.push({ y, ...data });
  }
  report.push({ name, shots });
  await page.close();
}

await browser.close();
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map((r) => ({
  variant: r.name,
  checks: r.shots.map((s) => ({ y: s.y, stacked: s.stackedCount, top: s.topTitle, issues: s.issues })),
})), null, 2));
