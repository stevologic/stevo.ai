import curatedProjects from "@/content/projects.json";
import generatedSnapshot from "@/data/github.generated.json";

export type ProjectCategory = "Security" | "AI systems" | "Product lab";

export interface GitHubTraffic {
  windowDays: number;
  fetchedAt?: string;
  views: {
    count: number;
    uniques: number;
  };
  clones: {
    count: number;
    uniques: number;
  };
}

export interface PortfolioProject {
  repo: string;
  slug: string;
  name: string;
  category: ProjectCategory;
  featured: boolean;
  tagline: string;
  description: string;
  siteUrl: string;
  sourceUrl: string;
  metrics: string[];
  tech: string[];
  capabilities: string[];
  statusLabel: string;
  github: {
    language?: string;
    stars?: number;
    forks?: number;
    pushedAt?: string;
    updatedAt?: string;
    releaseTag?: string;
    releaseUrl?: string;
    topics?: string[];
    traffic?: GitHubTraffic;
  };
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function stringValue(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string");
}

function numberValue(...values: unknown[]) {
  return values.find((value): value is number => typeof value === "number");
}

function trafficAggregate(value: unknown) {
  const source = record(value);
  const count = numberValue(source.count);
  const uniques = numberValue(source.uniques);

  return typeof count === "number" && typeof uniques === "number"
    ? { count, uniques }
    : undefined;
}

function buildRepositoryIndex(snapshot: unknown) {
  const root = record(snapshot);
  const candidate =
    root.repositories ?? root.repos ?? root.projects ?? root.data ?? {};

  if (Array.isArray(candidate)) {
    return Object.fromEntries(
      candidate
        .map((item) => record(item))
        .map((item) => [stringValue(item.repo, item.name, item.repository), item])
        .filter((entry): entry is [string, UnknownRecord] => Boolean(entry[0])),
    );
  }

  return record(candidate);
}

const snapshotRoot = record(generatedSnapshot);
const repositories = buildRepositoryIndex(generatedSnapshot);

export const githubSyncedAt = stringValue(
  snapshotRoot.syncedAt,
  snapshotRoot.generatedAt,
  snapshotRoot.updatedAt,
);

export const projects: PortfolioProject[] = curatedProjects.map((project) => {
  const source = record(repositories[project.repo]);
  const release = record(source.latestRelease ?? source.release);
  const traffic = record(source.traffic);
  const trafficWindowDays = numberValue(traffic.windowDays);
  const trafficViews = trafficAggregate(traffic.views);
  const trafficClones = trafficAggregate(traffic.clones);
  const trafficData =
    typeof trafficWindowDays === "number" && trafficViews && trafficClones
      ? {
          windowDays: trafficWindowDays,
          fetchedAt: stringValue(traffic.fetchedAt),
          views: trafficViews,
          clones: trafficClones,
        }
      : undefined;
  const topics = Array.isArray(source.topics)
    ? source.topics.filter((topic): topic is string => typeof topic === "string")
    : undefined;

  return {
    ...project,
    category: project.category as ProjectCategory,
    github: {
      language: stringValue(source.language, source.primaryLanguage),
      stars: numberValue(source.stars, source.stargazers_count),
      forks: numberValue(source.forks, source.forks_count),
      pushedAt: stringValue(source.pushedAt, source.pushed_at),
      updatedAt: stringValue(source.updatedAt, source.updated_at),
      releaseTag: stringValue(
        release.tag,
        release.tagName,
        release.tag_name,
        source.latestReleaseTag,
      ),
      releaseUrl: stringValue(
        release.url,
        release.htmlUrl,
        release.html_url,
        source.latestReleaseUrl,
      ),
      topics,
      traffic: trafficData,
    },
  };
});
