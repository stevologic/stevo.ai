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
  // Not every project has a repository: hosted storefronts have no source.
  const curatedRepos = new Set(
    curatedProjects
      .map((project) => project.repo?.toLowerCase())
      .filter(Boolean),
  );
  const extra = (JSON.parse(discovered).projects || []).filter(
    (project) => !curatedRepos.has(project.repo?.toLowerCase()),
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
    access(new URL("../out/og-executive.png", import.meta.url)),
    access(new URL("../out/favicon.ico", import.meta.url)),
    access(new URL("../out/favicon-16x16.png", import.meta.url)),
    access(new URL("../out/favicon-32x32.png", import.meta.url)),
    access(new URL("../out/apple-touch-icon.png", import.meta.url)),
    access(new URL("../out/icon-192.png", import.meta.url)),
    access(new URL("../out/icon-512.png", import.meta.url)),
    access(new URL("../out/site.webmanifest", import.meta.url)),
  ]);
});

test("site presents the consultancy, packages, and proof with social metadata", async () => {
  const [html, resumeHtml] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
  ]);
  const retiredEmploymentQualifier = ["frac", "tional"].join("");

  assert.match(html, /Secure the enterprise\./i);
  assert.match(html, /Enable what comes next\./i);
  assert.match(html, /Cybersecurity and AI enablement consultancy/);
  assert.match(html, />Packages</);
  assert.match(html, />Background</);
  assert.match(html, />Portfolio</);
  assert.match(html, /vCISO retainer/);
  assert.match(html, /AI enablement sprint/i);
  assert.match(html, /vCISO &amp; security leadership/);
  assert.match(html, /AI enablement &amp; governance/i);
  assert.doesNotMatch(html, /Available for select vCISO and consulting engagements/i);
  assert.doesNotMatch(html, /Open to full-time CISO/);
  assert.match(html, /Shiba Studio/);
  assert.match(html, /security-recipes\.ai/);
  assert.match(html, /Stephen M Abbott/);
  assert.match(html, /https:\/\/stevo\.ai\/og-executive\.png/);
  assert.match(html, /summary_large_image/);
  assert.match(html, /twitter:image/);
  assert.match(html, /twitter:image:alt/);
  assert.match(html, /og:image:width/);
  assert.match(html, /Call the stevo\.ai line to book a consult, interview, or partnership/);
  assert.match(html, /never as Stephen/);
  assert.match(html, /Cybersecurity &amp; AI executive/);
  assert.match(html, /rel="canonical" href="https:\/\/stevo\.ai\/?"/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /href="\/apple-touch-icon\.png"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /href="\/site\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  assert.doesNotMatch(html, />Navigate<|⌘ K|Site navigator/i);
  assert.doesNotMatch(html, new RegExp(retiredEmploymentQualifier, "i"));
  assert.doesNotMatch(resumeHtml, new RegExp(retiredEmploymentQualifier, "i"));
});

test("packages lead into background and portfolio proof", async () => {
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
  const packagesIndex = html.indexOf('id="packages"');

  assert.ok(servicesIndex > 0);
  assert.ok(packagesIndex > servicesIndex);
  assert.ok(profileIndex > packagesIndex);
  assert.ok(workIndex > profileIndex);
  // Sections are labelled, not numbered.
  assert.match(html, /class="section-number">Packages</);
  assert.match(html, /class="section-number">Background</);
  assert.match(html, /class="section-number">Portfolio</);
  assert.match(html, /class="section-number">Contact</);
  assert.doesNotMatch(html, /class="section-number">0\d \//);
  assert.match(html, /vCISO retainer/);
  assert.match(html, /Decision advisory/);
  assert.match(html, /Delivery sprint/);
});

test("each homepage section has one distinct job", async () => {
  const html = await exportedPage("index.html");
  const heroIntro = html.match(/<p class="hero-intro">([\s\S]*?)<\/p>/)?.[1];
  const identity = html.match(
    /<div class="identity-card">([\s\S]*?)<div class="activity-list">/,
  )?.[1];
  const profile = html.match(
    /<section class="profile-section section" id="profile">([\s\S]*?)<\/section>/,
  )?.[1];
  const closing = html.match(
    /<section class="closing-section section" id="contact">([\s\S]*?)<\/section>/,
  )?.[1];
  const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1];

  assert.ok(heroIntro && identity && profile && closing && footer);
  assert.doesNotMatch(heroIntro, /\b(?:16|11) years|\b(?:v?CISO|VP)\b/i);
  assert.doesNotMatch(identity, /href="\/resume\//);
  assert.doesNotMatch(html, /console-footnote/);

  // The executive section proves the positioning instead of repeating it.
  for (const proof of ["26 engineers", "92%", "75%", "99.99%"]) {
    assert.ok(profile.includes(proof), `executive record omits ${proof}`);
  }
  assert.doesNotMatch(profile, /\b(?:vCISO|VP Cybersecurity|VP AI Enablement)\b/i);
  assert.match(profile, /Read the full career record/);

  // The close has two decisions: call the stevo.ai line, or email.
  // Social profiles live here, not again in the adjacent footer.
  const closingActions = closing.match(
    /<div class="hero-actions">([\s\S]*?)<\/div>/,
  )?.[1];
  assert.ok(closingActions);
  assert.match(closingActions, /Email Stephen/);
  assert.match(closingActions, /stevo\.ai line/);
  assert.match(closingActions, /href="tel:\+16238878905"/);
  assert.match(closingActions, /\+1 \(623\) 887-8905/);
  assert.doesNotMatch(closingActions, /mailto:/i);
  assert.doesNotMatch(footer, /social-handles/);
  assert.equal((html.match(/<ul class="social-handles"/g) || []).length, 1);
});

test("hero career strip summarizes professional experience", async () => {
  const html = await exportedPage("index.html");
  const careerStrip = html.match(
    /<section class="signal-strip"[^>]*>[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(careerStrip);
  assert.match(careerStrip, /Career highlights/);
  assert.match(careerStrip, />16<\/strong><span>Years in enterprise technology/);
  assert.match(
    careerStrip,
    />11<\/strong><span>Years in cybersecurity/,
  );
  // Derived from the project data, so discovery cannot leave it stale.
  const projects = await publishedProjects();
  assert.match(
    careerStrip,
    new RegExp(`>${projects.length}</strong><span>Live products`),
  );
  assert.match(careerStrip, />Fortune 100<\/strong><span>Operating scale/);
  assert.doesNotMatch(careerStrip, /CVE records indexed|Package ecosystems/);
});

test("portrait imagery is swapped between the hero and executive profile", async () => {
  const [html, component, styles] = await Promise.all([
    exportedPage("index.html"),
    readFile(
      new URL("../components/PortfolioExperience.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const fieldNotesIndex = component.indexOf(
    'src="/stephen-abbott-field-notes.webp"',
  );
  const formalPortraitIndex = component.indexOf(
    'src="/stephen-abbott-profile.png"',
  );

  assert.ok(fieldNotesIndex >= 0);
  assert.ok(formalPortraitIndex > fieldNotesIndex);
  assert.match(html, /Stephen Abbott outdoors above a mountain lake/);
  assert.match(html, /Portrait of Stephen M Abbott/);
  assert.match(styles, /min-height: 84svh/);
  assert.match(styles, /padding: 104px 20px 58px/);
});

test("the lower portrait is a restrained, static editorial frame", async () => {
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const frame = styles.match(/\.profile-photo-wrap\s*{[^}]*}/s)?.[0];
  const image = styles.match(/\.profile-photo-wrap img\s*{[^}]*}/s)?.[0];

  assert.ok(frame && image, "lower portrait styles are missing");
  assert.match(frame, /width: min\(100%, 440px\)/);
  assert.match(frame, /aspect-ratio: 4 \/ 5/);
  assert.match(frame, /box-shadow:/);
  assert.doesNotMatch(image, /filter:|transition:|transform:/);
  assert.doesNotMatch(styles, /\.profile-photo-wrap:hover/);
});

test("leadership scale is described in executive terms, not a headcount", async () => {
  const html = await exportedPage("index.html");

  assert.match(html, /organizations of up to 26 engineers/);
  assert.doesNotMatch(html, /teams of up to \d+/i);
});

test("credentials are named rather than counted", async () => {
  const html = await exportedPage("index.html");
  const strip = html.match(
    /<section class="credential-strip"[^>]*>[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(strip, "index is missing the credential strip");
  const credentialOrder = [
    "Offensive Security Certified Professional",
    "BA, Arizona State University",
    "AWS Certified Cloud Practitioner",
    "Harvard &amp; Duke leadership programs",
  ];

  for (const credential of credentialOrder) {
    assert.ok(strip.includes(credential), `credential strip omits ${credential}`);
  }

  const credentialPositions = credentialOrder.map((credential) => strip.indexOf(credential));
  assert.deepEqual(
    credentialPositions,
    [...credentialPositions].sort((left, right) => left - right),
    "homepage credentials are not published in the intended order",
  );

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
    "ITIL 4",
    "COBIT 2019",
    "CycloneDX &amp; SPDX SBOM",
  ]) {
    assert.ok(html.includes(standard), `index never names ${standard}`);
  }

  assert.match(html, /Measured against/);
});

test("consulting packages publish inclusions without invented prices", async () => {
  const html = await exportedPage("index.html");
  const packages = html.match(
    /<div class="package-grid"[^>]*>[\s\S]*?<div class="section-heading/,
  )?.[0];

  assert.ok(packages, "package grid is missing");
  for (const title of [
    "vCISO retainer",
    "AI enablement sprint",
    "Decision advisory",
    "Delivery sprint",
  ]) {
    assert.ok(packages.includes(title), `packages omit ${title}`);
  }
  for (const cadence of ["Monthly", "4–6 weeks", "2–3 weeks", "Scoped build"]) {
    assert.ok(packages.includes(cadence), `packages omit cadence ${cadence}`);
  }
  assert.match(packages, /Book on the stevo\.ai line/);
  assert.doesNotMatch(packages, /\$\d/);
  assert.doesNotMatch(html, /class="operating-model"/);
});

test("engagement formats, process, and safeguards stay distinct", async () => {
  const html = await exportedPage("index.html");

  assert.doesNotMatch(html, /class="engagement-deliverables"/);
  for (const format of ["vCISO retainer", "Decision advisory", "Delivery sprint"]) {
    assert.ok(html.includes(format), `packages omit ${format}`);
  }
  assert.match(html, /How an engagement runs/);
  for (const phase of ["Baseline", "Prioritize", "Operate", "Transfer"]) {
    assert.ok(html.includes(`<h4>${phase}</h4>`), `process omits ${phase}`);
  }

  assert.match(html, /Professional safeguards/);
  assert.match(html, /Confidential by default/);
  assert.doesNotMatch(html, /Working principles|Built to be handed over/);
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

  assert.equal(manifest.short_name, "Abbott");
  assert.match(manifest.name, /Stephen M Abbott/);
  assert.match(manifest.description, /consultancy/);
  assert.match(manifest.description, /vCISO/);
  assert.match(manifest.description, /cybersecurity and IT consulting/);
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

  assert.match(html, /Email Stephen/);
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

test("the stevo.ai line is the published intake number and the retired number is gone", async () => {
  const [html, resumeHtml, contactSource] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
    readFile(new URL("../lib/contact.ts", import.meta.url), "utf8"),
  ]);

  assert.match(contactSource, /label: "stevo.ai line"/);
  assert.match(contactSource, /display: "\+1 \(623\) 887-8905"/);
  assert.match(contactSource, /href: "tel:\+16238878905"/);
  assert.match(contactSource, /e164: "\+16238878905"/);
  assert.match(contactSource, /never as Stephen/);
  assert.match(contactSource, /status: "planned"/);

  for (const [label, page] of [
    ["homepage", html],
    ["resume", resumeHtml],
  ]) {
    assert.match(page, /stevo\.ai line/, `${label} omits the stevo.ai line label`);
    assert.match(page, /tel:\+16238878905/, `${label} omits the voice-assistant tel link`);
    assert.match(
      page,
      /\+1 \(623\) 887-8905/,
      `${label} omits the formatted voice-assistant number`,
    );
    assert.doesNotMatch(page, /Recruiter line/, `${label} still labels the line for recruiters`);
    assert.doesNotMatch(page, /Call Stephen/, `${label} presents the line as Stephen personally`);
    assert.doesNotMatch(
      page,
      /623[-.\s]?363[-.\s]?4985|6233634985|\+1[-.\s]?623[-.\s]?363[-.\s]?4985/,
      `${label} still publishes the retired number`,
    );
  }

  assert.doesNotMatch(
    contactSource,
    /623[-.\s]?363[-.\s]?4985|6233634985/,
  );
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
  const typeOf = (node) =>
    Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  const socialNodes = graph.filter((node) =>
    typeOf(node).some((type) => ["Organization", "Person", "ProfessionalService"].includes(type)),
  );
  assert.equal(socialNodes.length, 2);
  for (const node of socialNodes) {
    assert.deepEqual(node.sameAs, profiles);
  }
  const person = graph.find((node) => node["@type"] === "Person");
  assert.equal(person.jobTitle, "Cybersecurity and AI Executive");
  assert.equal(person.telephone, "+16238878905");
  const organization = graph.find((node) => {
    const type = node["@type"];
    return Array.isArray(type)
      ? type.includes("ProfessionalService")
      : type === "Organization";
  });
  assert.ok(organization, "Organization node is missing");
  assert.equal(organization.telephone, "+16238878905");
  assert.equal(organization.contactPoint?.name, "stevo.ai line");
  assert.equal(organization.hasOfferCatalog?.itemListElement?.length, 4);
  const portfolio = graph.find((node) => node["@type"] === "ItemList");
  const projects = await publishedProjects();
  assert.equal(portfolio.numberOfItems, projects.length);
  assert.equal(portfolio.itemListElement.length, projects.length);
});

test("consultancy offer, background, and employment history stay distinct", async () => {
  const [html, resumeHtml] = await Promise.all([
    exportedPage("index.html"),
    exportedPage("resume/index.html"),
  ]);

  assert.doesNotMatch(html, /\bCEO\b/);
  assert.doesNotMatch(resumeHtml, /\bCEO\b/);
  assert.match(html, /vCISO/);
  assert.match(html, /AI enablement/);
  assert.match(html, /class="section-number">Portfolio</);
  assert.match(resumeHtml, /CISO/);
  assert.match(resumeHtml, /VP Cybersecurity/);
  assert.match(resumeHtml, /VP AI Enablement/);

  const resumeDocument = resumeHtml.match(
    /<article class="resume-document">([\s\S]*?)<\/article>/,
  )?.[1];
  assert.ok(resumeDocument, "exported résumé document is missing");
  assert.doesNotMatch(
    resumeDocument,
    /\bvCISO\b/i,
    "the recruiter-facing résumé should stay focused on full-time roles",
  );

  // Target roles and services can be named in the résumé, but the historical
  // title elements must remain the verified employer-anonymized titles.
  const careerTitles = [
    ...resumeHtml.matchAll(/class="resume-career-title">([^<]+)</g),
  ].map((match) => match[1]);
  assert.ok(careerTitles.includes("Director, Cybersecurity"));
  assert.ok(careerTitles.every((title) => !/\b(?:v?CISO|VP)\b/i.test(title)));

  // The manifest ships to installed apps, so it needs the same guards.
  const manifest = await readFile(
    new URL("../out/site.webmanifest", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(manifest, /\bCEO\b/);
  assert.match(manifest, /CISO/);
  assert.match(manifest, /vCISO/);
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
  const withVisibleTraffic = withTraffic.filter(
    (repository) =>
      repository.traffic.views.count > 0 || repository.traffic.clones.count > 0,
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
    (html.match(/class="project-traffic(?:\s|\")/g) || []).length,
    withVisibleTraffic.length,
    "every repository with meaningful traffic should render a traffic block",
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
  assert.match(
    html,
    /class="resume-role">\s*Cybersecurity &amp; AI Executive · CISO · VP Cybersecurity · VP AI Enablement/,
  );
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
  assert.doesNotMatch(
    html,
    /id="resume-profile-heading">Executive profile/,
    "the header summary already performs this job",
  );
  assert.match(html, /Print \/ save as PDF/);
  assert.doesNotMatch(html, /American Express/i);
  assert.doesNotMatch(html, /Full career r(?:é|&eacute;|&#xE9;)sum(?:é|&eacute;|&#xE9;) available on request/i);

  // Contact is email plus the stevo.ai line. Assert on the contact
  // list itself: the site-wide JSON-LD in the page head legitimately carries
  // the social profiles, and the resume document cannot be matched with a lazy
  // regex because career roles are nested <article> elements that terminate it
  // early.
  const contact = html.match(
    /<ul class="resume-contact"[^>]*>[\s\S]*?<\/ul>/,
  )?.[0];
  assert.ok(contact, "resume contact list not found");
  assert.doesNotMatch(contact, /MadeItHappen|twitch\.tv|discord\.com|x\.com/i);
  assert.equal((contact.match(/<li>/g) || []).length, 2, "email and voice assistant");
  assert.match(contact, /stevo\.ai line/);
  assert.match(contact, /href="tel:\+16238878905"/);
  assert.match(contact, /\+1 \(623\) 887-8905/);

  // Sections are unnumbered.
  assert.doesNotMatch(html, /resume-section-index/);
});

test("resume publishes route-specific canonical and social metadata", async () => {
  const html = await exportedPage("resume/index.html");

  assert.match(html, /Executive Résumé \| Stephen M Abbott/);
  assert.match(html, /https:\/\/stevo\.ai\/resume\//);
  assert.match(
    html,
    /Employer-anonymized executive résumé for full-time CISO, VP Cybersecurity, and VP AI Enablement opportunities/,
  );
  assert.match(html, /https:\/\/stevo\.ai\/og-executive\.png/);
  assert.match(html, /summary_large_image/);
});

test("resume reflects the current skills, tooling, and credentials", async () => {
  const html = await exportedPage("resume/index.html");

  // Focus areas are machine-editable data (the weekly optimizer may retitle
  // them), so assert against content/resume.json rather than hardcoded titles.
  // Hardcoding them once made the pre-merge gate reject a legitimate rewrite.
  const resumeContent = JSON.parse(
    await readFile(new URL("content/resume.json", root), "utf8"),
  );
  assert.equal(resumeContent.focusAreas.length, 4, "four focus areas");
  for (const area of resumeContent.focusAreas) {
    assert.ok(
      html.includes(area.title.replace(/&/g, "&amp;")),
      `focus areas omit ${area.title}`,
    );
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

  // Enterprise platforms actually operated.
  assert.match(html, /Enterprise platforms/);
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
  assert.match(html, /CRISC Bootcamp/);
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

test("Arizona Now is published as a live product without a public source", async () => {
  const html = await exportedPage("index.html");
  const projects = await publishedProjects();

  const product = projects.find((project) => project.slug === "arizona-now");
  assert.ok(product, "Arizona Now is missing");
  assert.equal(product.name, "Arizona Now");
  assert.equal(product.category, "Products & ventures");
  assert.equal(product.statusLabel, "Live");
  assert.equal(product.featured, false);
  assert.equal(product.siteUrl, "https://az-now.com");
  assert.equal(product.repo, undefined, "private repo must not be catalogued");
  assert.equal(product.sourceUrl, undefined, "it has no public source");

  assert.match(html, /Arizona Now/);
  assert.match(html, /https:\/\/az-now\.com/);
  assert.doesNotMatch(html, /aznow\.org/);
  assert.doesNotMatch(html, /stevologic\/arizonanow/);

  const card = html
    .match(/<article class="project-card[\s\S]*?<\/article>/g)
    ?.find((markup) => markup.includes("Arizona Now"));
  assert.ok(card, "Arizona Now card not found");
  assert.match(card, /href="https:\/\/az-now\.com"/);
  assert.match(card, /Visit live product/);
  assert.doesNotMatch(card, /class="project-source"/);
  assert.doesNotMatch(card, /class="project-traffic"/);
  assert.doesNotMatch(card, /Stripe|buy featured|purchase featured/i);
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
    curatedProjects
      .map((project) => project.repo?.toLowerCase())
      .filter(Boolean),
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
  const allowedCategories = ["Security", "AI systems", "Products & ventures"];
  for (const project of await publishedProjects()) {
    assert.match(
      project.siteUrl,
      /^https?:\/\//,
      `${project.slug} has no live site URL`,
    );
    assert.ok(project.name?.trim(), `${project.slug} has no name`);
    assert.ok(
      allowedCategories.includes(project.category),
      `${project.slug} has unknown category ${project.category}`,
    );
    // Source links are optional, but must be real when present.
    if (project.sourceUrl) {
      assert.match(project.sourceUrl, /^https:\/\/github\.com\//);
    }
  }
});

test("every portfolio category has a visible filter", async () => {
  const html = await exportedPage("index.html");
  const categories = new Set((await publishedProjects()).map((project) => project.category));
  const filterMarkup = html.match(
    /<div class="project-filters"[^>]*>([\s\S]*?)<\/div>/,
  )?.[1];
  assert.ok(filterMarkup, "project filter controls are missing");

  for (const category of categories) {
    const label = category.replace(/&/g, "&amp;");
    assert.ok(
      filterMarkup.includes(`>${label}</button>`),
      `missing filter for ${category}`,
    );
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
  const buildAt = workflow.indexOf("npm run build");
  const testAt = workflow.indexOf("node --test tests/static-export.test.mjs");
  const publishAt = workflow.indexOf("Publish out to gh-pages");
  assert.ok(buildAt > syncAt && testAt > buildAt && publishAt > testAt);
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

test("the printed resume breaks between career history and focus areas", async () => {
  const [html, styles] = await Promise.all([
    exportedPage("resume/index.html"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  // The break is carried by a class on the focus-areas section, so the career
  // history finishes page one instead of spilling roles onto page two.
  const focus = html.match(
    /<section class="([^"]*)"[^>]*aria-labelledby="resume-focus-heading"/,
  )?.[1];
  assert.ok(focus, "focus areas section not found");
  assert.match(focus, /resume-section-page-break/);

  const print = styles.slice(styles.indexOf("@media print {"));
  assert.match(
    print,
    /\.resume-section-page-break\s*{[^}]*break-before: page/s,
    "the page break must be declared inside @media print",
  );
  // page-break-before is the legacy alias; keep both for older engines.
  assert.match(
    print,
    /\.resume-section-page-break\s*{[^}]*page-break-before: always/s,
  );

  // Nothing else may force a break, or the page count grows. Count rendered
  // sections only: Next inlines a flight payload that repeats class names.
  assert.equal(
    (html.match(/<section class="[^"]*resume-section-page-break/g) || []).length,
    1,
    "exactly one forced page break",
  );
});

test("projects without a public repository still publish", async () => {
  const html = await exportedPage("index.html");
  const projects = await publishedProjects();

  const storefront = projects.find(
    (project) => project.slug === "desert-wander-supply",
  );
  assert.ok(storefront, "Desert Wander Supply Co. is missing");
  assert.equal(storefront.repo, undefined, "it has no GitHub repository");
  assert.equal(storefront.sourceUrl, undefined, "it has no public source");
  assert.match(html, /Desert Wander Supply Co\./);
  assert.match(html, /https:\/\/desertwandersupplyco\.com/);

  // A card with no source must not render an empty Source link, and a project
  // with no repository cannot have GitHub traffic.
  const card = html
    .match(/<article class="project-card[\s\S]*?<\/article>/g)
    ?.find((markup) => markup.includes("Desert Wander Supply"));
  assert.ok(card, "storefront card not found");
  assert.doesNotMatch(card, /class="project-source"/);
  assert.doesNotMatch(card, /class="project-traffic"/);
  assert.match(card, /class="project-favicon"/);
  // No repository means no last-pushed date, so the meta line must not fall
  // back to the "Updated Active now" placeholder.
  assert.doesNotMatch(card, /Updated Active now/i);

  // The sync must not try to fetch a repository that does not exist.
  const snapshot = JSON.parse(
    await readFile(new URL("../data/github.generated.json", import.meta.url), "utf8"),
  );
  const withRepos = projects.filter((project) => project.repo).length;
  assert.equal(snapshot.repositories.length, withRepos);
});

test("the executive record uses a meaningful heading, not a repeated name", async () => {
  const [html, styles] = await Promise.all([
    exportedPage("index.html"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /Enterprise judgment\. Measurable outcomes\. Technical depth\./);
  assert.doesNotMatch(html, /<blockquote>Stephen M Abbott<\/blockquote>/);
  assert.match(styles, /\.profile-copy > h2\s*{/);
  assert.doesNotMatch(styles, /\.profile-copy blockquote\s*{/);
});

test("the site critique action is wired to Grok correctly", async () => {
  const [workflow, script, pkg] = await Promise.all([
    readFile(new URL(".github/workflows/site-critique.yml", root), "utf8"),
    readFile(new URL("scripts/site-critique.mjs", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(workflow, /secrets\.GROK_API_KEY/, "must read the API key from secrets");
  assert.match(workflow, /vars\.GROK_MODEL/, "model must come from a repo variable");
  // The default has to be a real model id. xAI uses a dot: grok-4-5 404s.
  assert.match(workflow, /'grok-4\.5'/);
  // Scope to the default assignment: the surrounding comment explains that
  // grok-4-5 is invalid, so a bare search for it matches the prose.
  const fallback = script.match(
    /GROK_MODEL\?\.trim\(\) \|\| "([^"]+)"/,
  )?.[1];
  assert.equal(fallback, "grok-4.5", "default model must use the dotted id");
  assert.match(JSON.parse(pkg).scripts.critique, /site-critique\.mjs/);

  // The key must never be committed, only read from the environment.
  assert.doesNotMatch(script, /xai-[A-Za-z0-9]{8}/, "no API key literal");
  assert.match(script, /process\.env\.GROK_API_KEY/);
  assert.match(script, /cybersecurity and AI enablement consultancy/);
  assert.match(script, /stevo.ai line is the intake/);
  assert.match(script, /Background and portfolio remain available as proof/);

  // It proposes changes on a branch; a person merges. It must never publish to
  // the live site on its own.
  assert.match(workflow, /gh pr create/, "changes must arrive as a pull request");
  assert.match(workflow, /--base main/);
  assert.doesNotMatch(
    workflow,
    /git push origin main|git push .* HEAD:main/,
    "must never push straight to main",
  );

  // It may merge, but only on a real CI verdict. A pull request opened with
  // GITHUB_TOKEN does not trigger workflows, so CI is dispatched against the
  // branch and the merge is gated on its conclusion -- never on --auto, which
  // would merge immediately while main has no required checks.
  assert.match(workflow, /gh workflow run ci\.yml --ref/, "CI must be dispatched");
  assert.match(
    workflow,
    /conclusion" == "success"[\s\S]{0,200}gh pr merge/,
    "the merge must be gated on a successful CI conclusion",
  );
  assert.doesNotMatch(
    workflow,
    /gh pr merge[^\n]*--auto/,
    "--auto would merge with no required checks on main",
  );
  const ci = await readFile(new URL(".github/workflows/ci.yml", root), "utf8");
  assert.match(ci, /workflow_dispatch/, "CI must be dispatchable against a branch");
  // The branch is only pushed once the edited site builds and passes tests.
  const prIndex = workflow.indexOf("gh pr create");
  const testIndex = workflow.indexOf("node --test tests/static-export.test.mjs");
  assert.ok(testIndex > 0 && testIndex < prIndex, "tests must run before the PR");
});

test("the practice growth action drafts marketing without publishing or sending", async () => {
  const [workflow, script, pkg] = await Promise.all([
    readFile(new URL(".github/workflows/practice-growth.yml", root), "utf8"),
    readFile(new URL("scripts/practice-growth.mjs", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(workflow, /secrets\.GROK_API_KEY/);
  assert.match(workflow, /'grok-4\.5'/);
  assert.match(workflow, /npm run growth/);
  assert.match(JSON.parse(pkg).scripts.growth, /practice-growth\.mjs/);
  assert.match(script, /stevo.ai line/);
  assert.match(script, /servicePackages/);
  assert.match(script, /does not send/i);
  assert.doesNotMatch(workflow, /gh pr create|git push origin main/);
  assert.doesNotMatch(script, /nodemailer|sendgrid|resend|smtp/i);
  assert.doesNotMatch(script, /calendar\.events|events\.insert/);
  assert.doesNotMatch(
    workflow,
    /git add|git commit|gh pr create/,
    "the growth brief must never change the site",
  );
});

test("the portfolio optimizer cannot lose or fabricate project data", async () => {
  const { applyEdits } = await import("../scripts/optimize-portfolio.mjs");
  const current = JSON.parse(
    await readFile(new URL("content/projects.json", root), "utf8"),
  );
  const discovered = JSON.parse(
    await readFile(new URL("data/discovered.generated.json", root), "utf8"),
  ).projects;
  const slugs = current.map((project) => project.slug);

  // Reordering and reframing is the point, and must work.
  const reordered = applyEdits(current, discovered, {
    order: [...slugs].reverse(),
    projects: { [slugs[1]]: { featured: true, category: "Security" } },
  });
  assert.equal(reordered.length, current.length, "no project may be lost");
  assert.deepEqual(
    [...reordered.map((p) => p.slug)].sort(),
    [...slugs].sort(),
    "the same set of projects must survive",
  );
  for (const project of reordered) {
    const before = current.find((c) => c.slug === project.slug);
    assert.equal(project.siteUrl, before.siteUrl, "siteUrl is immutable");
    assert.equal(project.sourceUrl, before.sourceUrl, "sourceUrl is immutable");
  }

  // Each of these must be refused rather than written to the portfolio.
  const retiredEmploymentQualifier = ["frac", "tional"].join("");
  const forbidden = [
    ["removes a project", { order: slugs.slice(0, -1) }],
    ["invents a project", { order: [...slugs, "made-up-platform"] }],
    ["duplicates a project", { order: [...slugs, slugs[0]] }],
    [
      "recasts a product as the vCISO advisory service",
      {
        order: slugs,
        projects: { [slugs[0]]: { tagline: "Interim vCISO in a box." } },
      },
    ],
    [
      "reintroduces a retired part-time employment qualifier",
      {
        order: slugs,
        projects: {
          [slugs[0]]: {
            tagline: `${retiredEmploymentQualifier} security leadership.`,
          },
        },
      },
    ],
    [
      "rewrites a live URL",
      { order: slugs, projects: { [slugs[0]]: { siteUrl: "https://elsewhere.example" } } },
    ],
    [
      "invents a metric",
      { order: slugs, projects: { [slugs[0]]: { metrics: ["Used by 9100 banks"] } } },
    ],
    [
      "uses an unknown category",
      { order: slugs, projects: { [slugs[0]]: { category: "Enterprise" } } },
    ],
    [
      "writes an unknown field",
      { order: slugs, projects: { [slugs[0]]: { rank: 1 } } },
    ],
  ];
  for (const [label, edits] of forbidden) {
    assert.throws(
      () => applyEdits(current, discovered, edits),
      `the optimizer accepted an edit that ${label}`,
    );
  }
});

test("model auto-upgrade ranks by release date, not version number", async () => {
  const { pickNewestModel } = await import("../scripts/site-critique.mjs");
  const at = (iso) => Math.floor(new Date(iso).getTime() / 1000);

  // grok-4.20 shipped in March and grok-4.5 in July, so 4.5 is newer despite
  // 20 > 5. Any component-wise version compare silently upgrades backwards.
  const catalogue = [
    { id: "grok-4.20-0309-reasoning", created: at("2026-03-09") },
    { id: "grok-4.3", created: at("2026-05-01") },
    { id: "grok-4.5", created: at("2026-07-08") },
  ];
  assert.equal(pickNewestModel(catalogue, "grok-4.5"), "grok-4.5");

  // A genuinely newer model is adopted.
  assert.equal(
    pickNewestModel(
      [...catalogue, { id: "grok-5", created: at("2027-01-01") }],
      "grok-4.5",
    ),
    "grok-5",
  );

  // Non-text and deliberately weaker variants are never selected.
  for (const id of [
    "grok-imagine-video",
    "grok-imagine-image",
    "grok-4.20-0309-non-reasoning",
    "grok-build-0.1",
  ]) {
    assert.equal(
      pickNewestModel([{ id, created: at("2030-01-01") }], "grok-4.5"),
      "grok-4.5",
      `${id} must not be auto-selected`,
    );
  }

  // Discovery is best-effort: anything unusable falls back to the configured
  // model rather than throwing mid-run.
  for (const payload of [[], [null], [{ nope: 1 }], [{ id: "grok-9" }]]) {
    assert.equal(pickNewestModel(payload, "grok-4.5"), "grok-4.5");
  }
});

test("the critique brief carries readable copy, not build artifacts", async () => {
  const { buildBrief } = await import("../scripts/site-critique.mjs");
  const brief = await buildBrief();

  // Real copy from both pages, so the advisor reviews what a visitor reads.
  assert.match(brief, /Secure the enterprise/);
  assert.match(brief, /Call the stevo\.ai line|View packages/);
  assert.match(brief, /Enterprise platforms/);

  // None of the export plumbing.
  assert.doesNotMatch(brief, /<[a-z]+[\s>]/i, "HTML tags leaked into the brief");
  assert.doesNotMatch(brief, /__next|self\.__next/, "flight payload leaked");
  assert.doesNotMatch(brief, /&[a-z]+;|&#x?[0-9a-f]+;/i, "unresolved entities");
  assert.doesNotMatch(brief, /<!--/, "React comment markers leaked");

  // Stat tiles must keep their labels; a bare "16" tells an advisor nothing.
  assert.match(brief, /16 — Years in enterprise technology/);
  assert.match(brief, /Fortune 100 — Operating scale/);
});

test("the resume curates the site's strongest founder-built projects", async () => {
  const html = await exportedPage("resume/index.html");
  const projects = await publishedProjects();
  const body = html.slice(html.indexOf("resume-document"));

  // The résumé is derived from the portfolio but intentionally capped so daily
  // project discovery cannot push the print export onto a third page.
  const featured = [
    ...body.matchAll(/class="resume-project-title">([^<]*)/g),
  ].map((m) => m[1]);
  const other = [
    ...body.matchAll(/class="resume-product-link"[^>]*>([^<]*)/g),
  ].map((m) => m[1]);
  const listed = new Set([...featured, ...other]);

  const expected = [
    ...projects.filter((project) => project.featured).slice(0, 3),
    ...projects.filter((project) => !project.featured).slice(0, 6),
  ];
  for (const project of expected) {
    assert.ok(
      listed.has(project.name),
      `the resume is missing "${project.name}", which the site publishes`,
    );
  }
  assert.equal(
    listed.size,
    expected.length,
    "the resume project list exceeded its curated print budget",
  );

  // Career figures are quoted on both pages and must come from one source.
  // Read lib/career.ts as text: it uses the "@/" alias, which only the Next
  // build resolves, so importing it here would fail.
  const careerSource = await readFile(new URL("lib/career.ts", root), "utf8");
  // Built from a plain string, not a template literal: an unrecognised escape
  // like \s collapses to "s" in a template literal and silently breaks it.
  const figure = (key) =>
    careerSource
      .match(new RegExp(key + ':\\s*"?([^",\\n]+?)"?,'))?.[1]
      ?.trim();
  const facts = [
    figure("yearsInTechnology"),
    figure("yearsInCybersecurity"),
    figure("enterpriseScale"),
  ];
  assert.ok(facts.every(Boolean), `career.ts is missing a fact: ${facts}`);

  const index = await exportedPage("index.html");
  for (const [label, page] of [["resume", body], ["home page", index]]) {
    for (const fact of facts) {
      assert.ok(page.includes(fact), `${label} does not state "${fact}"`);
    }
  }
});

test("the resume optimizer cannot rewrite employment history", async () => {
  const { applyResumeEdits } = await import("../scripts/optimize-resume.mjs");
  const current = JSON.parse(
    await readFile(new URL("content/resume.json", root), "utf8"),
  );
  const role = current.careerExperience[0];

  // Rewording, same number of achievements, is the point and must work.
  const reworded = applyResumeEdits(current, {
    careerExperience: {
      [role.dates]: { highlights: role.highlights.map((h) => h.slice(0, -1)) },
    },
  });
  const after = reworded.careerExperience[0];
  assert.equal(after.dates, role.dates, "dates are facts");
  assert.equal(after.title, role.title, "titles are facts");
  assert.equal(after.highlights.length, role.highlights.length);

  const forbidden = [
    ["drops an achievement", { careerExperience: { [role.dates]: { highlights: role.highlights.slice(1) } } }],
    ["adds an achievement", { careerExperience: { [role.dates]: { highlights: [...role.highlights, "Another win."] } } }],
    ["changes a job title", { careerExperience: { [role.dates]: { title: "CISO" } } }],
    ["changes employment dates", { careerExperience: { [role.dates]: { dates: "2018-2026" } } }],
    ["invents a role", { careerExperience: { "2001-2004": { scope: "Earlier work" } } }],
    [
      "recasts employment as a consulting engagement",
      {
        careerExperience: {
          [role.dates]: {
            highlights: [
              "Served as a vCISO and consulting advisor to client organizations.",
              ...role.highlights.slice(1),
            ],
          },
        },
      },
    ],
    [
      "invents a figure",
      {
        careerExperience: {
          [role.dates]: {
            highlights: role.highlights.map((h, i) =>
              i ? h : "Cut mean time to remediate by 47% across the estate.",
            ),
          },
        },
      },
    ],
    ["edits the tool inventory", { technicalBreadth: { Security: { value: "Splunk" } } }],
    ["edits commercial products", { commercialProducts: { "Application security": { value: "Veracode" } } }],
    ["invents a focus area", { focusAreas: { "Quantum readiness": { description: "Post-quantum work." } } }],
    [
      "pads the resume past the page budget",
      {
        careerExperience: {
          [role.dates]: {
            highlights: role.highlights.map(
              (h) => h + " " + "Further supporting detail. ".repeat(20),
            ),
          },
        },
      },
    ],
  ];
  for (const [label, edits] of forbidden) {
    assert.throws(
      () => applyResumeEdits(current, edits),
      `the resume optimizer accepted an edit that ${label}`,
    );
  }
});

test("resume content stays within its two-page budget", async () => {
  const resume = await readFile(new URL("content/resume.json", root), "utf8");
  const parsed = JSON.parse(resume);

  // The printed resume is tuned to exactly two Letter pages, but verify:pdf
  // cannot run on the CI runner: the serif stack it measures does not exist
  // there, so the fallback font would report a different count. This
  // font-independent ceiling is what actually guards the page count in CI.
  const length = JSON.stringify(parsed).length;
  assert.ok(
    length <= 6000,
    `resume prose is ${length} characters, over the 6000 budget that keeps it to two pages`,
  );

  // Structure the optimizer relies on.
  assert.equal(parsed.careerExperience.length, 5, "five roles");
  for (const role of parsed.careerExperience) {
    assert.match(role.dates, /^\d{4}-\d{4}$/);
    assert.ok(role.title?.trim() && role.scope?.trim());
    assert.ok(role.highlights.length >= 3);
  }
  assert.ok(parsed.focusAreas.length >= 3);
  assert.ok(parsed.technicalBreadth.length >= 4);
  assert.ok(parsed.commercialProducts.length >= 3);
});

test("the achievements file anchors the automation to verified facts", async () => {
  const { applyResumeEdits } = await import("../scripts/optimize-resume.mjs");
  const [baseline, resume, workflow] = await Promise.all([
    readFile(new URL("content/achievements.json", root), "utf8").then(JSON.parse),
    readFile(new URL("content/resume.json", root), "utf8").then(JSON.parse),
    readFile(new URL(".github/workflows/site-critique.yml", root), "utf8"),
  ]);

  // The canonical record is human-owned: the workflow must never commit it.
  assert.doesNotMatch(
    workflow,
    /git add[^\n]*achievements\.json/,
    "the workflow must never commit the achievements file",
  );

  for (const path of [
    "Chief Information Security Officer (CISO)",
    "VP of Cybersecurity",
    "VP of AI Enablement",
    "Virtual Chief Information Security Officer (vCISO)",
    "Cybersecurity and IT Consultant for the AI-native enterprise",
    "Founder and Product Builder",
  ]) {
    assert.ok(baseline.identity.targetRoles.includes(path), `positioning omits ${path}`);
  }

  // The live resume's employment facts must match the canonical record.
  assert.equal(resume.careerExperience.length, baseline.career.length);
  for (const [index, role] of resume.careerExperience.entries()) {
    assert.equal(role.dates, baseline.career[index].dates);
    assert.equal(role.title, baseline.career[index].title);
  }

  // The erosion fix: a canonical figure stays legal even after an earlier
  // rewrite dropped it from the live resume. 92% is in the baseline; strip it
  // from the current resume, then restate it -- the edit must be accepted.
  const stripped = structuredClone(resume);
  for (const role of stripped.careerExperience) {
    role.highlights = role.highlights.map((h) => h.replace(/92%/g, "most"));
  }
  const role = stripped.careerExperience[1];
  const restated = applyResumeEdits(
    stripped,
    {
      careerExperience: {
        [role.dates]: {
          highlights: role.highlights.map((h, i) =>
            i === 0
              ? "Reduced sensitive-data findings in source code by 92% through automation with human review."
              : h,
          ),
        },
      },
    },
    baseline,
  );
  assert.match(JSON.stringify(restated), /92%/);

  // A figure in neither the resume nor the baseline stays illegal.
  assert.throws(() =>
    applyResumeEdits(
      stripped,
      {
        careerExperience: {
          [role.dates]: {
            highlights: role.highlights.map((h, i) =>
              i === 0 ? "Reduced findings by 44% across the estate." : h,
            ),
          },
        },
      },
      baseline,
    ),
  );

  // With a baseline, dates and titles are checked against IT, so the model
  // cannot even collude with a corrupted current resume.
  const corrupted = structuredClone(resume);
  corrupted.careerExperience[0].title = "Chief Executive Officer";
  assert.throws(
    () => applyResumeEdits(corrupted, {}, baseline),
    "a title diverging from the canonical record must be rejected",
  );

  // The figures glossary carries the numbers the site quotes.
  for (const figure of ["92%", "75%", "99.99%", "26", "Fortune 100"]) {
    assert.ok(
      Object.keys(baseline.figures).some((k) => k.includes(figure)),
      `achievements.json figures glossary is missing ${figure}`,
    );
  }
});

test("custom domain is configured", async () => {
  const cname = await readFile(new URL("public/CNAME", root), "utf8");
  assert.equal(cname.trim(), "stevo.ai");
});
