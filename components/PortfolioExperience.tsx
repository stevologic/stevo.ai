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
import {
  engagementModels,
  engagementProcess,
  serviceTracks,
  workingPrinciples,
} from "@/lib/services";
import type { PortfolioProject, ProjectCategory } from "@/lib/project-data";

const filters: Array<"All work" | ProjectCategory> = [
  "All work",
  "Security",
  "AI systems",
  "Product lab",
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
    : project.github.language || project.statusLabel;
  const traffic = project.github.traffic;

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

      <div className="project-visual" aria-hidden="true">
        <div className="project-visual-grid" />
        <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="project-monogram">
          {project.name
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
        <span className="project-signal">{latestSignal}</span>
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
        <span>Updated {formatDate(project.github.pushedAt)}</span>
      </div>

      {traffic && (
        <dl
          className="project-traffic"
          aria-label={`${project.name} GitHub traffic during the last ${traffic.windowDays} days, captured ${formatDate(traffic.fetchedAt)}`}
        >
          <div>
            <dt>GitHub views / {traffic.windowDays}d</dt>
            <dd>
              {formatCompactNumber(traffic.views.count)}
              <small>
                {formatCompactNumber(traffic.views.uniques)} visitors
              </small>
            </dd>
          </div>
          <div>
            <dt>GitHub clones / {traffic.windowDays}d</dt>
            <dd>
              {formatCompactNumber(traffic.clones.count)}
              <small>
                {formatCompactNumber(traffic.clones.uniques)} cloners
              </small>
            </dd>
          </div>
        </dl>
      )}

      <div className="project-links">
        <a href={project.siteUrl} target="_blank" rel="noreferrer">
          Visit live product <Arrow />
        </a>
        <a
          className="project-source"
          href={project.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
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
        <a className="brand" href="#top" aria-label="stevo.ai home">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>stevo.ai</span>
        </a>
        <nav className={mobileOpen ? "nav-links nav-links-open" : "nav-links"}>
          <a href="#services" onClick={() => setMobileOpen(false)}>
            Services
          </a>
          <a href="#work" onClick={() => setMobileOpen(false)}>
            Proof
          </a>
          <a href="#profile" onClick={() => setMobileOpen(false)}>
            Profile
          </a>
          <Link href="/resume/" onClick={() => setMobileOpen(false)}>
            Résumé
          </Link>
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contact">
            Discuss an engagement
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
              <span>Stevo.AI</span>
              <span>vCISO · Cybersecurity · AI enablement</span>
            </p>
            <h1>
              Secure the business.
              <span>Enable what&apos;s next.</span>
            </h1>
            <p className="hero-intro">
              Stevo.AI helps leaders strengthen cybersecurity, govern AI
              adoption, and turn high-consequence technology decisions into
              executable programs and working systems—through vCISO leadership,
              focused advisory, and hands-on delivery.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">
                Discuss an engagement <Arrow />
              </a>
              <a className="button button-secondary" href="#services">
                Explore services
              </a>
            </div>
          </div>

          <aside
            className="hero-console"
            data-reveal
            aria-label="Professional engagement options"
          >
            <div className="console-header">
              <span className="console-kicker">Engagement signal</span>
              <span className="console-live">
                <span className="status-dot" aria-hidden="true" /> Select availability
              </span>
            </div>
            <div className="identity-card">
              <div className="profile-frame">
                <Image
                  src="/stephen-abbott-profile.png"
                  alt="Portrait of Stephen M Abbott"
                  width={311}
                  height={296}
                  sizes="(max-width: 760px) calc(100vw - 72px), (max-width: 1050px) 45vw, 420px"
                  priority
                />
              </div>
              <div className="identity-details">
                <strong>Stephen M Abbott</strong>
                <span>Stevo.AI · Security & AI advisor</span>
                <Link href="/resume/">Professional profile <Arrow /></Link>
              </div>
            </div>
            <div className="activity-list">
              <a href="#services" onClick={() => setActiveService("vciso")}>
                <span>vCISO & security leadership</span>
                <small>Fractional</small>
              </a>
              <a href="#services" onClick={() => setActiveService("enable")}>
                <span>AI enablement & governance</span>
                <small>Advisory</small>
              </a>
              <a href="#services" onClick={() => setActiveService("deliver")}>
                <span>Secure AI & agent delivery</span>
                <small>Hands-on</small>
              </a>
            </div>
            <p className="console-footnote">
              Principal-led engagements · Focused scope · Accountable outcomes
            </p>
          </aside>
        </section>

        <section className="signal-strip" aria-label="Career highlights">
          <div>
            <strong>16</strong>
            <span>Years of IT experience</span>
          </div>
          <div>
            <strong>11</strong>
            <span>Years of cybersecurity experience</span>
          </div>
          <div>
            {/* Derived, so daily project discovery cannot leave a stale count. */}
            <strong>{projects.length}</strong>
            <span>Live products</span>
          </div>
          <div>
            <strong>92%</strong>
            <span>Sensitive-data reduction</span>
          </div>
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
            <p className="section-number">01 / Professional services</p>
            <h2>Security leadership and AI enablement that move with the business.</h2>
            <p>
              Principal-led engagements for leaders who need experienced
              judgment, an executable path, and enough hands-on depth to turn
              strategy into measurable progress.
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
                  <span>{service.number}</span>
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
                  Considering select professional engagements
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
            {engagementModels.map((model, index) => (
              <article key={model.title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{model.title}</h3>
                <p>{model.description}</p>
                <ul
                  className="engagement-deliverables"
                  aria-label={`${model.title} deliverables`}
                >
                  {model.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="engagement-process" data-reveal>
            <div className="engagement-process-heading">
              <span className="detail-label">How an engagement runs</span>
              <h3>
                Baseline the truth, prioritize honestly, operate the cadence,
                then hand it over.
              </h3>
            </div>
            <ol>
              {engagementProcess.map((phase) => (
                <li key={phase.step}>
                  <span className="engagement-step">{phase.step}</span>
                  <h4>{phase.title}</h4>
                  <p>{phase.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="working-principles" data-reveal>
            <span className="detail-label">Working principles</span>
            <div className="working-principles-grid">
              {workingPrinciples.map((principle) => (
                <article key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="section-heading" data-reveal>
            <p className="section-number">02 / Proof of delivery</p>
            <h2>Independent products. Verifiable capability.</h2>
            <p>
              Products and open-source systems built by Stephen M
              Abbott—evidence of the technical depth behind every professional
              engagement.
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
              <ProjectCard project={project} index={index} key={project.repo} />
            ))}
          </div>
        </section>

        <section className="profile-section section" id="profile">
          <div className="profile-photo-wrap" data-reveal>
            <Image
              src="/stephen-abbott-field-notes.webp"
              alt="Stephen Abbott outdoors above a mountain lake"
              width={1717}
              height={1288}
              loading="lazy"
            />
            <span className="photo-caption">Advisor · Engineer · Builder</span>
          </div>
          <div className="profile-copy" data-reveal>
            <p className="section-number">03 / Profile</p>
            <blockquote>Stephen M Abbott.</blockquote>
            <p>
              Stephen leads Stevo.AI with 16 years of experience across
              enterprise technology, security engineering, program leadership,
              and product delivery—including 11 years focused on cybersecurity.
            </p>
            <p>
              His résumé and portfolio show the operating range behind the
              consultancy: executive and board-level risk judgment, leadership
              of multi-team engineering organizations, measurable risk
              reduction at enterprise scale, and the ability to build the
              systems being advised—not merely describe them.
            </p>
            <div className="profile-actions">
              <Link className="text-link" href="/resume/">
                Read Stephen&apos;s résumé <Arrow />
              </Link>
              <a
                className="text-link"
                href="https://github.com/stevologic"
                target="_blank"
                rel="noreferrer"
              >
                Explore the portfolio <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="closing-section section" id="contact">
          <p className="section-number">04 / Professional engagements</p>
          <h2>Let&apos;s start with a conversation.</h2>
          <p>
            Bring Stevo.AI the consequential problem: a security program that
            needs leadership, an AI initiative that needs guardrails and
            traction, or a system that must become both useful and defensible.
          </p>
          <div className="hero-actions">
            <ProtectedEmailButton />
            <Link className="button button-secondary" href="/resume/">
              Review résumé
            </Link>
            <a
              className="button button-secondary"
              href="https://github.com/stevologic"
              target="_blank"
              rel="noreferrer"
            >
              Explore portfolio <Arrow />
            </a>
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
          <span>Stevo.AI</span>
        </div>
        <p>
          vCISO · Cybersecurity consulting · AI enablement
          <a className="footer-security-link" href="/.well-known/security.txt">
            Security disclosure policy
          </a>
        </p>
        <span className="site-footer-legal">
          Led by Stephen M Abbott · © {new Date().getFullYear()}
        </span>
        <SocialHandles label="Stevo.AI social profiles" />
      </footer>
    </div>
  );
}
