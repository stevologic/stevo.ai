import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "../../components/PrintButton";

export const metadata: Metadata = {
  title: "Professional Profile | Stephen M Abbott",
  description:
    "A project-led professional profile for Stephen M Abbott, focused on applied AI, cybersecurity, and product engineering.",
};

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
          Back to portfolio
        </Link>
        <PrintButton />
      </nav>

      <article className="resume-document">
        <header className="resume-header">
          <p className="resume-eyebrow">Professional profile</p>
          <h1 className="resume-name">Stephen M Abbott</h1>
          <p className="resume-role">Applied AI &amp; cybersecurity product builder</p>
          <p className="resume-introduction">
            A hands-on builder who turns complex technical problems into
            inspectable, useful products. Public work spans governed agent
            systems, open security intelligence, software supply-chain tooling,
            local-first AI applications, and production-ready automation.
          </p>

          <dl className="resume-profile-summary">
            <div className="resume-profile-summary-item">
              <dt className="resume-profile-summary-label">Orientation</dt>
              <dd className="resume-profile-summary-value">Hands-on and product-led</dd>
            </div>
            <div className="resume-profile-summary-item">
              <dt className="resume-profile-summary-label">Primary lens</dt>
              <dd className="resume-profile-summary-value">AI systems with human control</dd>
            </div>
            <div className="resume-profile-summary-item">
              <dt className="resume-profile-summary-label">Public work</dt>
              <dd className="resume-profile-summary-value">Open, inspectable, and shipped</dd>
            </div>
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
              Stephen builds at the intersection of applied AI, cybersecurity,
              and product engineering. His public portfolio favors systems that
              make powerful capabilities understandable and reviewable: agents
              receive scoped context, security work requires proof, and users
              retain control over consequential actions.
            </p>
            <p className="resume-profile-copy">
              The work ranges from security knowledge infrastructure and
              dependency research to agent workspaces, communication tools, and
              focused end-user products. Across those projects, the consistent
              pattern is practical experimentation followed by disciplined,
              usable delivery.
            </p>
          </div>
        </section>

        <section className="resume-section" aria-labelledby="resume-focus-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">02</p>
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
            <p className="resume-section-index">03</p>
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
            <p className="resume-section-index">04</p>
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

        <section className="resume-section" aria-labelledby="resume-products-heading">
          <div className="resume-section-heading">
            <p className="resume-section-index">05</p>
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
            Full career résumé available on request
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
