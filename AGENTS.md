# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single service: a **Next.js 16 static-export** portfolio site
(`stevo.ai`). Standard commands live in `package.json` (`dev`, `build`, `lint`,
`typecheck`, `test`) and `README.md`; use those rather than reinventing them.

### Node version (important, non-obvious)

- CI runs on **Node 24** (`.github/workflows/ci.yml`), and the test suite
  requires it: `tests/static-export.test.mjs` imports TypeScript files directly
  (e.g. `../lib/contact.ts`), which only works with Node's native type
  stripping (unflagged on Node ≥ 22.18 / ≥ 23.6). On the older Node that ships
  in the base image, that one test fails with
  `Unknown file extension ".ts"` even though `build`, `lint`, `typecheck`, the
  dev server, and the other 45 tests all pass.
- The startup/update script installs Node 24 via `nvm`, sets it as the nvm
  default (so login shells and tmux sessions use it), and symlinks
  `node`/`npm`/`npx` into `/usr/local/cargo/bin` so that even the
  non-login command shell resolves Node 24. If you ever see the `.ts` import
  error, confirm `node --version` reports v24 and re-run the update script.

### Running / testing

- Dev server: `npm run dev` (Next.js + Turbopack) on
  `http://localhost:3000`. Routes: `/` (homepage) and `/resume/`. Run it in a
  tmux/login shell so it inherits Node 24.
- `npm test` runs `build` → `node --test tests/static-export.test.mjs` →
  `verify:pdf`. The tests assert against the **built `out/` export**, so a
  build must succeed first (the `test` script chains it automatically).
- `verify:pdf` prints `/resume/` with headless Chrome and fails unless it is
  exactly two Letter pages. It **skips cleanly when no browser is found**; this
  VM has Chrome at `/usr/bin/google-chrome`, so it runs for real. CI
  deliberately skips it because the résumé's serif fonts are absent on the
  Linux runner and would report a wrong page count — locally it works here.
- The site is a static export (`output: "export"` in `next.config.ts`); there
  is no backend, database, or runtime server in production.

### Data & scripts

- `data/*.generated.json` are committed snapshots consumed by the build. The
  `scripts/*.mjs` refreshers (`sync:github`, `discover`, `icons`, `critique`,
  etc.) hit the live GitHub/xAI APIs and need tokens (`GROK_API_KEY`,
  `PROJECT_TRAFFIC_TOKEN`) that only CI holds — they are **not** required to
  build, test, or run the site locally, so skip them for normal dev work.
