# stevo.ai

The professional portfolio of Stephen M Abbott: applied AI, cybersecurity,
product engineering, shipped work, and focused advisory services.

## What is included

- An interactive, responsive portfolio with keyboard navigation and project filters
- Eight curated live products enriched with current GitHub activity and releases
- AI, security, product, and technical advisory service offerings
- A semantic, print-ready professional profile at `/resume/`
- Social, search, sitemap, custom-domain, and reduced-motion support
- Automated daily project refresh and deployment to the `gh-pages` branch

## Local development

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:3000`.

Refresh the committed GitHub snapshot when needed:

```sh
npm run sync:github
```

Validate the static GitHub Pages export:

```sh
npm test
```

The production build is written to `out/`.

## Content model

Editorial project copy and display order live in `content/projects.json`.
`scripts/sync-github.mjs` merges current public repository metadata into
`data/github.generated.json`; raw GitHub descriptions never replace the curated
portfolio narrative.

## Publishing

The deployment workflow refreshes project data, builds the static export, and
publishes it to `gh-pages` on every `main` push, on demand, and once per day.
The one-time deploy-key, Pages, and `stevo.ai` DNS setup is documented in
[`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md).

## License

MIT © 2026 Stephen M Abbott.
