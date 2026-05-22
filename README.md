# levkin.ca

Homepage design concepts for Levkin Inc.

| Page | Path | Description |
|------|------|-------------|
| **Spec** | `/spec/` | Company story as RFC-style documentation |
| **Folder** | `/stack-folder/` | Manila folders L0–L7, sticky tab stack, site previews |

Open `/` to pick a direction.

## Develop

```bash
npm install
npm run dev
```

Vite default: `http://localhost:5173`

| Page | URL |
|------|-----|
| Home | `/` |
| Spec | `/spec/` |
| Folders | `/stack-folder/` |

## Build

```bash
npm run build
# dist/
```

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
STACK_URL=http://localhost:5173/stack-folder/ npm run test:folder
```

## Related sites

- [auto.levkin.ca](https://auto.levkin.ca)
- [caseware.levkin.ca](https://caseware.levkin.ca)
- [git.levkin.ca](https://git.levkin.ca)
- [cal.levkin.ca](https://cal.levkin.ca/ilia/consult)
- [iliadobkin.com](https://iliadobkin.com)
