export interface Credential {
  label: string;
  value: string;
  /** Short form used in the homepage credential strip. */
  short?: string;
  /** Set only for credentials that are awarded certifications. */
  certification?: {
    name: string;
    issuer: string;
  };
}

/**
 * Single source of truth for credentials. Wording is deliberately precise:
 * completed training is described as training, never as certification.
 */
export const credentials: Credential[] = [
  {
    label: "Education",
    value: "BA, Walter Cronkite School of Journalism, Arizona State University",
    short: "BA, ASU - Walter Cronkite School of Journalism",
  },
  {
    label: "Security certification",
    value: "Offensive Security Certified Professional (OSCP)",
    short: "OSCP",
    certification: {
      name: "Offensive Security Certified Professional (OSCP)",
      issuer: "OffSec",
    },
  },
  {
    label: "Cloud and risk",
    value: "AWS Certified Cloud Practitioner · Formal CRISC training",
    short: "AWS Certified Cloud Practitioner",
    certification: {
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
    },
  },
  {
    label: "Leadership development",
    value: "Harvard and Duke University leadership training programs",
    short: "Harvard & Duke leadership programs",
  },
];

/** Named credentials for the homepage strip, in order of buyer relevance. */
export const credentialHighlights = [
  "OSCP",
  "AWS Certified Cloud Practitioner",
  "Harvard & Duke leadership programs",
  "BA, ASU - Walter Cronkite School of Journalism",
];
