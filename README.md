# levkin.ca

Homepage design concepts for Levkin Inc.

**Status:** active. **Production:** [levkin.ca](https://levkin.ca) (`/` → spec, `/folders/` → stack).

| Page | Path | Description |
|------|------|-------------|
| **Spec** | `/spec/` | Company story as RFC-style documentation |
| **Folder** | `/stack-folder/` | Manila folders L0–L7, sticky tab stack, site previews |

**Production** (`levkin.ca`): `/` → spec, `/folders/` → stack. Dev picker at `/` only when running `npm run dev` (not deployed).

## Develop

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5175` (5173 is often taken by other apps)

| Page | URL |
|------|-----|
| Home | `/` |
| Spec | `/spec/` |
| Folders | `/stack-folder/` |

## Build

```bash
npm run build
# dist/ — Vite multi-page output

npm run build:www
# www/ — production layout for nginx (commit www/ before deploy)
```

### Deploy

Deployed to the homelab web LXC via the private ansible repo (see internal docs).

## Folder stack (`/stack-folder/`)

Eight layers with labeled tabs. Scroll pins earlier tabs on a shared rail; L7 joins last. Scroll stops when all tabs align.

- `shared/stack-scroll.js` — scroll depth, fold state, layer jump
- `stack-folder/folder-rail.js` — side rail
- `stack-folder/folder-cal.js` — Cal.com embeds

### Preview screenshots

```bash
npm run dev          # separate terminal
npm run capture-previews
```

Writes PNGs used in `stack-folder/previews/` (spec, auto, caseware, iliadobkin, git-repos, cal dark/light).

### Test

```bash
npm run dev
STACK_URL=http://localhost:5175/stack-folder/ npm run test:folder
```

Playwright runs **desktop** (tab alignment at max scroll) and **mobile** (bottom tab rail, no horizontal overflow, L3 jump).

### Test on a phone

Dev server listens on your LAN (`host: true` in Vite config):

```bash
npm run dev
# open http://<your-lan-ip>:5175/stack-folder/ on the phone (same Wi‑Fi)
```

Production: [levkin.ca/folders/](https://levkin.ca/folders/) — on viewports ≤720px the side rail becomes a **bottom tab bar** (L0–L7) with safe-area padding for iOS.

## Related sites

- [auto.levkin.ca](https://auto.levkin.ca)
- [caseware.levkin.ca](https://caseware.levkin.ca)
- [github.com/Gitilia](https://github.com/Gitilia) (public mirrors)
- [cal.levkin.ca](https://cal.levkin.ca/ilia/consult)
- [iliadobkin.com](https://iliadobkin.com)

## License

Private repo.
