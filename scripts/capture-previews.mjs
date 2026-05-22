#!/usr/bin/env node
/** Refresh stack-folder/previews/*.png — run dev server first for local shots */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'stack-folder/previews');
const base = process.env.PREVIEW_BASE || 'http://localhost:5177';

mkdirSync(out, { recursive: true });

const shots = [
  ['spec', `${base}/spec/`],
  ['auto', 'https://auto.levkin.ca'],
  ['caseware', 'https://caseware.levkin.ca'],
  ['iliadobkin', 'https://iliadobkin.com'],
  ['git-repos', 'https://git.levkin.ca/explore/repos'],
  ['cal', 'https://cal.levkin.ca/ilia/consult'],
];

async function setCalTheme(page, mode) {
  await page.evaluate((want) => {
    const root = document.documentElement;
    const btn = [...document.querySelectorAll('button, [role="button"], label, a')].find(
      (el) => new RegExp(want, 'i').test(el.textContent || el.getAttribute('aria-label') || ''),
    );
    if (btn) btn.click();
    if (want === 'dark') {
      root.dataset.theme = 'dark';
      root.classList.add('dark');
    } else {
      root.dataset.theme = 'light';
      root.classList.remove('dark');
    }
  }, mode);
}

async function captureCal(page, outDir, theme) {
  const url = 'https://cal.levkin.ca/ilia/consult';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(1200);
  await setCalTheme(page, theme);
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    window.scrollTo(0, 120);
  });
  await page.waitForTimeout(600);

  const file = theme === 'light' ? 'cal-light.png' : 'cal-dark.png';
  await page.screenshot({
    path: join(outDir, file),
    clip: { x: 0, y: 0, width: 1280, height: 680 },
  });
  console.log(`✓ ${file}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const [name, url] of shots) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(out, `${name}.png`) });
    console.log(`✓ ${name}.png`);
  } catch (err) {
    console.warn(`✗ ${name}: ${err.message}`);
  }
}

try {
  await captureCal(page, out, 'dark');
  await captureCal(page, out, 'light');
} catch (err) {
  console.warn(`✗ cal captures: ${err.message}`);
}

await browser.close();
