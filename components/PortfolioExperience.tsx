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
import type { PortfolioProject, ProjectCategory } from "@/lib/project-data";

const filters: Array<"All work" | ProjectCategory> = [
  "All work",
  "Security",
  "AI systems",
  "Product lab",
];

const serviceTracks = [
  {
    id: "govern",
    number: "01",
    label: "Govern",
    title: "AI security & operating models",
    description:
      "Move from AI experimentation to a defensible program with explicit boundaries, human authority, evidence, and rollback built into the way work gets done.",
    outcomes: [
      "AI risk and control architecture",
      "Human-in-the-loop approval design",
      "Agent governance and auditability",
      "Practical adoption roadmaps",
    ],
    bestFor: "Leaders introducing agents into high-consequence workflows.",
  },
  {
    id: "build",
    number: "02",
    label: "Build",
    title: "Agent systems & applied AI products",
    description:
      "Design and ship useful AI systems—not demos—with scoped context, durable memory, tool orchestration, local-first options, and production-grade product thinking.",
    outcomes: [
      "MCP servers and agent toolchains",
      "Multi-provider AI applications",
      "Workflow automation and integrations",
      "Rapid product prototyping",
    ],
    bestFor: "Teams that need a working system, not another slide deck.",
  },
  {
    id: "assure",
    number: "03",
    label: "Assure",
    title: "Application & supply-chain security",
    description:
      "Turn dependency, vulnerability, and architecture signals into prioritized engineering action that can be verified, repeated, and explained.",
    outcomes: [
      "Dependency and attack-surface analysis",
      "CVE remediation workflows",
      "SBOM, license, and OSS risk review",
      "Evidence-driven security automation",
    ],
    bestFor: "Engineering organizations that want security to accelerate delivery.",
  },
  {
    id: "advise",
    number: "04",
    label: "Advise",
    title: "Technical strategy & product advisory",
    description:
      "Clarify a difficult technology decision, pressure-test the plan, and leave with an executable path that aligns product ambition, engineering reality, and security risk.",
    outcomes: [
      "Architecture and build-vs-buy decisions",
      "Technical product positioning",
      "Security-first modernization plans",
      "Hands-on executive working sessions",
    ],
    bestFor: "Founders and technical leaders at an inflection point.",
  },
] as const;

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

const protectedMailbox = [
  100, 99, 114, 103, 127, 114, 121, 118, 117, 117, 120, 99, 99, 37, 39,
];
const protectedHost = [87, 112, 122, 118, 126, 123, 57, 116, 120, 122];
const emailMask = 23;

function decodeProtectedEmail() {
  return [...protectedMailbox, ...protectedHost]
    .map((value) => String.fromCharCode(value ^ emailMask))
    .join("");
}

function ProtectedEmail() {
  const [email, setEmail] = useState<string>();
  const emailLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (email) emailLinkRef.current?.focus();
  }, [email]);

  if (email) {
    return (
      <a
        className="button button-secondary protected-email-link"
        href={`mailto:${email}`}
        ref={emailLinkRef}
      >
        {email} <Arrow />
      </a>
    );
  }

  return (
    <button
      className="button button-secondary protected-email-trigger"
      type="button"
      onClick={() => setEmail(decodeProtectedEmail())}
    >
      Reveal email
    </button>
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
  const [activeService, setActiveService] = useState<
    (typeof serviceTracks)[number]["id"]
  >(serviceTracks[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const visibleProjects =
    activeFilter === "All work"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const currentService =
    serviceTracks.find((service) => service.id === activeService) ||
    serviceTracks[0];

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
          <a href="#work" onClick={() => setMobileOpen(false)}>
            Work
          </a>
          <a href="#services" onClick={() => setMobileOpen(false)}>
            Services
          </a>
          <a href="#profile" onClick={() => setMobileOpen(false)}>
            Profile
          </a>
          <Link href="/resume/" onClick={() => setMobileOpen(false)}>
            Résumé
          </Link>
        </nav>
        <div className="header-actions">
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
              <span>Stephen M Abbott</span>
              <span>Applied AI + Cybersecurity</span>
            </p>
            <h1>
              Build what&apos;s next.
              <span>Secure what matters.</span>
            </h1>
            <p className="hero-intro">
              I design human-governed AI systems, open security infrastructure,
              and polished products that turn difficult technology into useful,
              defensible outcomes.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                Explore selected work <Arrow />
              </a>
              <a className="button button-secondary" href="#services">
                View services
              </a>
            </div>
          </div>

          <aside className="hero-console" data-reveal aria-label="Current activity">
            <div className="console-header">
              <span className="console-kicker">Builder signal</span>
              <span className="console-live">
                <span className="status-dot" aria-hidden="true" /> Live
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
                <span>Hands-on AI & security builder</span>
                <a
                  href="https://github.com/stevologic"
                  target="_blank"
                  rel="noreferrer"
                >
                  @stevologic <Arrow />
                </a>
              </div>
            </div>
            <div className="activity-list">
              {projects.slice(0, 3).map((project) => (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  key={project.repo}
                >
                  <span>{project.name}</span>
                  <small>{formatDate(project.github.pushedAt)}</small>
                </a>
              ))}
            </div>
            <p className="console-footnote">
              Portfolio data refreshed {formatDate(syncedAt)}
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
            <strong>8</strong>
            <span>Live products</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Professional certifications</span>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="section-heading" data-reveal>
            <p className="section-number">01 / Selected work</p>
            <h2>Proof lives in the product.</h2>
            <p>
              A working portfolio across AI agents, cybersecurity, developer
              infrastructure, desktop automation, and independent product
              experiments.
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
            <span>{visibleProjects.length} projects</span>
          </div>

          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <ProjectCard project={project} index={index} key={project.repo} />
            ))}
          </div>
        </section>

        <section className="services-section section" id="services">
          <div className="section-heading section-heading-light" data-reveal>
            <p className="section-number">02 / Services</p>
            <h2>Strategy with fingerprints on it.</h2>
            <p>
              Senior-level thinking paired with enough hands-on depth to move
              from ambiguity to architecture, working software, and verifiable
              results.
            </p>
          </div>

          <div className="service-workbench" data-reveal>
            <div className="service-tabs" aria-label="Service areas">
              {serviceTracks.map((service) => (
                <button
                  type="button"
                  aria-controls="service-detail"
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
            <article
              className="service-detail"
              id="service-detail"
              aria-live="polite"
            >
              <p className="service-signal">
                <span className="status-dot" aria-hidden="true" />
                Available for focused engagements
              </p>
              <h3>{currentService.title}</h3>
              <p>{currentService.description}</p>
              <div className="service-detail-grid">
                <div>
                  <span className="detail-label">Typical outcomes</span>
                  <ul>
                    {currentService.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div className="best-for">
                  <span className="detail-label">Best for</span>
                  <p>{currentService.bestFor}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="operating-model">
            {[
              ["Frame", "Define the real decision, boundaries, and success evidence."],
              ["Build", "Create the smallest complete system that proves the path."],
              ["Prove", "Test the controls, document the result, and transfer capability."],
            ].map(([title, description], index) => (
              <article key={title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-section section" id="profile">
          <div className="profile-photo-wrap" data-reveal>
            <Image
              src="/stephen-abbott-field-notes.png"
              alt="Stephen Abbott outdoors above a mountain lake"
              width={1717}
              height={1288}
              loading="lazy"
            />
            <span className="photo-caption">Outside the interface</span>
          </div>
          <div className="profile-copy" data-reveal>
            <p className="section-number">03 / Profile</p>
            <blockquote>“Curious enough to try it.”</blockquote>
            <p>
              That line has lived on my GitHub profile for years because it is
              the shortest explanation of how I work. I move comfortably
              between strategy and implementation, follow hard questions into
              the details, and prefer a working artifact over an abstract claim.
            </p>
            <p>
              The common thread across my work is governed capability: powerful
              systems that stay understandable, observable, and answerable to
              the people who use them.
            </p>
            <div className="profile-actions">
              <Link className="text-link" href="/resume/">
                Read professional profile <Arrow />
              </Link>
              <a
                className="text-link"
                href="https://github.com/stevologic"
                target="_blank"
                rel="noreferrer"
              >
                Explore GitHub <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="closing-section section">
          <p className="section-number">04 / Start somewhere useful</p>
          <h2>Have a consequential system to design?</h2>
          <p>
            Bring the hard problem: a risky AI workflow, a security program that
            needs traction, or a product idea that deserves to become real.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="https://github.com/stevologic"
              target="_blank"
              rel="noreferrer"
            >
              Start on GitHub <Arrow />
            </a>
            <Link className="button button-secondary" href="/resume/">
              View profile
            </Link>
            <ProtectedEmail />
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
        <p>AI systems · Cybersecurity · Product engineering</p>
        <span>© {new Date().getFullYear()} stevo.ai</span>
      </footer>
    </div>
  );
}
