#!/usr/bin/env node
/**
 * Build Vite output and lay out www/ for production nginx:
 *   /           → spec
 *   /folders/   → stack-folder
 */
import { cp, mkdir, rm, readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const www = join(root, 'www');
const umamiId = process.env.UMAMI_WEBSITE_ID || '2a3bc7b2-b827-4770-8b31-c94016667734';

const umamiScript = `    <script defer src="https://stats.levkin.ca/script.js" data-website-id="${umamiId}"></script>\n`;

function injectUmami(html) {
  if (html.includes('stats.levkin.ca')) return html;
  return html.replace('</head>', `${umamiScript}  </head>`);
}

function patchHtml(html, patches) {
  let out = html;
  for (const [from, to] of patches) {
    out = out.split(from).join(to);
  }
  return injectUmami(out);
}

execSync('npm run build', { cwd: root, stdio: 'inherit' });

await rm(www, { recursive: true, force: true });
await mkdir(join(www, 'assets'), { recursive: true });
await mkdir(join(www, 'folders'), { recursive: true });

await cp(join(dist, 'assets'), join(www, 'assets'), { recursive: true });
await cp(join(root, 'public', 'favicon.svg'), join(www, 'favicon.svg'));
await cp(join(root, 'public', 'robots.txt'), join(www, 'robots.txt'));
await cp(join(root, 'public', 'sitemap.xml'), join(www, 'sitemap.xml'));
await cp(join(root, 'public', 'og-image.png'), join(www, 'og-image.png'));

const specHtml = await readFile(join(dist, 'spec', 'index.html'), 'utf8');
await writeFile(
  join(www, 'index.html'),
  patchHtml(specHtml, [
    ['<a href="/" class="back">← all options</a>', '<a href="/folders/" class="back">← folders</a>'],
  ]),
  'utf8',
);

const folderHtml = await readFile(join(dist, 'stack-folder', 'index.html'), 'utf8');
await cp(join(root, 'stack-folder', 'previews'), join(www, 'folders', 'previews'), { recursive: true });
await writeFile(
  join(www, 'folders', 'index.html'),
  patchHtml(folderHtml, [
    ['href="/spec/"', 'href="/"'],
  ]),
  'utf8',
);

console.log(`www/ ready (Umami id: ${umamiId})`);
