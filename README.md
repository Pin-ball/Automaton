# Automaton

A few simple rules, and something that looks alive. From Conway's Game of Life to Lenia, simulated on the GPU, right in the browser.

Desktop only, in a browser with WebGL 2.

## 🚀 Run

```bash
nvm use
npm install
npm run certs   # optional, HTTPS dev server (needs mkcert)
npm run dev
```

`/dev` shows a temporary engine preview.

## 🧰 Scripts

| Script           | What it does                                |
| ---------------- | ------------------------------------------- |
| `npm run dev`    | Dev server                                  |
| `npm run build`  | Type-check and production build             |
| `npm run check`  | Biome, type-check and tests                 |
| `npm run format` | Apply Biome fixes                           |
| `npm test`       | Unit tests (Node) and engine tests (Chrome) |

## 🛠️ Stack

Node 24, Vite, React 19 (React Compiler), TypeScript 7, Tailwind CSS 4, WebGL 2 (twgl.js), react-router, react-i18next, Biome, Vitest.

## 🗂️ Structure

| Folder          | Content                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `src/engine/`   | GPU simulation, independent from React ([README](src/engine/README.md)) |
| `src/rules/`    | The site's rules: pace, brush and starting seed for each                |
| `src/patterns/` | Bestiary: known shapes per rule, written in RLE                         |
| `src/features/` | Pages                                                                   |
| `src/layout/`   | Shell, 404, error and notice screens                                    |
| `src/app/`      | Router and paths                                                        |
| `src/i18n/`     | English and French translations                                         |
| `src/dev/`      | Temporary engine preview, removed before deployment                     |
| `tests/`        | Mirrors `src/`; `*.browser.test.ts` run in Chrome                       |
