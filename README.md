# Cellular Automaton

This project implements a basic virtual life simulation based on a simple set of rules.
You can already play with it [here](#).

### Run project

```bash
nvm use
npm install
npm run certs   # optional, serves the dev server over HTTPS (needs mkcert)
npm run dev
```

### Scripts

| Script           | What it does                        |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Start the dev server                |
| `npm run build`  | Type-check and build for production |
| `npm run check`  | Lint, type-check and run the tests  |
| `npm run format` | Format and auto-fix with Biome      |
| `npm test`       | Run the tests with Vitest           |
