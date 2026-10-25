"use client";

import Image from "next/image";
import DocumentLink from "@/components/DocumentLink";
import { decodeSiteEmail } from "@/lib/site-email";
import {
  memo,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SupportCreativity } from "@/components/SupportCreativity";
import {
  scheduling,
  socialHandles,
  voiceLine,
} from "@/lib/contact";
import { credentialHighlights } from "@/lib/credentials";
import { careerPaths, heroMetrics } from "@/lib/career";
import { practice } from "@/lib/practice";
import type { PortfolioProject, ProjectCategory } from "@/lib/project-data";
import { qualitativeHighlights } from "@/lib/project-metrics";

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
  const highlights = qualitativeHighlights(project.metrics);
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
        className={[
          "project-visual",
          project.icon ? "project-visual-branded" : "",
          project.preview ? "project-visual-preview" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
        style={
          project.icon?.background
            ? { background: project.icon.background }
            : undefined
        }
      >
        {project.preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, images.unoptimized
          <img
            className="project-preview"
            src={project.preview.src}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
        {project.preview ? <div className="project-visual-overlay" /> : null}
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

      {highlights.length > 0 ? (
        <ul className="project-metrics" aria-label={`${project.name} highlights`}>
          {highlights.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
      ) : null}

      <div className="project-meta">
        <span>{project.github.language || project.tech[0]}</span>
        {/* Only projects with a repository have a last-pushed date; without one
            "Updated Active now" is just the fallback leaking through. */}
        {project.github.pushedAt ? (
          <span>Updated {formatDate(project.github.pushedAt)}</span>
        ) : null}
      </div>

      <div className="project-links">
        <a href={project.siteUrl} target="_blank" rel="noreferrer">
          Visit live product <Arrow />
        </a>
        {project.extraLinks?.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <Arrow />
          </a>
        ))}
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
          <a href="#profile" onClick={() => setMobileOpen(false)}>
            Background
          </a>
          <a href="#work" onClick={() => setMobileOpen(false)}>
            Portfolio
          </a>
          <DocumentLink href="/resume/" onClick={() => setMobileOpen(false)}>
            Résumé
          </DocumentLink>
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
              <span>{practice.headline}</span>
              <span>Cybersecurity · AI · Projects</span>
            </p>
            <h1 className="visually-hidden">Stephen M Abbott</h1>
            <p className="hero-intro">
              My online business card and résumé. Cybersecurity and AI are
              the day job; the projects below are the fun stuff.
            </p>
            <div className="hero-actions">
              <DocumentLink className="button button-primary" href="/resume/">
                Read my résumé <Arrow />
              </DocumentLink>
              <a className="button button-secondary" href="#work">
                Explore my projects <Arrow />
              </a>
              {/* Renders the moment lib/contact.ts publishes a booking URL. */}
              {scheduling.href ? (
                <a className="button button-secondary" href={scheduling.href}>
                  {scheduling.label} <Arrow />
                </a>
              ) : null}
            </div>
          </div>

          <aside
            className="hero-console"
            data-reveal
            aria-label="About Stephen"
          >
            <div className="console-header">
              <span className="console-kicker">About me</span>
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
                <strong>{practice.name}</strong>
                <span>{practice.role}</span>
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

        <SupportCreativity />

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

        <section className="profile-section section" id="profile">
          <div className="profile-copy" data-reveal>
            <p className="section-number">Background</p>
            <p>
              Across enterprise cybersecurity roles, Stephen led organizations
              of up to 26 engineers, cut sensitive-data findings by 92% while
              tripling detection coverage, reduced open-source dependencies by
              more than 75%, and sustained 99.99% availability for critical
              transaction platforms.
            </p>
            <p>
              He owns Wire Hold.
            </p>
            <p>
              Board-facing risk, application and software supply-chain
              security, security data platforms, resilience, and governed AI,
              with hands-on product and engineering work.
            </p>
            <div className="profile-actions">
              <DocumentLink className="text-link" href="/resume/">
                Read the full career record <Arrow />
              </DocumentLink>
            </div>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="section-heading" data-reveal>
            <p className="section-number">Portfolio</p>
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
          <h2>Contact</h2>
          <div className="hero-actions">
            <a className="button button-primary" href={voiceLine.href}>
              {voiceLine.display}
            </a>
            <a
              className="button button-secondary"
              href={`mailto:${decodeSiteEmail()}`}
            >
              {decodeSiteEmail()}
            </a>
            {/* Renders the moment lib/contact.ts publishes a booking URL. */}
            {scheduling.href ? (
              <a className="button button-secondary" href={scheduling.href}>
                {scheduling.label}
              </a>
            ) : null}
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
