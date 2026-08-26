export interface Credential {
  label: string;
  value: string;
  /** Short form used in the homepage credential strip. */
  short?: string;
  /** Set only for credentials that are awarded certifications. */
  certifications?: Array<{
    name: string;
    issuer: string;
  }>;
}

/**
 * Single source of truth for credentials. Wording is deliberately precise:
 * completed training is described as training, never as certification.
 */
export const credentials: Credential[] = [
  {
    label: "Education",
    value: "BA, Walter Cronkite School of Journalism, Arizona State University",
    short: "BA, Arizona State University",
  },
  {
    label: "Certifications",
    value:
      "Offensive Security Certified Professional (OSCP) · AWS Certified Cloud Practitioner",
    short: "Offensive Security Certified Professional",
    certifications: [
      {
        name: "Offensive Security Certified Professional (OSCP)",
        issuer: "OffSec",
      },
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
      },
    ],
  },
  {
    label: "Training",
    value: "CRISC Bootcamp · SpecterOps Adversary Tactics",
    short: "CRISC Bootcamp and SpecterOps Adversary Tactics training",
  },
  {
    label: "Leadership development",
    value:
      "Harvard Leadership Training Course · Duke University Accelerate Your Growth leadership training course",
    short: "Harvard & Duke leadership programs",
  },
];

/** Named credentials for the homepage strip. Training stays on the résumé. */
export const credentialHighlights = [
  "Offensive Security Certified Professional",
  "BA, Arizona State University",
];
