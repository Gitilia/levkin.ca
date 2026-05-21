import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5176';
const OUT = '/tmp/levkin-stack-test';
mkdirSync(OUT, { recursive: true });

const pages = [
  { name: 'stack', path: '/stack/' },
  { name: 'stack-folder', path: '/stack-folder/' },
  { name: 'stack-trace', path: '/stack-trace/' },
  { name: 'stack-rack', path: '/stack-rack/' },
];

const scrollY = [0, 400, 800, 1200, 1800, 2400];

async function analyze(page, label) {
  return page.evaluate(() => {
    const sections = [...document.querySelectorAll('.scroll-section')];
    const bodies = [...document.querySelectorAll('.body, .layer-inner, .frame-body, .unit-body')];
    const tabs = [...document.querySelectorAll('.tab, .frame-line, .unit-head')];
    const sticky = [...document.querySelectorAll('.tab, .body, .layer-inner, .frame-line, .frame-body, .unit-head, .unit-body')];
    const rects = (els) => els.map((el, i) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        i,
        tag: el.className?.slice?.(0, 40) || el.tagName,
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
        position: cs.position,
        zIndex: cs.zIndex,
        visible: r.height > 0 && r.bottom > 0 && r.top < innerHeight,
      };
    });
    const visibleBodies = rects(bodies).filter((b) => b.visible && b.height > 80);
    const mount = document.querySelector('.mount, .stack-mount');
    const mountH = mount ? Math.round(mount.getBoundingClientRect().height) : 0;
    return {
      scrollY: Math.round(window.scrollY),
      pageH: Math.round(document.documentElement.scrollHeight),
      viewport: innerHeight,
      sections: sections.length,
      visibleBodyCount: visibleBodies.length,
      visibleBodies,
      mountDocHeight: mountH,
      firstSectionTop: sections[0] ? Math.round(sections[0].getBoundingClientRect().top) : null,
      lastSectionBottom: sections.at(-1) ? Math.round(sections.at(-1).getBoundingClientRect().bottom) : null,
      stickyPositions: rects(sticky.filter((el) => getComputedStyle(el).position === 'sticky')).slice(0, 14),
    };
  });
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const { name, path } of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const url = BASE + path;
  await page.goto(url, { waitUntil: 'networkidle' });
  const shots = [];
  for (const y of scrollY) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(200);
    const data = await analyze(page, name);
    const file = join(OUT, `${name}-scroll-${y}.png`);
    await page.screenshot({ path: file, fullPage: false });
    shots.push({ y, file, ...data });
  }
  report.push({ name, url, shots });
  await page.close();
}

await browser.close();

const summary = report.map((r) => {
  const problems = r.shots.map((s) => {
    const issues = [];
    if (s.visibleBodyCount > 2) issues.push(`${s.visibleBodyCount} bodies visible (want ≤2)`);
    if (s.scrollY === 0 && s.visibleBodyCount > 1) issues.push('top: multiple full bodies');
    if (s.pageH > s.viewport * 8) issues.push(`page very tall: ${s.pageH}px`);
    return { y: s.y, issues, visibleBodyCount: s.visibleBodyCount, pageH: s.pageH };
  });
  return { variant: r.name, url: r.url, scrollChecks: problems };
});

writeFileSync(join(OUT, 'report.json'), JSON.stringify({ report, summary }, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log('\nScreenshots:', OUT);
