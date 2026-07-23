import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function exportedPage(path) {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the site, install icons, and social assets", async () => {
  await Promise.all([
    access(new URL("../out/index.html", import.meta.url)),
    access(new URL("../out/resume/index.html", import.meta.url)),
    access(new URL("../out/CNAME", import.meta.url)),
    access(new URL("../out/og.png", import.meta.url)),
    access(new URL("../out/favicon.ico", import.meta.url)),
    access(new URL("../out/favicon-16x16.png", import.meta.url)),
    access(new URL("../out/favicon-32x32.png", import.meta.url)),
    access(new URL("../out/apple-touch-icon.png", import.meta.url)),
    access(new URL("../out/icon-192.png", import.meta.url)),
    access(new URL("../out/icon-512.png", import.meta.url)),
    access(new URL("../out/site.webmanifest", import.meta.url)),
  ]);
});

test("portfolio contains the finished content and social metadata", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /Build what(?:&apos;|&#x27;|')s next\./i);
  assert.match(html, /Security leadership|Applied AI \+ Cybersecurity/i);
  assert.match(html, /Shiba Studio/);
  assert.match(html, /security-recipes\.ai/);
  assert.match(html, /Services/);
  assert.match(html, /https:\/\/stevo\.ai\/og\.png/);
  assert.match(html, /summary_large_image/);
  assert.match(html, /twitter:image/);
  assert.match(html, /twitter:image:alt/);
  assert.match(html, /og:image:width/);
  assert.match(html, /Explore shipped AI products/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /href="\/apple-touch-icon\.png"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /href="\/site\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  assert.doesNotMatch(html, />Navigate<|⌘ K|Site navigator/i);
});

test("site manifest uses installable Stevo.AI icons", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../out/site.webmanifest", import.meta.url), "utf8"),
  );

  assert.equal(manifest.short_name, "Stevo.AI");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#15161c");
  assert.deepEqual(
    manifest.icons.map(({ src, sizes, purpose }) => ({ src, sizes, purpose })),
    [
      { src: "/icon-192.png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", purpose: "any maskable" },
    ],
  );
});

test("command palette and navigation hotkeys are removed", async () => {
  const [component, styles] = await Promise.all([
    readFile(new URL("../components/PortfolioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(
    component,
    /paletteOpen|paletteQuery|command-button|metaKey|ctrlKey|Site navigator|⌘ K/,
  );
  assert.doesNotMatch(
    styles,
    /command-button|command-overlay|command-dialog|command-search|command-results/,
  );
});

test("desktop project grid uses four compact cards per row", async () => {
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /@media \(min-width: 1280px\)/);
  assert.match(
    styles,
    /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/,
  );
  assert.match(styles, /grid-column: span 1/);
  assert.match(styles, /min-height: 560px/);
});

test("professional theme follows the formal portrait palette", async () => {
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--ink: #15161c/);
  assert.match(styles, /--accent: #aaa8cf/);
  assert.match(styles, /--accent-deep: #56547b/);
  assert.match(styles, /--accent-cool: #7e93a7/);
  assert.match(styles, /\.hero-orbit\s*{[^}]*opacity: 0\.2/s);
  assert.doesNotMatch(styles, /#b8f34b|#ff6b52|#69d8ff/i);
});

test("professional resume is detailed, private, and print-ready", async () => {
  const html = await exportedPage("resume/index.html");

  assert.match(html, /Professional resume/);
  assert.match(html, /Stephen M Abbott/);
  assert.match(html, /Professional experience/);
  assert.match(html, /16 years/);
  assert.match(html, /92%/);
  assert.match(html, /75%/);
  assert.match(html, /99\.99%/);
  assert.match(html, /2024-2026/);
  assert.match(html, /2021-2024/);
  assert.match(html, /2019-2021/);
  assert.match(html, /2014-2019/);
  assert.match(html, /2010-2014/);
  assert.match(html, /Employer names intentionally omitted/);
  assert.match(html, /Print \/ save as PDF/);
  assert.doesNotMatch(html, /American Express/i);
  assert.doesNotMatch(html, /Full career r(?:é|&eacute;|&#xE9;)sum(?:é|&eacute;|&#xE9;) available on request/i);
});

test("custom domain is configured", async () => {
  const cname = await readFile(new URL("public/CNAME", root), "utf8");
  assert.equal(cname.trim(), "stevo.ai");
});
