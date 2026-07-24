export interface ServiceTrack {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
  /**
   * Reference frameworks the work maps to. These describe the standards an
   * engagement is measured against — not certifications held.
   */
  standards: string[];
  bestFor: string;
}

export const serviceTracks: ServiceTrack[] = [
  {
    id: "vciso",
    number: "01",
    label: "vCISO",
    title: "vCISO & security leadership",
    description:
      "Embed experienced security leadership where the business needs it most: setting direction, creating an operating cadence, and turning risk into decisions executives and technical teams can act on.",
    outcomes: [
      "Security strategy, roadmap, and operating cadence",
      "Executive risk measures and decision support",
      "Program governance and incident readiness",
      "Application and developer security leadership",
    ],
    standards: [
      "NIST CSF 2.0",
      "ISO/IEC 27001",
      "SOC 2",
      "CIS Controls v8",
      "FAIR risk quantification",
    ],
    bestFor:
      "Organizations that need senior security leadership without adding a full-time CISO.",
  },
  {
    id: "enable",
    number: "02",
    label: "Enable",
    title: "AI enablement & governance",
    description:
      "Turn AI interest into governed business capability with a practical use-case roadmap, clear human authority, and controls designed for how agents and teams actually work.",
    outcomes: [
      "Use-case portfolio and adoption roadmap",
      "AI policy and control architecture",
      "Human approval, evidence, and rollback design",
      "Agent governance and operating models",
    ],
    standards: [
      "NIST AI RMF 1.0",
      "ISO/IEC 42001",
      "EU AI Act",
      "OWASP Top 10 for LLM Applications",
    ],
    bestFor:
      "Leadership teams moving from AI experimentation to responsible adoption.",
  },
  {
    id: "deliver",
    number: "03",
    label: "Deliver",
    title: "Secure AI & agent delivery",
    description:
      "Design and ship useful AI systems—not demos—with scoped context, durable memory, tool orchestration, and security built into the delivery path.",
    outcomes: [
      "MCP servers and agent toolchains",
      "Multi-provider AI applications",
      "Workflow automation and integrations",
      "Production prototypes and secure architecture",
    ],
    standards: [
      "OWASP ASVS",
      "NIST SSDF (SP 800-218)",
      "MITRE ATT&CK",
      "SLSA",
    ],
    bestFor: "Teams that need a working, defensible system—not another slide deck.",
  },
  {
    id: "assure",
    number: "04",
    label: "Assure",
    title: "Application & supply-chain assurance",
    description:
      "Turn dependency, vulnerability, and architecture signals into prioritized engineering action that can be verified, repeated, and explained.",
    outcomes: [
      "Dependency and attack-surface analysis",
      "CVE remediation workflows",
      "SBOM, license, and open-source risk review",
      "Evidence-driven security automation",
    ],
    standards: [
      "CycloneDX & SPDX SBOM",
      "CISA KEV",
      "EPSS",
      "OpenSSF Scorecard",
      "OSV",
    ],
    bestFor: "Engineering organizations that want security to accelerate delivery.",
  },
];

export interface EngagementModel {
  title: string;
  description: string;
  deliverables: string[];
}

export const engagementModels: EngagementModel[] = [
  {
    title: "Fractional leadership",
    description:
      "Ongoing vCISO direction, operating cadence, and executive security decision support.",
    deliverables: [
      "Security strategy and roadmap",
      "Executive and board-ready risk reporting",
      "A standing operating cadence",
    ],
  },
  {
    title: "Advisory intensive",
    description:
      "A bounded strategy, governance, risk, or architecture decision moved to resolution.",
    deliverables: [
      "A written recommendation with options and trade-offs",
      "The evidence and reasoning behind the call",
      "Named owners and next actions",
    ],
  },
  {
    title: "Delivery sprint",
    description:
      "Hands-on implementation, prototype, or security improvement with evidence and transfer.",
    deliverables: [
      "A working system or control, not a slide deck",
      "Runbook and operating documentation",
      "Handover to an internal owner",
    ],
  },
];

export const engagementProcess = [
  {
    step: "01",
    title: "Baseline",
    description:
      "Establish what is actually true today: controls in place, real exposure, who owns what, and which decisions are already waiting on an answer.",
  },
  {
    step: "02",
    title: "Prioritize",
    description:
      "Rank the work by risk reduced per unit of effort, and agree explicitly on what will not be done this quarter.",
  },
  {
    step: "03",
    title: "Operate",
    description:
      "Run the cadence: remediation, measurement, and the executive conversations that keep a security program moving between reviews.",
  },
  {
    step: "04",
    title: "Transfer",
    description:
      "Leave documented decisions, working systems, and an internal owner who can carry the program forward without the consultant.",
  },
];

export const workingPrinciples = [
  {
    title: "Evidence, not assertion",
    description:
      "Recommendations arrive with the data and reasoning behind them, so they can be challenged, verified, and defended to an auditor or a board.",
  },
  {
    title: "Client confidentiality",
    description:
      "Client and employer names are never used as marketing. The résumé published on this site is deliberately employer-anonymized for exactly that reason.",
  },
  {
    title: "Built to be handed over",
    description:
      "Every engagement targets an internal owner. Success is a capable team that no longer needs the engagement, not a permanent dependency.",
  },
  {
    title: "Coordinated disclosure",
    description:
      "This site publishes a security.txt disclosure policy. Security advice is worth less from a practice that does not practise it.",
  },
];
