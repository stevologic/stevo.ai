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

/**
 * The distinct paths this site supports. Keeping these together makes the
 * hero explicit for executive recruiters, advisory buyers, and venture
 * partners without blending permanent employment into client services.
 */
export const careerPaths = [
  {
    label: "Full-time executive roles",
    title: "CISO · VP Cybersecurity · VP AI Enablement",
    href: "#profile",
  },
  {
    label: "Advisory engagements",
    title: "vCISO · Cybersecurity & IT",
    href: "#services",
  },
  {
    label: "Products & partnerships",
    title: "Founder ventures",
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
 * The résumé's project sections, derived from the same data the portfolio
 * renders. Adding a project to the site — by hand or through daily discovery —
 * puts it on the résumé too, and a rename can never leave the two disagreeing.
 */
/**
 * Portfolio copy is rewritten weekly by the critique workflow, so anything it
 * feeds into the résumé has to be bounded here. Without these caps a longer
 * project description silently pushes the printed résumé onto a third page,
 * which is exactly what happened once.
 */
function clamp(text: string, limit: number) {
  const value = text.trim();
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** At most this many projects lead the résumé, however many are featured. */
const REPRESENTATIVE_LIMIT = 3;
/** Keep the printable résumé curated even as daily discovery grows the site. */
const ADDITIONAL_PRODUCT_LIMIT = 6;

export const representativeWork = projects
  .filter((project) => project.featured)
  .slice(0, REPRESENTATIVE_LIMIT)
  .map((project) => ({
    title: project.name,
    category: clamp(project.tagline, 70),
    description: clamp(project.description, 190),
    capabilities: project.tech.slice(0, 4),
    liveUrl: project.siteUrl,
    sourceUrl: project.sourceUrl,
  }));

export const additionalProducts = projects
  .filter((project) => !project.featured)
  .slice(0, ADDITIONAL_PRODUCT_LIMIT)
  .map((project) => ({
    name: project.name,
    url: project.siteUrl,
    description: clamp(project.tagline, 64),
  }));
