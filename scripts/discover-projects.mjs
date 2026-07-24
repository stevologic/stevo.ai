#!/usr/bin/env node
// Lists the owner's public repositories and writes a project card for any that
// is live but not curated in content/projects.json.
//
// Run before sync-github.mjs, which then fetches metadata for curated and
// discovered repositories alike. The generated file is committed so local and
// offline builds keep working; CI refreshes it daily.
//
// Eligibility is deliberately narrow: public, not a fork/archive/template, not
// excluded, and resolving to a live site URL. See content/discovery.json.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const projectsPath = path.join(rootDirectory, "content", "projects.json");
const configPath = path.join(rootDirectory, "content", "discovery.json");
const outputPath = path.join(rootDirectory, "data", "discovered.generated.json");

const apiBaseUrl = "https://api.github.com";
const apiVersion = "2022-11-28";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const isCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const strict = isCi || process.env.GITHUB_SYNC_STRICT === "1";
const offline = process.env.GITHUB_SYNC_OFFLINE === "1";

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function githubRequest(endpoint) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "stevo.ai-project-discovery",
    "X-GitHub-Api-Version": apiVersion,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        const error = new Error(
          `GitHub API ${response.status} for ${endpoint}: ${response.statusText}`,
        );
        if (!retryable || attempt === 2) throw error;
      } else {
        return response.json();
      }
    } catch (error) {
      if (attempt === 2) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000 * 2 ** attempt));
  }
  throw new Error(`GitHub API request failed for ${endpoint}.`);
}

async function listPublicRepositories(owner) {
  const repositories = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await githubRequest(
      `/users/${encodeURIComponent(owner)}/repos?per_page=100&type=owner&sort=pushed&page=${page}`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  return repositories;
}

/** "arrowheadpaesanowebsite" -> "Arrowheadpaesanowebsite"; "doge-miner" -> "Doge Miner". */
function titleCase(repoName) {
  return repoName
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferCategory(repository, config) {
  const haystack = [
    ...(Array.isArray(repository.topics) ? repository.topics : []),
    repository.language || "",
    repository.name,
    repository.description || "",
  ]
    .join(" ")
    .toLowerCase();

  for (const [category, keywords] of Object.entries(config.categories || {})) {
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return config.defaultCategory || "Product lab";
}

function sentence(text) {
  const trimmed = (text || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildCard(repository, config, languages) {
  const siteUrl =
    config.siteUrls?.[repository.name] || repository.homepage?.trim() || "";
  if (!siteUrl) return null;

  const name = config.names?.[repository.name] || titleCase(repository.name);
  const description = sentence(repository.description);
  const tech = Object.keys(languages || {}).slice(0, 5);
  const topics = (Array.isArray(repository.topics) ? repository.topics : [])
    .slice(0, 3)
    .map((topic) => titleCase(topic));

  const metrics = [
    repository.language && `${repository.language} project`,
    repository.stargazers_count > 0 &&
      `${repository.stargazers_count} GitHub star${repository.stargazers_count === 1 ? "" : "s"}`,
    repository.license?.spdx_id &&
      repository.license.spdx_id !== "NOASSERTION" &&
      `${repository.license.spdx_id} licensed`,
  ].filter(Boolean);

  return {
    repo: repository.name,
    slug: repository.name.toLowerCase(),
    name,
    category: inferCategory(repository, config),
    featured: false,
    // Generated copy is intentionally plain. Adding the repository to
    // projects.json replaces all of this with real editorial copy.
    tagline: description || `${name} — live project.`,
    description:
      description ||
      `${name} is a public project by the repository owner. Full details are available in the source repository.`,
    siteUrl,
    sourceUrl: repository.html_url,
    metrics: metrics.length ? metrics : ["Public source"],
    tech: tech.length ? tech : [repository.language || "Source available"],
    capabilities: topics.length ? topics : ["Open source"],
    statusLabel: "Live",
    discovered: true,
  };
}

async function writeOutput(projects, note) {
  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    note,
    projects,
  };
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function keepExistingOrThrow(error) {
  if (!strict) {
    try {
      const existing = await readJson(outputPath);
      if (Array.isArray(existing?.projects)) {
        console.warn(
          `[discover-projects] ${error.message} Keeping the committed discovery snapshot.`,
        );
        return;
      }
    } catch {
      // Fall through: an empty snapshot is still a valid outcome locally.
    }
    console.warn(
      `[discover-projects] ${error.message} Writing an empty discovery snapshot.`,
    );
    await writeOutput([], "Discovery unavailable; no repositories were added.");
    return;
  }
  throw error;
}

async function main() {
  const [config, curated] = await Promise.all([
    readJson(configPath),
    readJson(projectsPath),
  ]);

  if (offline) {
    await keepExistingOrThrow(
      new Error("Discovery is disabled by GITHUB_SYNC_OFFLINE=1."),
    );
    return;
  }

  const owner = process.env.GITHUB_OWNER?.trim() || config.owner || "stevologic";
  const curatedRepos = new Set(
    (Array.isArray(curated) ? curated : curated.projects || [])
      .map((project) => String(project.repo || "").toLowerCase())
      .filter(Boolean),
  );
  const excluded = new Set(
    (config.exclude || []).map((name) => String(name).toLowerCase()),
  );

  try {
    const repositories = await listPublicRepositories(owner);
    const eligible = repositories.filter(
      (repository) =>
        !repository.private &&
        repository.visibility === "public" &&
        !repository.fork &&
        !repository.archived &&
        !repository.disabled &&
        !repository.is_template &&
        !excluded.has(repository.name.toLowerCase()) &&
        !curatedRepos.has(repository.name.toLowerCase()),
    );

    const cards = [];
    const skipped = [];
    for (const repository of eligible) {
      const hasSite = Boolean(
        config.siteUrls?.[repository.name] || repository.homepage?.trim(),
      );
      if (!hasSite) {
        skipped.push(repository.name);
        continue;
      }
      let languages = {};
      try {
        languages = await githubRequest(
          `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository.name)}/languages`,
        );
      } catch {
        // Language detail is a nicety; the card is still worth publishing.
      }
      const card = buildCard(repository, config, languages);
      if (card) cards.push(card);
    }

    cards.sort((a, b) => a.name.localeCompare(b.name));
    await writeOutput(
      cards,
      "Generated by scripts/discover-projects.mjs. Do not edit by hand; add an entry to content/projects.json to curate a project instead.",
    );

    console.log(
      `[discover-projects] Scanned ${repositories.length} public repositories for ${owner}: ` +
        `${curatedRepos.size} curated, ${cards.length} discovered, ${skipped.length} without a site URL.`,
    );
    if (cards.length) {
      for (const card of cards) {
        console.log(`[discover-projects]   + ${card.repo} -> ${card.siteUrl}`);
      }
    }
    if (skipped.length) {
      console.log(
        `[discover-projects] Set the Website field on these to publish them: ${skipped.join(", ")}`,
      );
    }
  } catch (error) {
    await keepExistingOrThrow(error);
  }
}

main().catch((error) => {
  console.error(`[discover-projects] ${error.message}`);
  process.exitCode = 1;
});
