#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const snapshotPath = path.join(rootDirectory, "data", "github.generated.json");

const defaultOwner = process.env.GITHUB_OWNER?.trim() || "stevologic";
const apiVersion = "2022-11-28";
const apiBaseUrl = "https://api.github.com";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
// The traffic endpoints need push access, so a dedicated PAT is preferred.
// Fall back to the general token: a local run authenticated with `repo` scope
// then still collects traffic instead of silently producing none.
const trafficToken =
  process.env.GITHUB_TRAFFIC_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim() || "";
const trafficWindowDays = 14;
const isCi = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
const strict = isCi || process.env.GITHUB_SYNC_STRICT === "1";
const offline = process.env.GITHUB_SYNC_OFFLINE === "1";

class GitHubRequestError extends Error {
  constructor(message, { status = 0, retryable = false, retryAfter = 0 } = {}) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
    this.retryable = retryable;
    this.retryAfter = retryAfter;
  }
}

async function readJson(filePath) {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents);
}

function projectListFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.projects)) return value.projects;
  throw new Error(
    "content/projects.json must be an array or an object with a projects array.",
  );
}

function repositoryCandidate(project) {
  if (!project || typeof project !== "object") return null;

  const directCandidates = [
    project.repo,
    project.repository,
    project.githubRepo,
    project.github,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (!candidate || typeof candidate !== "object") continue;

    for (const key of ["fullName", "nameWithOwner", "repo", "repository", "url"]) {
      if (typeof candidate[key] === "string" && candidate[key].trim()) {
        return candidate[key];
      }
    }
  }

  if (typeof project.links?.github === "string") return project.links.github;
  return null;
}

function normalizeRepository(value) {
  let repository = value.trim();

  if (repository.startsWith("git@github.com:")) {
    repository = repository.slice("git@github.com:".length);
  } else if (/^https?:\/\//i.test(repository)) {
    const url = new URL(repository);
    if (url.hostname.toLowerCase() !== "github.com") {
      throw new Error(`Repository URL must use github.com: ${value}`);
    }
    repository = url.pathname;
  }

  repository = repository
    .replace(/^github\.com\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.git$/i, "");

  const segments = repository.split("/").filter(Boolean);
  if (segments.length === 1) segments.unshift(defaultOwner);
  if (segments.length < 2) {
    throw new Error(`Invalid GitHub repository identifier: ${value}`);
  }

  const [owner, name] = segments;
  const validPart = /^[A-Za-z0-9_.-]+$/;
  if (!validPart.test(owner) || !validPart.test(name)) {
    throw new Error(`Invalid GitHub repository identifier: ${value}`);
  }

  return `${owner}/${name}`;
}

function collectRepositories(projects) {
  const repositories = new Map();

  projects.forEach((project, index) => {
    const candidate = repositoryCandidate(project);
    if (!candidate) return;

    const fullName = normalizeRepository(candidate);
    const key = fullName.toLowerCase();
    const projectKey = String(
      project.id ??
        project.slug ??
        project.domain ??
        project.name ??
        `project-${index + 1}`,
    );

    const existing = repositories.get(key);
    if (existing) {
      if (!existing.projectKeys.includes(projectKey)) {
        existing.projectKeys.push(projectKey);
      }
      return;
    }

    repositories.set(key, { fullName, projectKeys: [projectKey] });
  });

  return [...repositories.values()];
}

function snapshotCovers(snapshot, repositories) {
  if (
    !snapshot ||
    typeof snapshot.schemaVersion !== "number" ||
    snapshot.schemaVersion < 1 ||
    !Array.isArray(snapshot.repositories)
  ) {
    return false;
  }

  const available = new Set(
    snapshot.repositories
      .map((repository) => repository?.fullName)
      .filter((fullName) => typeof fullName === "string")
      .map((fullName) => fullName.toLowerCase()),
  );

  return repositories.every(({ fullName }) =>
    available.has(fullName.toLowerCase()),
  );
}

async function retainSnapshotOrThrow(error, repositories = []) {
  if (!strict) {
    try {
      const snapshot = await readJson(snapshotPath);
      if (snapshotCovers(snapshot, repositories)) {
        console.warn(
          `[sync-github] ${error.message} Keeping the committed GitHub snapshot for this local build.`,
        );
        return;
      }
    } catch {
      // The original error is more useful than a secondary snapshot read error.
    }
  }

  throw error;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function githubRequest(endpoint, { authToken = token } = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "stevo.ai-project-sync",
    "X-GitHub-Api-Version": apiVersion,
  };

  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers,
        signal: AbortSignal.timeout(20_000),
      });

      const responseText = await response.text();
      let payload;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const retryAfter = Number(response.headers.get("retry-after") || 0);
        const message =
          payload?.message || response.statusText || "Unknown GitHub API error";
        throw new GitHubRequestError(
          `GitHub API ${response.status} for ${endpoint}: ${message}`,
          {
            status: response.status,
            retryable: response.status === 429 || response.status >= 500,
            retryAfter,
          },
        );
      }

      return payload;
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof GitHubRequestError
          ? error.retryable
          : error?.name === "TimeoutError" || error?.name === "TypeError";

      if (!retryable || attempt === 2) break;
      const retryDelay =
        error instanceof GitHubRequestError && error.retryAfter > 0
          ? Math.min(error.retryAfter * 1_000, 10_000)
          : 1_000 * 2 ** attempt;
      await wait(retryDelay);
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error(`GitHub API request failed for ${endpoint}.`);
}

function cleanRelease(release) {
  return {
    id: release.id,
    tagName: release.tag_name,
    name: release.name || release.tag_name,
    url: release.html_url,
    createdAt: release.created_at,
    publishedAt: release.published_at,
    prerelease: Boolean(release.prerelease),
    draft: Boolean(release.draft),
  };
}

function cleanTrafficAggregate(payload, label) {
  const count = Number(payload?.count);
  const uniques = Number(payload?.uniques);

  if (!Number.isFinite(count) || !Number.isFinite(uniques)) {
    throw new Error(`GitHub returned unexpected ${label} traffic data.`);
  }

  return {
    count: Math.max(0, Math.trunc(count)),
    uniques: Math.max(0, Math.trunc(uniques)),
  };
}

/** Repositories whose traffic could not be read this run, with the reason. */
const trafficFailures = [];

async function fetchTraffic(encodedName, previousTraffic) {
  if (!trafficToken) {
    trafficFailures.push({
      repository: decodeURIComponent(encodedName),
      reason: "no traffic token was provided",
      hadPrevious: Boolean(previousTraffic),
    });
    return previousTraffic || null;
  }

  try {
    const [views, clones] = await Promise.all([
      githubRequest(`/repos/${encodedName}/traffic/views?per=day`, {
        authToken: trafficToken,
      }),
      githubRequest(`/repos/${encodedName}/traffic/clones?per=day`, {
        authToken: trafficToken,
      }),
    ]);

    return {
      windowDays: trafficWindowDays,
      fetchedAt: new Date().toISOString(),
      views: cleanTrafficAggregate(views, "view"),
      clones: cleanTrafficAggregate(clones, "clone"),
    };
  } catch (error) {
    const fallback = previousTraffic || null;
    trafficFailures.push({
      repository: decodeURIComponent(encodedName),
      reason: error.message,
      hadPrevious: Boolean(fallback),
    });
    return fallback;
  }
}

function previousRepositoryIndex(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.repositories)) return new Map();

  return new Map(
    snapshot.repositories
      .filter((repository) => typeof repository?.fullName === "string")
      .map((repository) => [repository.fullName.toLowerCase(), repository]),
  );
}

async function fetchRepository({ fullName, projectKeys }, previousRepository) {
  const encodedName = fullName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const [repository, releasePayload, traffic] = await Promise.all([
    githubRequest(`/repos/${encodedName}`),
    githubRequest(`/repos/${encodedName}/releases?per_page=100`),
    fetchTraffic(encodedName, previousRepository?.traffic),
  ]);

  if (!repository?.full_name || !Array.isArray(releasePayload)) {
    throw new Error(`GitHub returned an unexpected response for ${fullName}.`);
  }
  if (repository.private || repository.visibility !== "public") {
    throw new Error(`${repository.full_name} is not a public repository.`);
  }

  const releases = releasePayload.map(cleanRelease);

  return {
    projectKeys,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    url: repository.html_url,
    homepage: repository.homepage || null,
    topics: Array.isArray(repository.topics) ? repository.topics : [],
    primaryLanguage: repository.language || null,
    defaultBranch: repository.default_branch,
    visibility: repository.visibility,
    archived: Boolean(repository.archived),
    disabled: Boolean(repository.disabled),
    fork: Boolean(repository.fork),
    template: Boolean(repository.is_template),
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    createdAt: repository.created_at,
    updatedAt: repository.updated_at,
    pushedAt: repository.pushed_at,
    owner: {
      login: repository.owner?.login,
      url: repository.owner?.html_url,
      avatarUrl: repository.owner?.avatar_url,
    },
    license: repository.license
      ? {
          key: repository.license.key,
          name: repository.license.name,
          spdxId: repository.license.spdx_id,
          url: repository.license.html_url || null,
        }
      : null,
    latestRelease: releases[0] || null,
    releases,
    ...(traffic ? { traffic } : {}),
  };
}

/**
 * Traffic gaps used to be a buried warning, so a repository could sit on the
 * live site with no view or clone counts and nothing obvious to explain it.
 * Report coverage every run, and annotate it in Actions so it is visible in the
 * workflow summary rather than only in the raw log.
 */
function reportTrafficCoverage(metadata) {
  const missing = metadata.filter((repository) => !repository.traffic);
  const covered = metadata.length - missing.length;
  console.log(
    `[sync-github] Traffic aggregates: ${covered}/${metadata.length} repositories.`,
  );

  if (missing.length === 0) return;

  const annotate = process.env.GITHUB_ACTIONS === "true";
  for (const repository of missing) {
    const failure = trafficFailures.find(
      (entry) =>
        entry.repository.toLowerCase() === repository.fullName.toLowerCase(),
    );
    const reason = failure?.reason || "no traffic data was returned";
    const message =
      `${repository.fullName} has no GitHub views/clones data: ${reason}. ` +
      "The traffic endpoints need push access, so PROJECT_TRAFFIC_TOKEN must " +
      "include this repository.";
    if (annotate) console.log(`::warning title=Missing GitHub traffic::${message}`);
    console.warn(`[sync-github] ${message}`);
  }
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );
  return results;
}

async function main() {
  let repositories = [];
  let previousSnapshot = null;

  try {
    previousSnapshot = await readJson(snapshotPath);
  } catch {
    // A first run can create the snapshot from scratch.
  }

  try {
    const projects = projectListFrom(await readJson(projectsPath));
    // Discovered projects need the same metadata as curated ones, so their
    // cards show language, release, and traffic detail rather than blanks.
    let discovered = [];
    try {
      const snapshot = await readJson(discoveredPath);
      if (Array.isArray(snapshot?.projects)) discovered = snapshot.projects;
    } catch {
      // Discovery has not run yet, or produced nothing. Curated is enough.
    }
    repositories = collectRepositories([...projects, ...discovered]);
    if (repositories.length === 0) {
      throw new Error("content/projects.json does not list any GitHub repositories.");
    }
  } catch (error) {
    await retainSnapshotOrThrow(error, repositories);
    return;
  }

  if (offline) {
    await retainSnapshotOrThrow(
      new Error("GitHub synchronization is disabled by GITHUB_SYNC_OFFLINE=1."),
      repositories,
    );
    return;
  }

  try {
    const previousRepositories = previousRepositoryIndex(previousSnapshot);
    const metadata = await mapWithConcurrency(
      repositories,
      4,
      (repository) =>
        fetchRepository(
          repository,
          previousRepositories.get(repository.fullName.toLowerCase()),
        ),
    );
    const snapshot = {
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      source: apiBaseUrl,
      apiVersion,
      defaultOwner,
      repositories: metadata,
    };

    await mkdir(path.dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    console.log(
      `[sync-github] Updated ${path.relative(rootDirectory, snapshotPath)} with ${metadata.length} repositories.`,
    );
    reportTrafficCoverage(metadata);
  } catch (error) {
    await retainSnapshotOrThrow(error, repositories);
  }
}

main().catch((error) => {
  console.error(`[sync-github] ${error.message}`);
  process.exitCode = 1;
});
