# levkin.ca

Design concepts for the Levkin software development company homepage.

| Option | Path | Vibe |
|--------|------|------|
| **Spec** | `/spec/` | RFC documentation, endpoints, iliadobkin.com |
| **Cards** | `/stack/` | Dark overlapping sticky cards — click a layer to bring it forward |
| **Folder** | `/stack-folder/` | Manila folders, staggered tabs (L0–L7), site previews |

Open `/` to compare all three.

## Develop

```bash
cd ~/Documents/code/levkin.ca
npm install
npm run dev
```

Vite serves the multi-page app (default `http://localhost:5173`). If that port is busy, pass another: `npx vite --port 5175`.

| Page | URL |
|------|-----|
| Compare | `/` |
| Spec | `/spec/` |
| Cards | `/stack/` |
| Folders | `/stack-folder/` |

## Build

```bash
npm run build
# output in dist/
```

## Folder site (`/stack-folder/`)

Eight manila folders (L0–L7) with labeled tabs. Scroll stacks earlier tabs on a shared rail; L7 rises into the row last. Scroll depth is capped when all tabs align (`is-folded`).

- **L0** — Company + Cal embed  
- **L1** — Scope + spec preview  
- **L2** — Services  
- **L3–L5** — Automation, CaseWare, QA previews  
- **L6** — Git repos preview  
- **L7** — Terms + Cal embed  

Modules: `shared/stack-scroll.js` (scroll/fold), `folder-rail.js` (side rail), `folder-cal.js` (Cal.com embeds).

### Preview screenshots

Each linked folder shows a screenshot; refresh captures with dev server running:

```bash
npm run dev   # separate terminal
npm run capture-previews
```

Writes PNGs to `stack-folder/previews/`.

### Tests (Playwright)

Requires dev server on the URL you pass:

```bash
npm run dev
STACK_URL=http://localhost:5173/stack-folder/ npm run test:folder
STACK_URL=http://localhost:5173/stack-folder/ npm run test:stack-scroll
```

`test:folder` checks tab alignment at max scroll and L7 jump. `test:stack-scroll` covers scroll/blur behavior on the card stack.

## Related sites

- [auto.levkin.ca](https://auto.levkin.ca) — automation
- [caseware.levkin.ca](https://caseware.levkin.ca) — CaseWare consulting
- [jobs.levkin.ca](https://jobs.levkin.ca) — job orchestration
- [git.levkin.ca](https://git.levkin.ca) — source control
- [iliadobkin.com](https://iliadobkin.com) — SDET portfolio · quality engineering
