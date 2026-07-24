import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "../../components/PrintButton";

export const metadata: Metadata = {
  title: "Stephen M Abbott | CEO, Stevo.AI",
  description:
    "The employer-anonymized professional resume of Stephen M Abbott, CEO of Stevo.AI, spanning cybersecurity leadership, applied AI, enterprise engineering, and shipped products.",
};

const careerMetrics = [
  { value: "16 years", label: "Enterprise systems and security" },
  { value: "Up to 26", label: "Engineers led" },
  { value: "92%", label: "Sensitive-data reduction" },
  { value: "75%+", label: "Open-source dependency reduction" },
] as const;

const careerExperience = [
  {
    dates: "2024-2026",
    title: "Director, Cybersecurity",
    scope: "Exposure management · Remediation operations · Developer security",
    highlights: [
      "Led an 11-person team responsible for remediation operations and Continuous Threat Exposure Management at enterprise scale.",
      "Introduced risk-based prioritization, risk quantification, and governed AI-assisted remediation in partnership with executive security leadership.",
      "Contributed to enterprise risk-appetite measures and Key Risk Indicators used in recurring board and executive reporting.",
      "Built developer-engagement and preventative-control programs that improved ownership and reduced open-source dependencies in source code by more than 75%.",
      "Developed security leaders, with team members advancing into senior and director-level positions.",
    ],
  },
  {
    dates: "2021-2024",
    title: "Director, Security Data & Risk Intelligence",
    scope: "Security data platforms · Supply-chain intelligence · Sensitive-data protection",
    highlights: [
      "Led an engineering organization of up to 26 people delivering platforms for sensitive-data detection, software-composition intelligence, and repository enrichment.",
      "Reduced sensitive-data findings in source code by 92%, tripled detection coverage, and improved fidelity through automation with human review.",
      "Owned application risk assessments, business-impact analysis, disaster-recovery requirements, and resilience planning for critical platforms.",
      "Built risk-intelligence platforms and analytics that strengthened prioritization, governance, and executive decision-making.",
      "Partnered across cloud and identity teams to secure infrastructure-as-code pipelines, apply encryption controls, and grow engineers into senior technical roles.",
    ],
  },
  {
    dates: "2019-2021",
    title: "Senior Cybersecurity Engineer, Application Security",
    scope: "SAST · DAST · Mobile testing · Software composition analysis",
    highlights: [
      "Managed an enterprise application-security tooling portfolio spanning static, dynamic, mobile, and software-composition analysis.",
      "Led testing strategy, adoption, process integration, and effectiveness measurement throughout the software-development lifecycle.",
      "Embedded scalable application-risk reduction practices directly into engineering workflows.",
    ],
  },
  {
    dates: "2014-2019",
    title: "Senior Security Engineer, Detection & Infrastructure",
    scope: "SIEM · Network visibility · Centralized telemetry",
    highlights: [
      "Engineered SIEM, full-packet-capture, and centralized logging platforms supporting enterprise threat detection and security operations.",
      "Enabled encrypted-traffic inspection to improve network visibility and threat-detection coverage.",
      "Deployed globally distributed, highly available security infrastructure across enterprise data centers.",
      "Developed incident-response detections from logs, network telemetry, IDS/IPS events, and endpoint-security signals.",
    ],
  },
  {
    dates: "2010-2014",
    title: "Senior Infrastructure Engineer, Resilient Transaction Platforms",
    scope: "Backend services · Operational resilience · Automated delivery",
    highlights: [
      "Supported backend services for business-critical transaction systems in a highly regulated environment.",
      "Maintained performance monitoring for 99.99% availability and helped automate application deployments through CI/CD.",
      "Supported disaster-recovery and business-resilience programs for high-stakes systems, building the operational foundation for later security leadership.",
    ],
  },
] as const;

const focusAreas = [
  {
    title: "Governed AI adoption",
    description:
      "Designing AI workflows around bounded context, human approval, evidence, rollback, and clear ownership.",
  },
  {
    title: "AI agent architecture",
    description:
      "Building practical agent systems with tool orchestration, MCP, memory, scheduling, browser control, and local-first operation.",
  },
  {
    title: "Application and supply-chain security",
    description:
      "Connecting vulnerability intelligence, dependency analysis, license review, SBOMs, and secure remediation workflows.",
  },
  {
    title: "AI product engineering",
    description:
      "Turning emerging model capabilities into polished web, desktop, API, and command-line products that people can use.",
  },
] as const;

const representativeWork = [
  {
    title: "security-recipes.ai",
    category: "Open security infrastructure",
    description:
      "An open, self-hostable knowledge layer that connects CVE intelligence to reviewed recipes, playbooks, proof requirements, rollback guidance, and bounded agent context.",
    capabilities: ["Python", "FastMCP", "CVE intelligence", "Governed action"],
    liveUrl: "https://security-recipes.ai",
    sourceUrl: "https://github.com/stevologic/security-recipes.ai",
  },
  {
    title: "Shiba Studio",
    category: "Local-first agent workspace",
    description:
      "A desktop-grade environment for orchestrating agents with code editing, browser control, integrations, scheduling, memory, and auditable workflows.",
    capabilities: ["TypeScript", "Next.js", "SQLite", "Playwright"],
    liveUrl: "https://shiba-studio.io",
    sourceUrl: "https://github.com/stevologic/shiba-studio",
  },
  {
    title: "OSS Dependency Explorer",
    category: "Software supply-chain research",
    description:
      "A dependency intelligence platform spanning eight package ecosystems, with vulnerability triage, OpenSSF data, license review, SBOM exports, APIs, and MCP access.",
    capabilities: ["Go", "JavaScript", "OSV", "SBOM"],
    liveUrl: "https://ossde.dev",
    sourceUrl: "https://github.com/stevologic/oss-deps-explorer",
  },
  {
    title: "Pro Response",
    category: "Multi-provider AI assistant",
    description:
      "An AI writing assistant for Slack that also runs as an HTTP API, command-line tool, and Python library, with support for modern hosted model providers.",
    capabilities: ["Python", "Slack", "OpenAI", "Anthropic"],
    liveUrl: "https://stevologic.github.io/pro-response/",
    sourceUrl: "https://github.com/stevologic/pro-response",
  },
] as const;

const technicalBreadth = [
  {
    label: "Languages",
    value: "TypeScript, Python, JavaScript, Go, and C#",
  },
  {
    label: "AI and agents",
    value:
      "OpenAI, Anthropic, Google, xAI, Ollama, MCP, tool orchestration, and local model workflows",
  },
  {
    label: "Security",
    value:
      "CVE and CISA KEV intelligence, OSV, OpenSSF Scorecard, dependency analysis, SBOMs, and evidence-driven remediation",
  },
  {
    label: "Product platforms",
    value:
      "Next.js, React, Django, FastMCP, Docker, Playwright, SQLite, Redis, WinForms, and OpenCL",
  },
] as const;

const credentials = [
  {
    label: "Education",
    value: "BA, Walter Cronkite School of Journalism, Arizona State University",
  },
  {
    label: "Security certification",
    value: "Offensive Security Certified Professional (OSCP)",
  },
  {
    label: "Cloud and risk",
    value: "AWS Certified Cloud Practitioner · Formal CRISC training",
  },
  {
    label: "Leadership development",
    value: "Harvard and Duke University leadership training programs",
  },
] as const;

const additionalProducts = [
  {
    name: "Tiny Book Buddies AI",
    url: "https://tinybookbuddies.ai",
    description: "Multi-provider generative storytelling studio",
  },
  {
    name: "DOGE Commerce Kit",
    url: "https://commerce.dog",
    description: "Non-custodial commerce toolkit",
  },
  {
    name: "DOGE MINER",
    url: "https://doge-miner.io",
    description: "Full-stack mining software and telemetry dashboard",
  },
  {
    name: "Mouse Clicker",
    url: "https://mouseclicker.app",
    description: "Portable Windows automation application",
  },
] as const;

export default function ResumePage() {
  return (
    <main className="resume-page">
      <nav className="resume-toolbar" aria-label="Professional profile actions">
        <Link className="resume-back-link" href="/">
          Back to Stevo.AI
        </Link>
        <PrintButton />
      </nav>

      <article className="resume-document">
        <header className="resume-header">
          <p className="resume-eyebrow">Professional resume · CEO profile</p>
          <h1 className="resume-name">Stephen M Abbott</h1>
          <p className="resume-role">
            CEO, Stevo.AI · Cybersecurity &amp; AI enablement
          </p>
          <p className="resume-introduction">
            CEO of Stevo.AI and a cybersecurity and engineering leader with 16
            years building and scaling security programs in highly regulated
            enterprise environments. Combines executive risk governance,
            exposure management, application and supply-chain security,
            sensitive-data protection, governed AI-assisted remediation, and
            hands-on product engineering.
          </p>

          <dl className="resume-profile-summary">
            {careerMetrics.map((metric) => (
              <div className="resume-profile-summary-item" key={metric.label}>
                <dt className="resume-profile-summary-label">{metric.label}</dt>
                <dd className="resume-profile-summary-value">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="resume-section" aria-labelledby="resume-profile-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">01</p>
            <h2 id="resume-profile-heading" className="resume-section-title">
              Executive profile
            </h2>
          </div>
          <div className="resume-section-content">
            <p className="resume-profile-copy">
              Stephen&apos;s career progresses from resilient transaction systems
              through detection engineering, application security, security
              data platforms, and enterprise risk leadership. He combines
              hands-on technical depth with experience scaling teams, advising
              executives, and turning complex security signals into decisions
              that leaders and engineers can act on.
            </p>
            <p className="resume-profile-copy">
              His public work extends that operating model into governed agent
              systems, open security intelligence, software supply-chain
              research, and polished end-user products. The consistent pattern
              is powerful capability bounded by evidence, human review, clear
              ownership, and useful delivery.
            </p>
          </div>
        </section>

        <section
          className="resume-section resume-career-section"
          aria-labelledby="resume-career-heading"
        >
          <div className="resume-section-heading">
            <p className="resume-section-index">02</p>
            <h2 id="resume-career-heading" className="resume-section-title">
              Professional experience
            </h2>
          </div>
          <div className="resume-career-list">
            {careerExperience.map((role) => (
              <article className="resume-career-role" key={`${role.dates}-${role.title}`}>
                <header className="resume-career-role-header">
                  <div>
                    <h3 className="resume-career-title">{role.title}</h3>
                    <p className="resume-career-scope">{role.scope}</p>
                  </div>
                  <p className="resume-career-dates">{role.dates}</p>
                </header>
                <ul className="resume-career-highlights">
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section" aria-labelledby="resume-focus-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">03</p>
            <h2 id="resume-focus-heading" className="resume-section-title">
              Focus areas
            </h2>
          </div>
          <div className="resume-focus-grid">
            {focusAreas.map((area) => (
              <article className="resume-focus-card" key={area.title}>
                <h3 className="resume-focus-title">{area.title}</h3>
                <p className="resume-focus-description">{area.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section" aria-labelledby="resume-work-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">04</p>
            <h2 id="resume-work-heading" className="resume-section-title">
              Representative work
            </h2>
          </div>
          <div className="resume-project-list">
            {representativeWork.map((project) => (
              <article className="resume-project" key={project.title}>
                <header className="resume-project-header">
                  <div className="resume-project-heading">
                    <h3 className="resume-project-title">{project.title}</h3>
                    <p className="resume-project-category">{project.category}</p>
                  </div>
                  <div className="resume-project-links">
                    <a
                      className="resume-project-link"
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live project
                    </a>
                    <a
                      className="resume-project-link"
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source
                    </a>
                  </div>
                </header>
                <p className="resume-project-description">{project.description}</p>
                <ul
                  className="resume-project-capabilities"
                  aria-label={`${project.title} technologies and capabilities`}
                >
                  {project.capabilities.map((capability) => (
                    <li className="resume-project-capability" key={capability}>
                      {capability}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section" aria-labelledby="resume-technical-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">05</p>
            <h2 id="resume-technical-heading" className="resume-section-title">
              Technical breadth
            </h2>
          </div>
          <dl className="resume-technical-list">
            {technicalBreadth.map((item) => (
              <div className="resume-technical-item" key={item.label}>
                <dt className="resume-technical-label">{item.label}</dt>
                <dd className="resume-technical-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="resume-section" aria-labelledby="resume-credentials-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">06</p>
            <h2 id="resume-credentials-heading" className="resume-section-title">
              Credentials
            </h2>
          </div>
          <dl className="resume-technical-list">
            {credentials.map((credential) => (
              <div className="resume-technical-item" key={credential.label}>
                <dt className="resume-technical-label">{credential.label}</dt>
                <dd className="resume-technical-value">{credential.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="resume-section" aria-labelledby="resume-products-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">07</p>
            <h2 id="resume-products-heading" className="resume-section-title">
              Additional shipped products
            </h2>
          </div>
          <ul className="resume-product-list">
            {additionalProducts.map((product) => (
              <li className="resume-product-item" key={product.name}>
                <a
                  className="resume-product-link"
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.name}
                </a>
                <span className="resume-product-description">
                  {product.description}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="resume-footer">
          <p className="resume-availability">
            Employer names intentionally omitted · Additional detail available on request
          </p>
          <a
            className="resume-github-link"
            href="https://github.com/stevologic"
            target="_blank"
            rel="noreferrer"
          >
            github.com/stevologic
          </a>
        </footer>
      </article>
    </main>
  );
}
