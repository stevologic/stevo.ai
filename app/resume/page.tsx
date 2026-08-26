import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "../../components/PrintButton";
import { ProtectedEmailAddress } from "../../components/ProtectedEmail";
import { voiceLine } from "@/lib/contact";
import { credentials } from "@/lib/credentials";
import {
  additionalProducts,
  representativeWork,
  resumeMetrics,
} from "@/lib/career";
import {
  careerExperience,
  commercialProducts,
  focusAreas,
  technicalBreadth,
} from "@/lib/resume-content";

const resumeTitle = "Résumé | Stephen M Abbott";
const resumeDescription =
  "Résumé for Stephen M Abbott, cybersecurity and AI executive.";

export const metadata: Metadata = {
  title: resumeTitle,
  description: resumeDescription,
  alternates: { canonical: "/resume/" },
  openGraph: {
    type: "profile",
    url: "/resume/",
    title: resumeTitle,
    description: resumeDescription,
    images: [{ url: "/og-executive.png", width: 1734, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: resumeTitle,
    description: resumeDescription,
    images: ["/og-executive.png"],
  },
};


export default function ResumePage() {
  return (
    <main className="resume-page">
      <nav className="resume-toolbar" aria-label="Professional profile actions">
        <Link className="resume-back-link" href="/">
          Back to the site
        </Link>
        <PrintButton />
      </nav>

      <article className="resume-document">
        <header className="resume-header">
          <p className="resume-eyebrow">Professional resume</p>
          <h1 className="resume-name">Stephen M Abbott</h1>
          <p className="resume-role">
            Cybersecurity and AI Executive
          </p>
          <p className="resume-introduction">
            Cybersecurity and AI executive. Director-level at Fortune 100
            payments: CTEM, board risk, and a security engineering org of up
            to 26.
          </p>

          <ul className="resume-contact" aria-label="Contact">
            <li>
              <ProtectedEmailAddress />
            </li>
            <li>
              <a href={voiceLine.href}>{voiceLine.display}</a>
            </li>
          </ul>

          <dl className="resume-profile-summary">
            {resumeMetrics.map((metric) => (
              <div className="resume-profile-summary-item" key={metric.label}>
                <dt className="resume-profile-summary-label">{metric.label}</dt>
                <dd className="resume-profile-summary-value">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section
          className="resume-section resume-career-section"
          aria-labelledby="resume-career-heading"
        >
          <div className="resume-section-heading">
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

        {/* Print starts page two here, so the career history finishes a page
            rather than spilling a few roles onto the next one. */}
        <section
          className="resume-section resume-section-page-break"
          aria-labelledby="resume-focus-heading"
        >
          <div className="resume-section-heading">
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
            <h2 id="resume-work-heading" className="resume-section-title">
              Founder-built portfolio
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
                    {project.sourceUrl && (
                      <a
                        className="resume-project-link"
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    )}
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

        <section className="resume-section" aria-labelledby="resume-commercial-heading">
          <div className="resume-section-heading">
            <h2 id="resume-commercial-heading" className="resume-section-title">
              Enterprise platforms
            </h2>
          </div>
          <dl className="resume-technical-list">
            {commercialProducts.map((item) => (
              <div className="resume-technical-item" key={item.label}>
                <dt className="resume-technical-label">{item.label}</dt>
                <dd className="resume-technical-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="resume-section" aria-labelledby="resume-credentials-heading">
          <div className="resume-section-heading">
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
            <h2 id="resume-products-heading" className="resume-section-title">
              Additional ventures &amp; products
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
