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
    access(new URL("../out/og-services.png", import.meta.url)),
    access(new URL("../out/favicon.ico", import.meta.url)),
    access(new URL("../out/favicon-16x16.png", import.meta.url)),
    access(new URL("../out/favicon-32x32.png", import.meta.url)),
    access(new URL("../out/apple-touch-icon.png", import.meta.url)),
    access(new URL("../out/icon-192.png", import.meta.url)),
    access(new URL("../out/icon-512.png", import.meta.url)),
    access(new URL("../out/site.webmanifest", import.meta.url)),
  ]);
});

test("site contains service-first positioning and social metadata", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /Secure the business\./i);
  assert.match(html, /Enable what(?:&apos;|&#x27;|')s next\./i);
  assert.match(html, /vCISO &amp; security leadership/i);
  assert.match(html, /AI enablement &amp; governance/i);
  assert.match(html, /Considering select professional engagements/i);
  assert.match(html, /Shiba Studio/);
  assert.match(html, /security-recipes\.ai/);
  assert.match(html, /Stephen M Abbott/);
  assert.match(html, /https:\/\/stevo\.ai\/og-services\.png/);
  assert.match(html, /summary_large_image/);
  assert.match(html, /twitter:image/);
  assert.match(html, /twitter:image:alt/);
  assert.match(html, /og:image:width/);
  assert.match(html, /Principal-led cybersecurity and AI enablement consulting/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /href="\/apple-touch-icon\.png"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /href="\/site\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  assert.doesNotMatch(html, />Navigate<|⌘ K|Site navigator/i);
});

test("professional services precede delivery proof and portfolio", async () => {
  const html = await exportedPage("index.html");
  const servicesIndex = html.indexOf(
    '<section class="services-section section" id="services">',
  );
  const workIndex = html.indexOf(
    '<section class="work-section section" id="work">',
  );
  const profileIndex = html.indexOf(
    '<section class="profile-section section" id="profile">',
  );

  assert.ok(servicesIndex > 0);
  assert.ok(workIndex > servicesIndex);
  assert.ok(profileIndex > workIndex);
  assert.match(html, /01 \/ Professional services/);
  assert.match(html, /02 \/ Proof of delivery/);
  assert.match(html, /03 \/ Profile/);
  assert.match(html, /Fractional leadership/);
  assert.match(html, /Advisory intensive/);
  assert.match(html, /Delivery sprint/);
});

test("hero career strip summarizes professional experience", async () => {
  const html = await exportedPage("index.html");
  const careerStrip = html.match(
    /<section class="signal-strip"[^>]*>[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(careerStrip);
  assert.match(careerStrip, /Career highlights/);
  assert.match(careerStrip, />16<\/strong><span>Years of IT experience/);
  assert.match(careerStrip, />11<\/strong><span>Years of cybersecurity experience/);
  assert.match(careerStrip, />8<\/strong><span>Live products/);
  assert.match(careerStrip, />3<\/strong><span>Professional certifications/);
  assert.doesNotMatch(careerStrip, /CVE records indexed|Package ecosystems/);
});

test("site manifest uses installable Stevo.AI icons", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../out/site.webmanifest", import.meta.url), "utf8"),
  );

  assert.equal(manifest.short_name, "Stevo.AI");
  assert.match(manifest.name, /Cybersecurity & AI Enablement/);
  assert.match(manifest.description, /vCISO/);
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

test("email contact is revealed interactively instead of exposed to basic scrapers", async () => {
  const [html, resumeHtml, contact, component] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
    readFile(new URL("../lib/contact.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../components/ProtectedEmail.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(html, /Discuss an engagement/);
  assert.doesNotMatch(html, /mailto:/i);
  assert.doesNotMatch(html, /[A-Za-z0-9._%+-]+@gmail\.com/i);
  assert.doesNotMatch(resumeHtml, /mailto:/i);
  assert.doesNotMatch(resumeHtml, /[A-Za-z0-9._%+-]+@gmail\.com/i);
  assert.match(contact, /decodeProtectedEmail/);
  assert.match(contact, /protectedMailbox/);
  assert.match(component, /decodeProtectedEmail/);
  assert.doesNotMatch(contact, /[A-Za-z0-9._%+-]+@gmail\.com/i);
  assert.doesNotMatch(component, /[A-Za-z0-9._%+-]+@gmail\.com/i);
});

test("obfuscated mailbox still decodes to the real contact address", async () => {
  const { decodeProtectedEmail } = await import("../lib/contact.ts");
  assert.equal(decodeProtectedEmail(), "stephenabbott20@gmail.com");
});

test("social handles are published on the site and in structured data", async () => {
  const [html, resumeHtml] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
  ]);

  const profiles = [
    "https://github.com/stevologic",
    "https://www.youtube.com/@MadeItHappenDaily",
    "https://x.com/MadeItHappenX",
    "https://www.twitch.tv/madeithappen",
    "https://discord.com/users/317149305452363776",
  ];

  for (const profile of profiles) {
    assert.ok(html.includes(profile), `index is missing ${profile}`);
    assert.ok(resumeHtml.includes(profile), `resume is missing ${profile}`);
  }

  assert.match(html, /@MadeItHappenDaily/);
  assert.match(html, /@MadeItHappenX/);
  assert.match(html, /madeithappen3/);

  const structuredData = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(structuredData);
  const graph = JSON.parse(structuredData)["@graph"];
  for (const node of graph) {
    assert.deepEqual(node.sameAs, profiles);
  }
});

test("the site never claims a CEO title", async () => {
  const [html, resumeHtml] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
  ]);

  assert.doesNotMatch(html, /\bCEO\b/);
  assert.doesNotMatch(resumeHtml, /\bCEO\b/);
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

test("every project card includes privacy-conscious GitHub traffic aggregates", async () => {
  const [html, snapshotText, syncScript, workflow] = await Promise.all([
    exportedPage("index.html"),
    readFile(new URL("../data/github.generated.json", import.meta.url), "utf8"),
    readFile(new URL("../scripts/sync-github.mjs", import.meta.url), "utf8"),
    readFile(
      new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
      "utf8",
    ),
  ]);
  const snapshot = JSON.parse(snapshotText);

  assert.equal(snapshot.schemaVersion, 2);
  assert.ok(snapshot.repositories.length > 0);
  for (const repository of snapshot.repositories) {
    assert.equal(repository.traffic.windowDays, 14);
    assert.equal(typeof repository.traffic.fetchedAt, "string");
    assert.equal(typeof repository.traffic.views.count, "number");
    assert.equal(typeof repository.traffic.views.uniques, "number");
    assert.equal(typeof repository.traffic.clones.count, "number");
    assert.equal(typeof repository.traffic.clones.uniques, "number");
  }

  assert.equal(
    (html.match(/class="project-traffic"/g) || []).length,
    snapshot.repositories.length,
  );
  assert.match(html, /GitHub views \//);
  assert.match(html, /GitHub clones \//);
  assert.match(html, /visitors/);
  assert.match(html, /cloners/);
  assert.match(syncScript, /\/traffic\/views\?per=day/);
  assert.match(syncScript, /\/traffic\/clones\?per=day/);
  assert.match(workflow, /PROJECT_TRAFFIC_TOKEN/);
  assert.doesNotMatch(snapshotText, /referrers|popularPaths|daily/i);
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
  assert.match(
    styles,
    /\.identity-card\s*{[^}]*background: rgba\(21, 22, 28, 0\.72\)/s,
  );
  assert.match(
    styles,
    /\.profile-frame\s*{[^}]*width: calc\(100% - 24px\)[^}]*margin: 12px auto 0/s,
  );
  assert.doesNotMatch(
    styles,
    /\.identity-card\s*{[^}]*background: var\(--paper\)/s,
  );
  assert.doesNotMatch(styles, /#b8f34b|#ff6b52|#69d8ff/i);
});

test("professional resume is detailed, private, and print-ready", async () => {
  const html = await exportedPage("resume/index.html");

  assert.match(html, /Professional resume/);
  assert.match(html, /Stephen M Abbott/);
  assert.match(html, /Stevo\.AI · Cybersecurity/);
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
