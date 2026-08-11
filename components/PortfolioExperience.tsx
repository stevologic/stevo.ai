"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ProtectedEmailButton } from "@/components/ProtectedEmail";
import { socialHandles } from "@/lib/contact";
import { credentialHighlights } from "@/lib/credentials";
import { careerPaths, heroMetrics } from "@/lib/career";
import {
  engagementModels,
  engagementProcess,
  serviceTracks,
} from "@/lib/services";
import type { PortfolioProject, ProjectCategory } from "@/lib/project-data";

const filters: Array<"All work" | ProjectCategory> = [
  "All work",
  "Security",
  "AI systems",
  "Products & ventures",
];


function formatDate(value?: string) {
  if (!value) return "Active now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Active now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SocialHandles({ label }: { label: string }) {
  return (
    <ul className="social-handles" aria-label={label}>
      {socialHandles.map((profile) => (
        <li key={profile.id}>
          <a href={profile.href} target="_blank" rel="me noreferrer">
            <span className="social-network">{profile.network}</span>
            <span className="social-handle">{profile.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const ProjectCard = memo(function ProjectCard({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const latestSignal = project.github.releaseTag
    ? `Release ${project.github.releaseTag}`
    : null;
  const traffic = project.github.traffic;
  const trafficSignals = traffic
    ? [
        {
          label: `GitHub views / ${traffic.windowDays}d`,
          count: traffic.views.count,
          detail: `${formatCompactNumber(traffic.views.uniques)} visitors`,
        },
        {
          label: `GitHub clones / ${traffic.windowDays}d`,
          count: traffic.clones.count,
          detail: `${formatCompactNumber(traffic.clones.uniques)} cloners`,
        },
      ].filter((signal) => signal.count > 0)
    : [];

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--card-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--card-y",
      `${event.clientY - bounds.top}px`,
    );
  }

  return (
    <article
      className={`project-card ${project.featured ? "project-card-featured" : ""}`}
      data-reveal
      data-accent={String((index % 4) + 1)}
      onPointerMove={handlePointerMove}
    >
      <div className="project-card-glow" aria-hidden="true" />
      <div className="project-card-topline">
        <span className="project-category">{project.category}</span>
        <span className="project-status">
          <span className="status-dot" aria-hidden="true" />
          {project.statusLabel}
        </span>
      </div>

      {/* The project's own home-screen presentation: its icon on the theme
          colour its site declares, the way iOS renders an added bookmark. */}
      <div
        className={`project-visual ${project.icon ? "project-visual-branded" : ""}`}
        aria-hidden="true"
        style={
          project.icon?.background
            ? { background: project.icon.background }
            : undefined
        }
      >
        <div className="project-visual-grid" />
        {project.icon ? (
          <span className="project-favicon">
            {/* eslint-disable-next-line @next/next/no-img-element --
                these are fixed 46px marks fetched from each project's own site,
                and the export runs with images.unoptimized, so next/image would
                add markup without optimising anything. */}
            <img src={project.icon.src} alt="" loading="lazy" decoding="async" />
          </span>
        ) : (
          <span className="project-index">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {!project.icon && (
          <span className="project-monogram">
            {project.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </span>
        )}
        {latestSignal ? <span className="project-signal">{latestSignal}</span> : null}
      </div>

      <div className="project-card-copy">
        <h3>{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <p className="project-description">{project.description}</p>
      </div>

      <ul className="project-metrics" aria-label={`${project.name} highlights`}>
        {project.metrics.map((metric) => (
          <li key={metric}>{metric}</li>
        ))}
      </ul>

      <div className="project-meta">
        <span>{project.github.language || project.tech[0]}</span>
        {/* Only projects with a repository have a last-pushed date; without one
            "Updated Active now" is just the fallback leaking through. */}
        {project.github.pushedAt ? (
          <span>Updated {formatDate(project.github.pushedAt)}</span>
        ) : null}
      </div>

      {traffic && trafficSignals.length > 0 ? (
        <dl
          className={
            trafficSignals.length === 1
              ? "project-traffic project-traffic-single"
              : "project-traffic"
          }
          aria-label={`${project.name} GitHub traffic during the last ${traffic.windowDays} days, captured ${formatDate(traffic.fetchedAt)}`}
        >
          {trafficSignals.map((signal) => (
            <div key={signal.label}>
              <dt>{signal.label}</dt>
              <dd>
                {formatCompactNumber(signal.count)}
                <small>{signal.detail}</small>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="project-links">
        <a href={project.siteUrl} target="_blank" rel="noreferrer">
          Visit live product <Arrow />
        </a>
        {project.sourceUrl && (
          <a
            className="project-source"
            href={project.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        )}
      </div>
    </article>
  );
});

export function PortfolioExperience({
  projects,
  syncedAt,
}: {
  projects: PortfolioProject[];
  syncedAt?: string;
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>(
    "All work",
  );
  const [activeService, setActiveService] = useState(serviceTracks[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const visibleProjects =
    activeFilter === "All work"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) =>
      reveal.observe(node),
    );
    return () => reveal.disconnect();
  }, [activeFilter]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const range = document.documentElement.scrollHeight - window.innerHeight;
        const progress = range > 0 ? window.scrollY / range : 0;
        rootRef.current?.style.setProperty(
          "--scroll-progress",
          String(Math.min(1, Math.max(0, progress))),
        );
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    rootRef.current?.style.setProperty("--pointer-x", `${event.clientX}px`);
    rootRef.current?.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  return (
    <div className="site-shell" ref={rootRef} onPointerMove={handlePointerMove}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="pointer-light" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Stephen M Abbott — home">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>Stephen M Abbott</span>
        </a>
        <nav className={mobileOpen ? "nav-links nav-links-open" : "nav-links"}>
          <a href="#services" onClick={() => setMobileOpen(false)}>
            Services
          </a>
          <a href="#profile" onClick={() => setMobileOpen(false)}>
            Executive
          </a>
          <a href="#work" onClick={() => setMobileOpen(false)}>
            Ventures
          </a>
          <Link href="/resume/" onClick={() => setMobileOpen(false)}>
            Résumé
          </Link>
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contact">
            Contact
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core" />
          </div>
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">
              <span>Risk decisions</span>
              <span>AI governance · Product delivery</span>
            </p>
            <h1>
              Secure the enterprise.
              <span>Enable what comes next.</span>
            </h1>
            <p className="hero-intro">
              Cybersecurity and AI executive who turns risk, governance, and
              emerging technology into durable operating capability—from board
              decisions to production systems.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                Discuss an opportunity <Arrow />
              </a>
              <Link className="button button-secondary" href="/resume/">
                View executive résumé
              </Link>
            </div>
          </div>

          <aside
            className="hero-console"
            data-reveal
            aria-label="Career and engagement paths"
          >
            <div className="console-header">
              <span className="console-kicker">Ways to work together</span>
              <span className="console-live">
                <span className="status-dot" aria-hidden="true" /> Open to conversations
              </span>
            </div>
            <div className="identity-card">
              <div className="profile-frame">
                <Image
                  src="/stephen-abbott-field-notes.webp"
                  alt="Stephen Abbott outdoors above a mountain lake"
                  width={1717}
                  height={1288}
                  sizes="(max-width: 760px) calc(100vw - 72px), (max-width: 1050px) 45vw, 420px"
                  priority
                />
              </div>
              <div className="identity-details">
                <strong>Stephen M Abbott</strong>
                <span>Cybersecurity &amp; AI executive</span>
              </div>
            </div>
            <div className="activity-list">
              {careerPaths.map((path) => (
                <a key={path.title} href={path.href}>
                  <span>{path.title}</span>
                  <small>{path.label}</small>
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="signal-strip" aria-label="Career highlights">
          {heroMetrics.map((metric) => (
            <div key={metric.label}>
              <strong className={metric.value.length > 3 ? "signal-strip-text" : undefined}>
                {metric.value}
              </strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </section>

        <section className="credential-strip" aria-label="Credentials">
          <p className="detail-label">Credentials</p>
          <ul>
            {credentialHighlights.map((credential) => (
              <li key={credential}>{credential}</li>
            ))}
          </ul>
        </section>

        <section className="services-section section" id="services">
          <div className="section-heading section-heading-light" data-reveal>
            <p className="section-number">Advisory services</p>
            <h2>Cybersecurity and AI leadership for the AI-native enterprise.</h2>
            <p>
              For organizations facing a consequential decision, program reset,
              or capability gap: clear priorities, defensible controls, and an
              operating model the internal team can own.
            </p>
          </div>

          <div className="service-workbench" data-reveal>
            <div className="service-tabs" aria-label="Service areas">
              {serviceTracks.map((service) => (
                <button
                  type="button"
                  aria-controls={`service-detail-${service.id}`}
                  aria-pressed={activeService === service.id}
                  className={activeService === service.id ? "is-active" : ""}
                  key={service.id}
                  onClick={() => setActiveService(service.id)}
                >
                  {service.label}
                </button>
              ))}
            </div>
            {/* Every panel stays in the document and inactive ones are hidden,
                so all four service descriptions and their reference frameworks
                are reachable without JavaScript and visible to crawlers. */}
            {serviceTracks.map((service) => (
              <article
                className="service-detail"
                id={`service-detail-${service.id}`}
                key={service.id}
                hidden={activeService !== service.id}
              >
                <p className="service-signal">
                  <span className="status-dot" aria-hidden="true" />
                  {service.mode}
                </p>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-detail-grid">
                  <div>
                    <span className="detail-label">Typical outcomes</span>
                    <ul>
                      {service.outcomes.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="best-for">
                    <span className="detail-label">Best for</span>
                    <p>{service.bestFor}</p>
                  </div>
                </div>
                <div className="service-standards">
                  <span className="detail-label">Measured against</span>
                  <ul aria-label={`${service.title} reference frameworks`}>
                    {service.standards.map((standard) => (
                      <li key={standard}>{standard}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div
            className="operating-model"
            id="engagements"
            aria-label="Professional engagement models"
          >
            {engagementModels.map((model) => (
              <article key={model.title} data-reveal>
                <span>{model.label}</span>
                <h3>{model.title}</h3>
                <p>{model.description}</p>
              </article>
            ))}
          </div>

          <div className="engagement-process" data-reveal>
            <div className="engagement-process-heading">
              <span className="detail-label">How an engagement runs</span>
              <h3>A clear path from evidence to internal ownership.</h3>
            </div>
            <ol>
              {engagementProcess.map((phase) => (
                <li key={phase.title}>
                  <h4>{phase.title}</h4>
                  <p>{phase.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="engagement-safeguards" data-reveal>
            <span className="detail-label">Professional safeguards</span>
            <p>
              Confidential by default, with transparent assumptions and source
              evidence attached to every recommendation.
            </p>
          </div>
        </section>

        <section className="profile-section section" id="profile">
          <div className="profile-photo-wrap" data-reveal>
            <Image
              src="/stephen-abbott-profile.png"
              alt="Portrait of Stephen M Abbott"
              width={311}
              height={296}
              loading="lazy"
            />
          </div>
          <div className="profile-copy" data-reveal>
            <p className="section-number">Executive record</p>
            <h2>Enterprise judgment. Measurable outcomes. Technical depth.</h2>
            <p>
              Across enterprise cybersecurity roles, Stephen led organizations
              of up to 26 engineers, cut sensitive-data findings by 92% while
              tripling detection coverage, reduced open-source dependencies by
              more than 75%, and sustained 99.99% availability for critical
              transaction platforms.
            </p>
            <p>
              His scope spans board-facing risk measures, CTEM, application and
              software supply-chain security, security data platforms,
              resilience, and governed AI—supported by hands-on product and
              engineering work.
            </p>
            <div className="profile-actions">
              <Link className="text-link" href="/resume/">
                Read the full career record <Arrow />
              </Link>
            </div>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="section-heading" data-reveal>
            <p className="section-number">Founder portfolio</p>
            <h2>Products built from idea to operating reality.</h2>
            <p>
              Each project below is tied to a live product, public repository,
              or operating storefront. Together they demonstrate secure
              engineering, AI orchestration, automation, commerce, and
              customer-facing delivery.
            </p>
          </div>

          <div className="project-toolbar" data-reveal>
            <div className="project-filters" aria-label="Filter projects">
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={activeFilter === filter ? "is-active" : ""}
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span>
              {visibleProjects.length} projects · refreshed {formatDate(syncedAt)}
            </span>
          </div>

          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <ProjectCard project={project} index={index} key={project.slug} />
            ))}
          </div>
        </section>

        <section className="closing-section section" id="contact">
          <p className="section-number">Contact</p>
          <h2>Start the right conversation.</h2>
          <p>
            Share the role, mandate, or product challenge; Stephen will reply
            directly.
          </p>
          <div className="hero-actions">
            <ProtectedEmailButton label="Email Stephen" />
          </div>

          <div className="closing-connect">
            <p className="detail-label">Elsewhere</p>
            <SocialHandles label="Social profiles and channels" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>Stephen M Abbott</span>
        </div>
        <p>
          <a className="footer-security-link" href="/.well-known/security.txt">
            Security disclosure policy
          </a>
        </p>
        <span className="site-footer-legal">
          © {new Date().getFullYear()} Stephen M Abbott
        </span>
      </footer>
    </div>
  );
}
