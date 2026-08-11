export interface ServiceTrack {
  id: string;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
  /** How the track is delivered, shown on the hero identity card. */
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
      "Provide accountable CISO-level leadership: set strategy, establish an operating cadence, translate cyber risk for executives and boards, and align security priorities with the business.",
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
      "Organizations seeking experienced security leadership through a vCISO or retained advisory relationship.",
  },
  {
    id: "enable",
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
    mode: "Enterprise adoption",
    bestFor:
      "Leadership teams moving from AI experimentation to governed, measurable enterprise adoption.",
  },
  {
    id: "deliver",
    label: "Modernize",
    title: "AI-native cybersecurity & IT consulting",
    description:
      "Modernize how cybersecurity and IT teams decide, automate, and deliver by redesigning workflows around trustworthy AI, durable controls, and measurable service outcomes.",
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
      "Cybersecurity and IT organizations that need better decisions, stronger automation, and a practical path from legacy process to AI-native operations.",
  },
  {
    id: "assure",
    label: "Build",
    title: "Secure AI & product delivery",
    description:
      "Design and ship useful AI systems and secure products with scoped context, durable memory, tool orchestration, application security, and software supply-chain assurance built into delivery.",
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
      "Teams that need a working, defensible system and an internal owner who can carry it forward.",
  },
];

export interface EngagementModel {
  title: string;
  description: string;
  deliverables: string[];
}

export const engagementModels: EngagementModel[] = [
  {
    title: "vCISO leadership",
    description:
      "Ongoing executive security leadership, operating cadence, and board-ready decision support.",
    deliverables: [
      "Security strategy and roadmap",
      "Executive and board-ready risk reporting",
      "A standing operating cadence",
    ],
  },
  {
    title: "Cybersecurity & IT advisory",
    description:
      "A bounded strategy, governance, risk, or architecture decision moved to resolution.",
    deliverables: [
      "A written recommendation with options and trade-offs",
      "The evidence and reasoning behind the call",
      "Named owners and next actions",
    ],
  },
  {
    title: "AI enablement sprint",
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
      "Run the cadence: remediation, measurement, and the executive conversations that keep a security program moving between reviews.",
  },
  {
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
