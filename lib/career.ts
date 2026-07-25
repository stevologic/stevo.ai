import { projects } from "@/lib/project-data";

/**
 * Career facts stated in more than one place. The home page metric strip and
 * the résumé header both quote these, so they live here rather than as literals
 * in two files that drift apart.
 */
export const career = {
  yearsInTechnology: 16,
  yearsInCybersecurity: 11,
  largestOrgLed: 26,
  enterpriseScale: "Fortune 100",
} as const;

/** Metric tiles for the home page hero strip. */
export const heroMetrics = [
  { value: String(career.yearsInTechnology), label: "Years of IT experience" },
  {
    value: String(career.yearsInCybersecurity),
    label: "Years of cybersecurity experience",
  },
  // Derived, so daily project discovery cannot leave the count stale.
  { value: String(projects.length), label: "Live products" },
  { value: career.enterpriseScale, label: "Enterprise experience" },
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
 * The résumé's project sections, derived from the same data the portfolio
 * renders. Adding a project to the site — by hand or through daily discovery —
 * puts it on the résumé too, and a rename can never leave the two disagreeing.
 */
export const representativeWork = projects
  .filter((project) => project.featured)
  .map((project) => ({
    title: project.name,
    category: project.tagline,
    description: project.description,
    capabilities: project.tech.slice(0, 4),
    liveUrl: project.siteUrl,
    sourceUrl: project.sourceUrl,
  }));

export const additionalProducts = projects
  .filter((project) => !project.featured)
  .map((project) => ({
    name: project.name,
    url: project.siteUrl,
    description: project.tagline,
  }));
