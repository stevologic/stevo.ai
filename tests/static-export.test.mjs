import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

/** Curated cards plus discovered ones, mirroring lib/project-data.ts. */
async function publishedProjects() {
  const [curated, discovered] = await Promise.all([
    readFile(new URL("content/projects.json", root), "utf8"),
    readFile(new URL("data/discovered.generated.json", root), "utf8"),
  ]);
  const curatedProjects = JSON.parse(curated);
  const curatedRepos = new Set(
    curatedProjects.map((project) => project.repo.toLowerCase()),
  );
  const extra = (JSON.parse(discovered).projects || []).filter(
    (project) => !curatedRepos.has(project.repo.toLowerCase()),
  );
  return [...curatedProjects, ...extra];
}

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
  assert.match(html, /02 \/ Portfolio/);
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
  // Derived from the project data, so discovery cannot leave it stale.
  const projects = await publishedProjects();
  assert.match(
    careerStrip,
    new RegExp(`>${projects.length}</strong><span>Live products`),
  );
  assert.match(careerStrip, />92%<\/strong><span>Sensitive-data reduction/);
  assert.doesNotMatch(careerStrip, /CVE records indexed|Package ecosystems/);
});

test("leadership scale is described in executive terms, not a headcount", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /leadership\s+of multi-team engineering organizations/);
  assert.doesNotMatch(html, /teams of up to \d+/i);
});

test("credentials are named rather than counted", async () => {
  const html = await exportedPage("index.html");
  const strip = html.match(
    /<section class="credential-strip"[^>]*>[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(strip, "index is missing the credential strip");
  for (const credential of [
    "OSCP",
    "AWS Certified Cloud Practitioner",
    "Harvard &amp; Duke leadership programs",
    "BA, ASU - Walter Cronkite School of Journalism",
  ]) {
    assert.ok(strip.includes(credential), `credential strip omits ${credential}`);
  }

  // CRISC is training, not a certification, so it stays off the headline strip
  // and is disclosed in full on the resume instead.
  assert.doesNotMatch(strip, /CRISC/);

  // Completed training must never be presented as a held certification.
  assert.doesNotMatch(html, /CRISC certified|Certified in Risk and Information/i);
});

test("service tracks name the frameworks they are measured against", async () => {
  const html = await exportedPage("index.html");

  for (const standard of [
    "NIST CSF 2.0",
    "ISO/IEC 27001",
    "SOC 2",
    "CIS Controls v8",
    "FAIR risk quantification",
    "NIST AI RMF 1.0",
    "ISO/IEC 42001",
    "EU AI Act",
    "OWASP ASVS",
    "NIST SSDF (SP 800-218)",
    "CISA KEV",
    "OpenSSF Scorecard",
  ]) {
    assert.ok(html.includes(standard), `index never names ${standard}`);
  }

  assert.match(html, /Measured against/);
});

test("engagement models state deliverables and a process", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /class="engagement-deliverables"/);
  assert.match(html, /How an engagement runs/);
  for (const phase of ["Baseline", "Prioritize", "Operate", "Transfer"]) {
    assert.ok(html.includes(`<h4>${phase}</h4>`), `process omits ${phase}`);
  }

  assert.match(html, /Working principles/);
  assert.match(html, /Client confidentiality/);
  assert.match(html, /Built to be handed over/);
});

test("the site publishes a coordinated disclosure policy", async () => {
  const [policy, html, securityMd] = await Promise.all([
    readFile(new URL("../out/.well-known/security.txt", import.meta.url), "utf8"),
    exportedPage("index.html"),
    readFile(new URL("../SECURITY.md", import.meta.url), "utf8"),
  ]);

  // RFC 9116 requires Contact and Expires; Expires must still be in the future.
  assert.match(policy, /^Contact: https:\/\//m);
  assert.match(policy, /^Canonical: https:\/\/stevo\.ai\/\.well-known\/security\.txt$/m);
  const expires = policy.match(/^Expires: (.+)$/m)?.[1];
  assert.ok(expires, "security.txt is missing the required Expires field");
  assert.ok(
    new Date(expires).getTime() > Date.now(),
    `security.txt Expires (${expires}) is in the past`,
  );

  // The policy must not undo the email masking used everywhere else.
  assert.doesNotMatch(policy, /[A-Za-z0-9._%+-]+@gmail\.com/i);

  assert.match(html, /\/\.well-known\/security\.txt/);
  assert.match(securityMd, /Reporting a vulnerability/);
});

test("site manifest uses installable Stevo.AI icons", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../out/site.webmanifest", import.meta.url), "utf8"),
  );

  assert.equal(manifest.short_name, "Stevo.AI");
  assert.match(manifest.name, /Cybersecurity & AI Enablement/);
  assert.match(manifest.description, /vCISO/);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#0f1014");
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

  // The manifest ships to installed apps, so it needs the same guard.
  const manifest = await readFile(
    new URL("../out/site.webmanifest", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(manifest, /\bCEO\b/);
});

test("icons are the generated brand mark, not photo-derived art", async () => {
  const icons = [
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
  ];

  for (const icon of icons) {
    const bytes = await readFile(new URL(`../out/${icon}`, import.meta.url));
    // The flat two-colour mark compresses to a few KB. The previous
    // photo-derived set was 30-210KB, so this catches a regression to it.
    assert.ok(
      bytes.length < 20_000,
      `${icon} is ${(bytes.length / 1024).toFixed(0)}KB - expected the flat brand mark`,
    );
  }

  const ico = await readFile(new URL("../out/favicon.ico", import.meta.url));
  assert.equal(ico.readUInt16LE(0), 0, "favicon.ico reserved field");
  assert.equal(ico.readUInt16LE(2), 1, "favicon.ico must declare type 1 (icon)");
  assert.equal(ico.readUInt16LE(4), 3, "favicon.ico should carry 16/32/48px");
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

test("GitHub traffic aggregates stay privacy-conscious wherever they appear", async () => {
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

  // Traffic needs PROJECT_TRAFFIC_TOKEN, which only CI holds, so a repository
  // added or discovered since the last CI run legitimately has none yet.
  // Require every aggregate present to be well formed, not universal coverage:
  // demanding the latter would fail the build for any newly published project.
  const withTraffic = snapshot.repositories.filter(
    (repository) => repository.traffic,
  );
  for (const repository of withTraffic) {
    assert.equal(repository.traffic.windowDays, 14);
    assert.equal(typeof repository.traffic.fetchedAt, "string");
    assert.equal(typeof repository.traffic.views.count, "number");
    assert.equal(typeof repository.traffic.views.uniques, "number");
    assert.equal(typeof repository.traffic.clones.count, "number");
    assert.equal(typeof repository.traffic.clones.uniques, "number");
  }

  assert.equal(
    (html.match(/class="project-traffic"/g) || []).length,
    withTraffic.length,
    "every repository with traffic data should render a traffic block",
  );
  assert.ok(withTraffic.length > 0, "traffic data has stopped being collected");
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

  assert.match(styles, /--ink: #0f1014/);
  assert.match(styles, /--accent: #b0aec2/);
  assert.match(styles, /--accent-deep: #4e4c62/);
  assert.match(styles, /--accent-cool: #7e93a7/);
  assert.match(styles, /\.hero-orbit\s*{[^}]*opacity: 0\.2/s);
  assert.match(
    styles,
    /\.identity-card\s*{[^}]*background: rgba\(15, 16, 20, 0\.72\)/s,
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
  // The old saturated lavender and the green-cast black must not return.
  assert.doesNotMatch(styles, /#aaa8cf|rgba\(170, 168, 207|rgba\(10, 15, 13/i);

  // Large fields set the page's colour impression, so they use the near-neutral
  // surface rather than the accent that small elements keep.
  assert.match(styles, /--accent-surface: #adacb4/);
  assert.match(styles, /\.signal-strip\s*{[^}]*background: var\(--accent-surface\)/s);
  assert.match(styles, /\.closing-section\s*{[^}]*var\(--accent-surface\)/s);
});

test("the portrait ships in a web-weight format", async () => {
  const [html, photo] = await Promise.all([
    exportedPage("index.html"),
    readFile(new URL("../out/stephen-abbott-field-notes.webp", import.meta.url)),
  ]);

  assert.match(html, /stephen-abbott-field-notes\.webp/);
  assert.doesNotMatch(html, /stephen-abbott-field-notes\.png/);

  // "RIFF"...."WEBP" container header.
  assert.equal(photo.subarray(0, 4).toString("latin1"), "RIFF");
  assert.equal(photo.subarray(8, 12).toString("latin1"), "WEBP");

  // The frame behind this photo is filled with --ink, so a heavy file shows as
  // a black rectangle while it downloads.
  assert.ok(
    photo.length < 600_000,
    `portrait is ${(photo.length / 1024).toFixed(0)}KB - too heavy for a lazy hero photo`,
  );
});

test("professional resume is detailed, private, and print-ready", async () => {
  const html = await exportedPage("resume/index.html");

  assert.match(html, /Professional resume/);
  assert.match(html, /Stephen M Abbott/);
  // The role line stands alone; the resume is the person, not the company.
  assert.match(html, /class="resume-role">Cybersecurity &amp; AI enablement</);
  assert.match(html, /Professional experience/);
  assert.match(html, /16 years/);
  assert.match(html, /11 years/);
  assert.match(html, /Fortune 100/);
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

  // Contact is email only. Assert on the contact list itself: the site-wide
  // JSON-LD in the page head legitimately carries the social profiles, and the
  // resume document cannot be matched with a lazy regex because career roles
  // are nested <article> elements that terminate it early.
  const contact = html.match(
    /<ul class="resume-contact"[^>]*>[\s\S]*?<\/ul>/,
  )?.[0];
  assert.ok(contact, "resume contact list not found");
  assert.doesNotMatch(contact, /MadeItHappen|twitch\.tv|discord\.com|x\.com/i);
  assert.equal((contact.match(/<li>/g) || []).length, 1, "email only");

  // Sections are unnumbered.
  assert.doesNotMatch(html, /resume-section-index/);
});

test("resume reflects the current skills, tooling, and credentials", async () => {
  const html = await exportedPage("resume/index.html");

  // Focus areas: four, with governed adoption and agent architecture merged.
  for (const area of [
    "Application and supply-chain security",
    "Agentic cybersecurity enablement",
    "Governed AI adoption and agent architecture",
    "AI product engineering",
  ]) {
    assert.ok(html.includes(area), `focus areas omit ${area}`);
  }
  assert.equal((html.match(/class="resume-focus-card"/g) || []).length, 4);

  // Security breadth names the full testing surface.
  for (const capability of [
    "SAST",
    "SCA",
    "DAST",
    "secret-detection engineering",
    "container and image scanning",
    "secure CI/CD pipeline orchestration",
  ]) {
    assert.ok(html.includes(capability), `security breadth omits ${capability}`);
  }
  assert.match(html, /GitHub Actions/);

  // Commercial products actually operated.
  assert.match(html, /Commercial products/);
  for (const product of [
    "Sonatype Nexus",
    "PortSwigger Burp Suite",
    "DefectDojo",
    "JFrog Artifactory",
    "Jenkins",
    "GitHub Enterprise",
    "GitHub Advanced Security",
    "NetWitness",
    "ServiceNow",
    "Jira",
    "Confluence",
    "ChatGPT Enterprise",
    "Zafran CTEM",
    "Dependabot",
    "Kubernetes",
    "ArgoCD",
  ]) {
    assert.ok(html.includes(product), `commercial products omit ${product}`);
  }

  // Certifications are awarded; training is training. The distinction matters.
  assert.match(html, /Certifications/);
  assert.match(html, /Offensive Security Certified Professional \(OSCP\)/);
  assert.match(html, /AWS Certified Cloud Practitioner/);
  assert.match(html, /Training/);
  assert.match(html, /CRISC/);
  assert.match(html, /SpecterOps Adversary Tactics/);
  assert.match(html, /Harvard Leadership Training Course/);
  assert.match(html, /Duke University Accelerate Your Growth/);
  assert.doesNotMatch(html, /Cloud and risk/i);

  // Arrowhead Paesano joins the shipped products.
  assert.match(html, /Arrowhead Paesano/);
  assert.match(html, /arrowheadpaesano\.com/);
});

test("responsive breakpoints never leak into the print layout", async () => {
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  // A Letter page with 0.42in margins is ~735 CSS px wide, so an unscoped
  // `(max-width: 760px)` block matches while printing and silently collapses
  // the resume to the single-column mobile layout -- which adds a third page.
  const unscoped = [...styles.matchAll(/@media ([^{]+)\{/g)]
    .map((match) => match[1].trim())
    .filter(
      (condition) =>
        /max-width/.test(condition) && !/^screen and /.test(condition),
    );

  assert.deepEqual(
    unscoped,
    [],
    `max-width breakpoints must be scoped to screen: ${unscoped.join(", ")}`,
  );
});

test("Arrowhead Paesano is published as a project", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /Arrowhead Paesano/);
  assert.match(html, /https:\/\/arrowheadpaesano\.com/);
  assert.match(html, /arrowheadpaesanowebsite/);
});

test("project discovery publishes newly public repositories safely", async () => {
  const [config, curated, discovered] = await Promise.all([
    readFile(new URL("../content/discovery.json", import.meta.url), "utf8"),
    readFile(new URL("../content/projects.json", import.meta.url), "utf8"),
    readFile(
      new URL("../data/discovered.generated.json", import.meta.url),
      "utf8",
    ),
  ]);
  const settings = JSON.parse(config);
  const curatedProjects = JSON.parse(curated);
  const snapshot = JSON.parse(discovered);

  assert.ok(Array.isArray(snapshot.projects), "discovery snapshot needs projects");
  assert.equal(typeof snapshot.generatedAt, "string");

  // The site's own repository must never appear as one of its projects.
  const excluded = settings.exclude.map((name) => name.toLowerCase());
  assert.ok(excluded.includes("stevo.ai"));

  // A discovered card must never shadow curated editorial copy.
  const curatedRepos = new Set(
    curatedProjects.map((project) => project.repo.toLowerCase()),
  );
  for (const project of snapshot.projects) {
    assert.ok(
      !curatedRepos.has(project.repo.toLowerCase()),
      `${project.repo} is curated and must not also be discovered`,
    );
    assert.equal(project.discovered, true);
    assert.match(project.siteUrl, /^https?:\/\//);
  }

  // Every published project needs a real destination, however it got here.
  for (const project of await publishedProjects()) {
    assert.match(
      project.siteUrl,
      /^https?:\/\//,
      `${project.repo} has no live site URL`,
    );
    assert.ok(project.name?.trim(), `${project.repo} has no name`);
  }
});

test("the deploy workflow runs discovery daily, before the metadata sync", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /cron:/, "workflow must be scheduled");
  assert.match(workflow, /discover-projects\.mjs/);

  const discoverAt = workflow.indexOf("discover-projects.mjs");
  const syncAt = workflow.indexOf("sync-github.mjs");
  assert.ok(discoverAt > 0 && syncAt > 0);
  assert.ok(
    discoverAt < syncAt,
    "discovery must run before the sync so new repos are enriched in the same build",
  );
});

test("project cards carry each site's own icon and theme colour", async () => {
  const [html, snapshotText] = await Promise.all([
    exportedPage("index.html"),
    readFile(
      new URL("../data/project-icons.generated.json", import.meta.url),
      "utf8",
    ),
  ]);
  const snapshot = JSON.parse(snapshotText);
  const icons = Object.entries(snapshot.icons || {});

  assert.ok(icons.length > 0, "no project icons were collected");

  const projects = await publishedProjects();
  assert.equal(
    icons.length,
    projects.length,
    "every project should resolve a site icon",
  );

  for (const [repo, icon] of icons) {
    assert.match(icon.src, /^\/project-icons\//, `${repo} icon path`);
    // The file must actually ship, or the card renders a broken image.
    await access(new URL(`../out${icon.src}`, import.meta.url));
    if (icon.background) {
      assert.match(
        icon.background,
        /^#[0-9a-f]{3,8}$|^rgba?\(/i,
        `${repo} background colour`,
      );
    }
  }

  // Cards render the icon rather than the old sequence number.
  assert.equal(
    (html.match(/class="project-favicon"/g) || []).length,
    projects.length,
  );
  assert.doesNotMatch(html, /class="project-index"/);

  // At least one card should paint the project's declared colour.
  assert.match(html, /class="project-visual project-visual-branded"/);
  const backgrounds = icons.filter(([, icon]) => icon.background).length;
  assert.ok(backgrounds > 0, "no project declared a theme colour");
});

test("custom domain is configured", async () => {
  const cname = await readFile(new URL("public/CNAME", root), "utf8");
  assert.equal(cname.trim(), "stevo.ai");
});
