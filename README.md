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

### Publishing a new project

Projects appear automatically. `scripts/discover-projects.mjs` runs in the daily
deploy, lists the owner's public repositories, and writes a card for any that is
not already curated. To publish a project:

1. Make the repository public.
2. Set its **Website** field on GitHub to the live URL.

The next daily build picks it up — no change to this repository. A repository
qualifies when it is public, not a fork, archive, or template, is not listed in
`exclude`, and resolves to a site URL. Requiring that URL is deliberate: it is a
single field the owner controls on GitHub, and it means a scratch repository
going public never auto-publishes to a professional portfolio. Repositories
without one are listed in the workflow log rather than published.

Generated copy is plain by design. Adding a full entry to `content/projects.json`
always overrides it, so promote a discovered project by curating it. Settings
(owner, exclusions, site-URL and name overrides, category keywords) live in
`content/discovery.json`; run `npm run discover` to preview locally.

Editorial project copy and display order live in `content/projects.json`.
`scripts/sync-github.mjs` merges current public repository metadata into
`data/github.generated.json`; raw GitHub descriptions never replace the curated
portfolio narrative.

The palette is derived from the portrait, which samples as a warm near-neutral
(average `#4a4143`, low saturation, dominated by blacks and warm browns). `--ink`
is the near-black field, `--accent` the muted violet used for small elements,
and `--accent-surface` a near-neutral step down from it for the large panels —
the metric strip and the closing section — because at full width the accent
would set the page's entire colour impression. Changing `--ink` or `--accent`
means re-running `npm run icons`.

Icons are generated, not hand-drawn. `npm run icons` renders the header brand
mark — an accent circle with an italic serif "S" — at every required size using
headless Chrome, reading `--ink` and `--accent` straight from the theme. Small
sizes go full bleed with a proportionally larger glyph, because italic serif
hairlines disappear into anti-aliasing at 16px. Re-run it after changing either
colour token.

Contact handles live in `lib/contact.ts` and feed the contact block, the footer,
the résumé header, and the `sameAs` structured data from one list. The email
address is stored XOR-masked and decoded in the browser, so it never appears in
the static export.

Service tracks, engagement models, the engagement process, and working
principles live in `lib/services.ts`; credentials live in `lib/credentials.ts`.
Both feed the page and the structured data, so the marketing copy and the
machine-readable claims cannot drift apart. Credential wording is deliberate —
completed training is described as training, never as certification — and the
`standards` on each service track name frameworks the work is measured against,
not certifications held.

The `@media print` block in `app/globals.css` is tuned so `/resume/` exports to
exactly two Letter pages. It sets print sizes explicitly rather than inheriting
the screen scale, so changing screen typography cannot silently add a page.
After editing résumé content, re-check the page count before publishing.

A Letter page with 0.42in margins is roughly 735 CSS px wide, so responsive
breakpoints are scoped with `@media screen and (max-width: …)`. Without the
`screen` keyword a `max-width: 760px` block matches while printing, collapses
the résumé to the mobile single-column layout, and silently adds a third page.
A test enforces this.

Verify the page count against a real PDF, not a screen approximation. Emulating
print by measuring the DOM in a normal viewport is unreliable: `break-inside`
pushes and Chrome's widow/orphan handling both add height that a naive
content-height calculation misses. `npm test` runs the real check, which prints
the built export with headless Chrome and fails if the PDF is not two pages:

```sh
npm run verify:pdf
```

It skips cleanly when no browser is installed; set `CHROME_PATH` to point at a
specific binary. The layout currently measures ~1650px of content against a
1950px two-page budget, so there is roughly one third of a page in reserve.

## Publishing

The deployment workflow refreshes project data, builds the static export, and
publishes it to `gh-pages` on every `main` push, on demand, and once per day.
The one-time deploy-key, Pages, and `stevo.ai` DNS setup is documented in
[`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md).

## License

MIT © 2026 Stephen M Abbott.
