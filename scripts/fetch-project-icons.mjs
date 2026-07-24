#!/usr/bin/env node
// Collects each project's own site icon and theme colour, the same signals iOS
// uses when a site is added to the home screen: the apple-touch-icon (falling
// back through the manifest and <link rel="icon">) drawn on the declared
// theme/background colour.
//
// Runs during the daily sync, so a newly discovered project brings its own mark
// with no manual asset work. Output is committed for offline builds.
//
// Usage: npm run icons:projects

import { mkdir, readFile, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const projectsPath = path.join(rootDirectory, "content", "projects.json");
const discoveredPath = path.join(
  rootDirectory,
  "data",
  "discovered.generated.json",
);
const outputPath = path.join(rootDirectory, "data", "project-icons.generated.json");
const iconDirectory = path.join(rootDirectory, "public", "project-icons");

const isCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const offline = process.env.GITHUB_SYNC_OFFLINE === "1";
const timeoutMs = 15_000;
const maxIconBytes = 250_000;

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; stevo.ai-project-icons/1.0; +https://stevo.ai)",
      ...options.headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function absolute(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function attribute(tag, name) {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? (match[2] ?? match[3] ?? match[4] ?? "").trim() : "";
}

/** Largest declared size in a `sizes` attribute, for ranking icon candidates. */
function sizeOf(tag) {
  const sizes = attribute(tag, "sizes");
  const numbers = [...sizes.matchAll(/(\d+)\s*[x×]\s*(\d+)/gi)].map((m) =>
    Number(m[1]),
  );
  return numbers.length ? Math.max(...numbers) : 0;
}

function normalizeColor(value) {
  const color = (value || "").trim();
  return /^#[0-9a-f]{3,8}$/i.test(color) || /^rgba?\(/i.test(color)
    ? color
    : null;
}

async function readManifest(manifestUrl) {
  try {
    const response = await fetchWithTimeout(manifestUrl);
    if (!response.ok) return {};
    const manifest = await response.json();
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const best = icons
      .map((icon) => ({
        url: absolute(icon.src, manifestUrl),
        size: Number(String(icon.sizes || "").split(/[x×]/)[0]) || 0,
        purpose: icon.purpose || "",
      }))
      .filter((icon) => icon.url)
      // Prefer a plain icon: a maskable one is designed to be cropped.
      .sort(
        (a, b) =>
          Number(a.purpose.includes("maskable")) -
            Number(b.purpose.includes("maskable")) || b.size - a.size,
      )[0];
    return {
      iconUrl: best?.url || null,
      themeColor:
        normalizeColor(manifest.theme_color) ||
        normalizeColor(manifest.background_color),
      backgroundColor: normalizeColor(manifest.background_color),
    };
  } catch {
    return {};
  }
}

/**
 * Resolve a site's home-screen presentation. Ranked the way iOS resolves it:
 * apple-touch-icon first, then the manifest, then declared icons, then
 * /favicon.ico.
 */
async function resolvePresentation(siteUrl) {
  const response = await fetchWithTimeout(siteUrl);
  if (!response.ok) {
    throw new Error(`site returned ${response.status}`);
  }
  const finalUrl = response.url || siteUrl;
  const html = (await response.text()).slice(0, 400_000);

  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);

  const byRel = (pattern) =>
    linkTags.filter((tag) => pattern.test(attribute(tag, "rel")));

  const appleIcons = byRel(/apple-touch-icon/i).sort(
    (a, b) => sizeOf(b) - sizeOf(a),
  );
  const plainIcons = byRel(/^(shortcut\s+)?icon$/i).sort(
    (a, b) => sizeOf(b) - sizeOf(a),
  );

  const themeMeta = metaTags.find(
    (tag) => attribute(tag, "name").toLowerCase() === "theme-color",
  );

  const manifestTag = byRel(/manifest/i)[0];
  const manifest = manifestTag
    ? await readManifest(absolute(attribute(manifestTag, "href"), finalUrl))
    : {};

  const iconUrl =
    (appleIcons[0] && absolute(attribute(appleIcons[0], "href"), finalUrl)) ||
    manifest.iconUrl ||
    (plainIcons[0] && absolute(attribute(plainIcons[0], "href"), finalUrl)) ||
    absolute("/favicon.ico", finalUrl);

  return {
    iconUrl,
    // iOS paints the icon on the declared theme/background colour.
    background:
      normalizeColor(themeMeta && attribute(themeMeta, "content")) ||
      manifest.themeColor ||
      manifest.backgroundColor ||
      null,
    maskable: Boolean(appleIcons.length === 0 && manifest.iconUrl),
  };
}

const extensions = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
  "image/gif": ".gif",
};

async function downloadIcon(iconUrl, slug) {
  const response = await fetchWithTimeout(iconUrl);
  if (!response.ok) throw new Error(`icon returned ${response.status}`);

  const type = (response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) throw new Error("icon was empty");
  if (buffer.length > maxIconBytes) {
    throw new Error(`icon is ${(buffer.length / 1024).toFixed(0)}KB, over budget`);
  }

  const extension =
    extensions[type] ||
    path.extname(new URL(iconUrl).pathname).toLowerCase() ||
    ".png";
  if (!Object.values(extensions).includes(extension)) {
    throw new Error(`unsupported icon type ${type || extension}`);
  }

  const fileName = `${slug}${extension}`;
  await writeFile(path.join(iconDirectory, fileName), buffer);
  return { file: `/project-icons/${fileName}`, bytes: buffer.length };
}

async function main() {
  const [curated, discovered] = await Promise.all([
    readJson(projectsPath),
    readJson(discoveredPath).catch(() => ({ projects: [] })),
  ]);
  const projects = [
    ...(Array.isArray(curated) ? curated : curated.projects || []),
    ...(discovered.projects || []),
  ];

  if (offline) {
    console.warn("[project-icons] Skipped: GITHUB_SYNC_OFFLINE=1.");
    return;
  }

  await mkdir(iconDirectory, { recursive: true });

  const icons = {};
  const failures = [];

  for (const project of projects) {
    const slug = String(project.slug || project.repo).toLowerCase();
    if (!project.siteUrl) continue;
    try {
      const presentation = await resolvePresentation(project.siteUrl);
      if (!presentation.iconUrl) throw new Error("no icon was declared");
      const downloaded = await downloadIcon(presentation.iconUrl, slug);
      icons[project.repo] = {
        src: downloaded.file,
        background: presentation.background,
        source: presentation.iconUrl,
        fetchedAt: new Date().toISOString(),
      };
      console.log(
        `[project-icons] ${project.repo}: ${downloaded.file} ` +
          `(${(downloaded.bytes / 1024).toFixed(1)}KB, background ${presentation.background || "default"})`,
      );
    } catch (error) {
      failures.push({ repo: project.repo, reason: error.message });
    }
  }

  // Drop files for projects that no longer resolve, so public/ cannot drift.
  const keep = new Set(
    Object.values(icons).map((icon) => path.basename(icon.src)),
  );
  for (const file of await readdir(iconDirectory).catch(() => [])) {
    if (!keep.has(file)) await unlink(path.join(iconDirectory, file));
  }

  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        note: "Generated by scripts/fetch-project-icons.mjs. Do not edit by hand.",
        icons,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    `[project-icons] Resolved ${Object.keys(icons).length}/${projects.length} project icons.`,
  );
  for (const failure of failures) {
    const message = `${failure.repo} has no site icon: ${failure.reason}. The card falls back to its monogram.`;
    if (isCi) console.log(`::warning title=Missing project icon::${message}`);
    console.warn(`[project-icons] ${message}`);
  }
}

main().catch((error) => {
  console.error(`[project-icons] ${error.message}`);
  process.exitCode = 1;
});
