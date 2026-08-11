export interface ServiceTrack {
  id: string;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
  /** How the track is delivered, shown in the active service detail. */
  mode: string;
  /**
   * Reference frameworks the work maps to. These describe the standards an
   * engagement is measured against — not certifications held.
   */
  standards: string[];
  bestFor: string;
}

export const serviceTracks: ServiceTrack[] = [
  {
    id: "lead",
    label: "vCISO",
    title: "vCISO & security leadership",
    description:
      "An accountable security executive relationship for organizations that need experienced direction, governance, and board confidence.",
    outcomes: [
      "Cybersecurity strategy, roadmap, and operating cadence",
      "Board-ready risk measures and executive decision support",
      "Program governance, resilience, and incident readiness",
      "Security organization and capability development",
    ],
    standards: [
      "NIST CSF 2.0",
      "ISO/IEC 27001",
      "SOC 2",
      "CIS Controls v8",
      "FAIR risk quantification",
    ],
    mode: "Executive advisory",
    bestFor:
      "A security program entering growth, transition, board scrutiny, or a reset.",
  },
  {
    id: "enable",
    label: "Enable",
    title: "AI enablement & governance",
    description:
      "A controlled path from scattered experimentation to business-owned AI capability.",
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
    mode: "Enterprise adoption",
    bestFor:
      "Teams with promising use cases but unclear ownership, controls, or measures.",
  },
  {
    id: "deliver",
    label: "Modernize",
    title: "AI-native cybersecurity & IT consulting",
    description:
      "Redesign the operating work—not just the tooling—so teams make faster decisions with controls intact.",
    outcomes: [
      "AI-native operating model and workflow redesign",
      "Cybersecurity and IT process automation",
      "Platform, data, integration, and resilience roadmaps",
      "Technology rationalization and change enablement",
    ],
    standards: [
      "NIST CSF 2.0",
      "NIST AI RMF 1.0",
      "CIS Controls v8",
      "ITIL 4",
      "COBIT 2019",
    ],
    mode: "AI-native transformation",
    bestFor:
      "Teams constrained by manual work, fragmented tooling, or legacy process.",
  },
  {
    id: "assure",
    label: "Build",
    title: "Secure AI & product delivery",
    description:
      "Move a defined security or AI use case into a defensible working system.",
    outcomes: [
      "MCP servers, agent toolchains, and workflow automation",
      "Production prototypes and secure architecture",
      "Application and software supply-chain assurance",
      "Evidence-driven remediation and engineering transfer",
    ],
    standards: [
      "OWASP ASVS",
      "NIST SSDF (SP 800-218)",
      "MITRE ATT&CK",
      "SLSA",
      "CycloneDX & SPDX SBOM",
    ],
    mode: "Hands-on delivery",
    bestFor:
      "Teams with an approved use case that now needs architecture and implementation.",
  },
];

export interface EngagementModel {
  label: string;
  title: string;
  description: string;
}

export const engagementModels: EngagementModel[] = [
  {
    label: "Ongoing",
    title: "Retained leadership",
    description:
      "Recurring executive ownership for strategy, governance, risk decisions, and board communication.",
  },
  {
    label: "Bounded",
    title: "Decision advisory",
    description:
      "A consequential decision resolved with evidence, trade-offs, an accountable owner, and a practical roadmap.",
  },
  {
    label: "Build to transfer",
    title: "Delivery sprint",
    description:
      "A focused implementation that leaves a working control or system, operating documentation, and a clear adoption path.",
  },
];

export const engagementProcess = [
  {
    title: "Baseline",
    description:
      "Establish what is actually true today: controls in place, real exposure, who owns what, and which decisions are already waiting on an answer.",
  },
  {
    title: "Prioritize",
    description:
      "Rank the work by risk reduced per unit of effort, and agree explicitly on what will not be done this quarter.",
  },
  {
    title: "Operate",
    description:
      "Track remediation and outcomes while resolving the executive decisions that keep the program moving.",
  },
  {
    title: "Transfer",
    description:
      "Leave documented decisions, working systems, and an internal owner who can carry the program forward without the consultant.",
  },
];
