import { projects } from "@/lib/project-data";
import resumeProjects from "@/content/resume-projects.json";

/**
 * Career facts stated in more than one place. The home page metric strip and
 * the résumé header both quote these, so they live here rather than as literals
 * in two files that drift apart.
 */
export const career = {
  yearsInTechnology: 16,
  yearsInCybersecurity: 12,
  largestOrgLed: 26,
  enterpriseScale: "Fortune 100",
} as const;

/**
 * How a visitor should move through the site. The practice leads with
 * packages; background and portfolio stay available as proof.
 */
export const careerPaths = [
  {
    label: "How to start",
    title: "Packages",
    href: "#packages",
  },
  {
    label: "The principal",
    title: "Background",
    href: "#profile",
  },
  {
    label: "Proof of delivery",
    title: "Portfolio",
    href: "#work",
  },
] as const;

/** Metric tiles for the home page hero strip. */
export const heroMetrics = [
  {
    value: String(career.yearsInTechnology),
    label: "Years in enterprise technology",
  },
  {
    value: String(career.yearsInCybersecurity),
    label: "Years in cybersecurity",
  },
  // Derived, so daily project discovery cannot leave the count stale.
  { value: String(projects.length), label: "Live products" },
  { value: career.enterpriseScale, label: "Operating scale" },
] as const;

/** Metric tiles for the résumé header. */
export const resumeMetrics = [
  {
    value: `${career.yearsInTechnology} years`,
    label: "Enterprise systems and security",
  },
  { value: `${career.yearsInCybersecurity} years`, label: "Cybersecurity" },
  { value: career.enterpriseScale, label: "Enterprise experience" },
  { value: `Up to ${career.largestOrgLed}`, label: "Engineers led" },
] as const;

/**
 * The approved résumé selects its own products and complete, concise prose.
 * Names and URLs still follow the portfolio, while daily discovery and weekly
 * portfolio rewrites cannot omit a venture or change the résumé's claims.
 */
function resumeProject(slug: string) {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Résumé project is missing: ${slug}`);
  return project;
}

export const representativeWork = resumeProjects.representativeWork.map((brief) => {
  const project = resumeProject(brief.slug);
  return {
    title: project.name,
    category: brief.category,
    description: brief.description,
    capabilities: project.tech.slice(0, 4),
    liveUrl: project.siteUrl,
    sourceUrl: project.sourceUrl,
  };
});

export const additionalProducts = [
  ...resumeProjects.additionalProducts.map((brief) => {
    const project = resumeProject(brief.slug);
    return {
      name: project.name,
      url: project.siteUrl,
      description: brief.description,
    };
  }),
  {
    name: "WinterHunt",
    url: undefined,
    description: "Multiplayer hunting-game prototype in development.",
  },
];
