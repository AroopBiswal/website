"use client";

import { CSSProperties } from "react";
import type { Job, Project, WorkData } from "@/lib/notion";
import { Eye, LINKS, ScrollCue, SiteChrome, SiteNav, useGooglyEyes, useScrollSpy } from "./shell";

/**
 * The home page is one continuous scroll: Home → Work → Projects → Contact.
 * (About lives on its own page, /about.) The nav is fixed and highlights
 * whichever section is under the reading line.
 */
const SECTIONS = ["home", "work", "projects", "contact"] as const;

export default function Site({ work, projects }: { work: WorkData; projects: Project[] }) {
  useGooglyEyes();
  const active = useScrollSpy(SECTIONS);

  return (
    <div className="site-root">
      <SiteChrome />
      <SiteNav active={active} page="home" />

      <main className="site-content">
        <HomeSection />
        <WorkSection featured={work.featured} jobs={work.jobs} />
        <ProjectsSection projects={projects} />
        <ContactSection />
      </main>
    </div>
  );
}

/* ============ HOME ============ */

function HomeSection() {
  // Everything in the hero name is sized in em so it scales as one unit with the
  // clamp()ed font-size; colors come from --hero-fill/--hero-stroke for dark mode.
  const outline = (stroke: string): CSSProperties => ({
    color: "var(--hero-fill)",
    WebkitTextStroke: `${stroke} var(--hero-stroke)`,
    paintOrder: "stroke fill",
  });

  return (
    <section id="home" className="section section-home">
      {/* Floating blob friends */}
      <div className="float-deco" style={{ position: "absolute", top: "12%", left: "3%", ["--rot" as string]: "-10deg", animation: "floaty 5.5s ease-in-out infinite" }}>
        <div style={{ width: 118, height: 118, background: "#E5372A", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 11 }}>
            <Eye size={34} pupil={16} />
            <Eye size={34} pupil={16} />
          </div>
          <div style={{ position: "absolute", top: 74, left: "50%", transform: "translateX(-50%)", width: 24, height: 18, background: "#F5821F", border: "3px solid #151310", borderRadius: "50%" }} />
        </div>
      </div>
      <div className="float-deco" style={{ position: "absolute", bottom: "16%", left: "7%", ["--rot" as string]: "9deg", animation: "floatyB 4.6s ease-in-out infinite" }}>
        <div style={{ width: 100, height: 100, background: "#6FB92C", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 9 }}>
            <Eye size={30} pupil={14} />
            <Eye size={30} pupil={14} />
          </div>
        </div>
      </div>
      <span className="float-deco" style={{ position: "absolute", top: "18%", right: "5%", width: 54, height: 54, background: "#FFC93C", border: "4px solid #151310", borderRadius: "50%", animation: "floaty 6s ease-in-out infinite" }} />
      <span className="float-deco" style={{ position: "absolute", bottom: "20%", right: "9%", width: 38, height: 38, background: "#2E4BD8", border: "4px solid #151310", borderRadius: 9, ["--rot" as string]: "14deg", transform: "rotate(14deg)", animation: "floatyB 5s ease-in-out infinite" }} />
      <div className="float-deco" style={{ position: "absolute", top: "46%", right: "3%", ["--rot" as string]: "-6deg", animation: "floaty 5.2s ease-in-out infinite" }}>
        <div style={{ width: 108, height: 108, background: "#2E4BD8", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 11 }}>
            <Eye size={32} pupil={15} />
            <Eye size={32} pupil={15} />
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, maxWidth: 660, margin: "0 auto" }}>
        <h1
          className="fredoka"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "clamp(30px, 10.5vw, 76px)", lineHeight: 0.98, margin: 0, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}
        >
          <span style={{ ...outline("0.132em"), position: "relative", display: "inline-block" }}>
            A
            <span style={{ position: "absolute", left: "50%", bottom: "0.37em", transform: "translateX(-50%)", width: "0.36em", height: "0.26em", background: "var(--hero-fill)", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}>
              <span style={{ position: "absolute", left: "0.185em", top: "0.09em", transform: "translateX(-50%)", width: "0.21em", height: "0.16em", background: "var(--hero-stroke)", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
            </span>
          </span>
          <span style={outline("0.145em")}>r</span>
          <Eye size="0.68em" pupil="0.2em" border="0.066em" style={{ boxShadow: "2px 2px 0 var(--shadow)", margin: "0 -0.04em", top: "0.12em" }} />
          <Eye size="0.68em" pupil="0.2em" border="0.066em" style={{ boxShadow: "2px 2px 0 var(--shadow)", margin: "0 -0.04em", top: "0.12em" }} />
          <span style={outline("0.145em")}>p&nbsp;Biswal</span>
        </h1>

        <p style={{ margin: 0, fontSize: 20, lineHeight: 1.5, color: "var(--muted)", maxWidth: 460 }}>
          Software engineer at Google, based in San Francisco.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", paddingTop: 2 }}>
          <a className="sticker" href="#work" style={{ color: "#fff", background: "#2E4BD8" }}>
            See my work
          </a>
          <a className="sticker" href="#contact" style={{ color: "var(--ink)", background: "var(--panel)", borderColor: "var(--line)", ["--tilt" as string]: "2deg" }}>
            Say hi
          </a>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <a className="chip-btn" href="#projects" style={{ color: "#151310", background: "#FFC93C" }}>
            My Projects
          </a>
          <a className="chip-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer" style={{ color: "#151310", background: "#6FB92C", ["--tilt" as string]: "2deg" }}>
            LinkedIn
          </a>
          <a className="chip-btn" href="/about" style={{ color: "#fff", background: "#E5372A" }}>
            About Me
          </a>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}

/* ============ WORK ============ */

function WorkSection({ featured, jobs }: { featured: Job; jobs: Job[] }) {
  return (
    <section id="work" className="section">
      <div className="panel-head">
        <span className="panel-label">Experience — 01</span>
        <h2 className="panel-title">What I do</h2>
      </div>

      <div className="work-grid">
        <div className="card" style={{ gridColumn: "1 / -1", padding: "32px 34px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <h3 style={{ fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: "-0.3px" }}>{featured.company}</h3>
              <span style={{ fontWeight: 500, fontSize: 14, color: "var(--muted)" }}>{featured.role}</span>
            </div>
            <span className="period-pill">{featured.period}</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.45, margin: 0, color: "var(--muted)" }}>{featured.blurb}</p>
        </div>

        {jobs.map((job) => (
          <div key={job.company} className="card work-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18, margin: 0, letterSpacing: "-0.2px" }}>{job.company}</h3>
                <span style={{ fontWeight: 500, fontSize: 13, color: "var(--muted)" }}>{job.role}</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{job.period}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--muted)", margin: 0 }}>{job.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ PROJECTS ============ */

function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="section">
      <div className="panel-head">
        <span className="panel-label">Selected work — 02</span>
        <h2 className="panel-title">Things I&apos;ve made</h2>
      </div>

      <div className="project-list inter">
        {projects.map((p) => {
          const inner = (
            <>
              <span style={{ fontWeight: 500, fontSize: 14, color: "var(--muted)", letterSpacing: 1 }}>{p.num}</span>
              <h3 style={{ fontWeight: 600, fontSize: "clamp(22px, 3vw, 30px)", margin: 0, color: "var(--ink)", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)", margin: 0 }}>{p.desc}</p>
              <div className="proj-tags" style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                {p.tags.map((tag, i) => (
                  <span key={tag} style={{ display: "inline-flex", gap: 6 }}>
                    {i > 0 && <span style={{ color: "var(--muted)", fontSize: 11 }}>/</span>}
                    <span style={{ fontWeight: 500, fontSize: 11, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--muted)" }}>{tag}</span>
                  </span>
                ))}
              </div>
            </>
          );
          return p.href ? (
            <a key={p.num} className="project-row" href={p.href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <div key={p.num} className="project-row">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============ CONTACT ============ */

function ContactSection() {
  const linkStyle = (bg: string, tilt = "-2deg"): CSSProperties => ({
    fontFamily: "var(--font-inter)",
    fontWeight: 600,
    fontSize: 16,
    color: "#151310",
    background: bg,
    border: "3px solid #151310",
    borderRadius: 999,
    padding: "12px 24px",
    boxShadow: "5px 5px 0 var(--shadow)",
    ["--tilt" as string]: tilt,
  });

  return (
    <section id="contact" className="section">
      <div className="contact-card">
        <span className="float-deco" style={{ position: "absolute", top: 22, left: 30, width: 40, height: 40, background: "#FFC93C", border: "4px solid #151310", borderRadius: "50%", animation: "floaty 5s ease-in-out infinite" }} />
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 28 }}>
          <Eye size={58} pupil={27} border={5} style={{ boxShadow: "4px 4px 0 var(--shadow)" }} />
          <Eye size={58} pupil={27} border={5} style={{ boxShadow: "4px 4px 0 var(--shadow)" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          <a className="sticker" href={LINKS.email} style={linkStyle("#FFC93C")}>
            Email
          </a>
          <a className="sticker" href={LINKS.github} target="_blank" rel="noreferrer" style={linkStyle("#fff", "2deg")}>
            GitHub
          </a>
          <a className="sticker" href={LINKS.linkedin} target="_blank" rel="noreferrer" style={linkStyle("#fff")}>
            LinkedIn
          </a>
          <a className="sticker" href={LINKS.resume} target="_blank" rel="noreferrer" style={linkStyle("#fff", "2deg")}>
            Résumé
          </a>
        </div>
      </div>
    </section>
  );
}
