import resume from "@/content/resume.json";

/**
 * Résumé prose, kept as data so the weekly critique workflow can improve the
 * wording under validation. Employment facts — dates, titles, the roles
 * themselves — are immutable there; see scripts/optimize-resume.mjs.
 */
export const careerExperience = resume.careerExperience;
export const focusAreas = resume.focusAreas;
export const technicalBreadth = resume.technicalBreadth;
export const commercialProducts = resume.commercialProducts;

/**
 * Total characters of résumé prose. The printed résumé is tuned to exactly two
 * Letter pages, and the page-count check cannot run on the CI runner because
 * the serif stack it measures does not exist there. This is the font-independent
 * proxy that keeps automated edits from silently growing a third page.
 */
export function resumeContentLength() {
  return JSON.stringify(resume).length;
}
