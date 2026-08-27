import type { Metadata } from "next";
import Link from "next/link";

import { decodeProtectedEmail, voiceLine } from "@/lib/contact";
import { practice } from "@/lib/practice";
import {
  engagementProcess,
  servicePackages,
  serviceTracks,
} from "@/lib/services";

const siteUrl = "https://stevo.ai";

/**
 * One landing page per service track, so a search for the service lands on
 * the service instead of a homepage section. Every visible sentence comes
 * from lib/services.ts — the same data the homepage renders — so these pages
 * can never promise more than the practice does.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceTracks.map((track) => ({ slug: track.page.slug }));
}

function trackBySlug(slug: string) {
  const track = serviceTracks.find((candidate) => candidate.page.slug === slug);
  if (!track) throw new Error(`unknown service page: ${slug}`);
  return track;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const track = trackBySlug((await params).slug);
  return {
    title: track.page.metaTitle,
    description: track.page.metaDescription,
    alternates: { canonical: `/services/${track.page.slug}/` },
    openGraph: {
      type: "website",
      url: `/services/${track.page.slug}/`,
      title: track.page.metaTitle,
      description: track.page.metaDescription,
      images: [{ url: "/og-services.png", width: 1734, height: 907 }],
    },
    twitter: {
      card: "summary_large_image",
      title: track.page.metaTitle,
      description: track.page.metaDescription,
      images: ["/og-services.png"],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const track = trackBySlug((await params).slug);
  const servicePackage = servicePackages.find(
    (candidate) => candidate.trackId === track.id,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${siteUrl}/services/${track.page.slug}/#service`,
        name: track.title,
        description: track.description,
        serviceType: track.label,
        url: `${siteUrl}/services/${track.page.slug}/`,
        areaServed: "Worldwide",
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: practice.name,
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: track.title,
            item: `${siteUrl}/services/${track.page.slug}/`,
          },
        ],
      },
    ],
  };

  return (
    <main className="service-page">
      <nav className="service-page-toolbar" aria-label="Service page actions">
        <Link className="service-page-back" href="/">
          Back to the site
        </Link>
        <Link className="service-page-back" href="/#packages">
          All packages
        </Link>
      </nav>

      <article className="service-page-document">
        <header className="service-page-header">
          <p className="service-page-eyebrow">{practice.headline}</p>
          <h1>{track.title}</h1>
          <p className="service-page-lede">{track.description}</p>
          <p className="service-page-mode">
            <span className="status-dot" aria-hidden="true" />
            {track.mode}
          </p>
          <div className="service-page-actions">
            <a className="button button-primary" href={voiceLine.href}>
              {voiceLine.display}
            </a>
            {servicePackage ? (
              <a
                className="button button-secondary"
                href={`mailto:${decodeProtectedEmail()}?subject=${encodeURIComponent(
                  servicePackage.title,
                )}`}
              >
                Email to scope this
              </a>
            ) : null}
          </div>
        </header>

        <section
          className="service-page-section"
          aria-labelledby="service-outcomes-heading"
        >
          <h2 id="service-outcomes-heading">Typical outcomes</h2>
          <ul className="service-page-outcomes">
            {track.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </section>

        {servicePackage ? (
          <section
            className="service-page-section"
            aria-labelledby="service-package-heading"
          >
            <h2 id="service-package-heading">The package</h2>
            <div className="service-page-package">
              <div className="package-topline">
                <span>{servicePackage.label}</span>
                <span className="package-cadence">{servicePackage.cadence}</span>
              </div>
              <h3>{servicePackage.title}</h3>
              <p>{servicePackage.description}</p>
              <ul className="service-page-outcomes">
                {servicePackage.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="package-best-for">{servicePackage.bestFor}</p>
            </div>
          </section>
        ) : null}

        <section
          className="service-page-section"
          aria-labelledby="service-process-heading"
        >
          <h2 id="service-process-heading">How an engagement runs</h2>
          <ol className="service-page-process">
            {engagementProcess.map((phase) => (
              <li key={phase.title}>
                <h3>{phase.title}</h3>
                <p>{phase.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="service-page-section"
          aria-labelledby="service-standards-heading"
        >
          <h2 id="service-standards-heading">Measured against</h2>
          <ul
            className="service-page-standards"
            aria-label={`${track.title} reference frameworks`}
          >
            {track.standards.map((standard) => (
              <li key={standard}>{standard}</li>
            ))}
          </ul>
        </section>

        <footer className="service-page-footer">
          <h2>Contact</h2>
          <div className="service-page-actions">
            <a className="button button-primary" href={voiceLine.href}>
              {voiceLine.display}
            </a>
            <a
              className="button button-secondary"
              href={`mailto:${decodeProtectedEmail()}`}
            >
              {decodeProtectedEmail()}
            </a>
          </div>
          <p>
            <Link className="text-link" href="/#faq">
              Questions asked before the first call
            </Link>
          </p>
        </footer>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
