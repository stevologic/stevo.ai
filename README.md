# stevo.ai

The professional portfolio of Stephen M Abbott: applied AI, cybersecurity,
product engineering, shipped work, and focused advisory services.

## What is included

- An interactive, responsive portfolio with keyboard navigation and project filters
- Eight curated live products enriched with current GitHub activity and releases
- AI, security, product, and technical advisory service offerings
- A semantic professional profile at `/resume/` that prints to exactly two pages
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

Contact handles live in `lib/contact.ts` and feed the contact block, the footer,
the résumé header, and the `sameAs` structured data from one list. The email
address is stored XOR-masked and decoded in the browser, so it never appears in
the static export.

The `@media print` block in `app/globals.css` is tuned so `/resume/` exports to
exactly two Letter pages. It sets print sizes explicitly rather than inheriting
the screen scale, so changing screen typography cannot silently add a page.
After editing résumé content, re-check the page count before publishing.

## Publishing

The deployment workflow refreshes project data, builds the static export, and
publishes it to `gh-pages` on every `main` push, on demand, and once per day.
The one-time deploy-key, Pages, and `stevo.ai` DNS setup is documented in
[`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md).

## License

MIT © 2026 Stephen M Abbott.
