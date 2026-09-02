"use client";

import Image from "next/image";
import { CSSProperties, ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Job, Project, WorkData } from "@/lib/notion";

const TABS = ["home", "work", "projects", "about", "contact"] as const;
type Tab = (typeof TABS)[number];

const LINKS = {
  email: "mailto:aroopbiswal@gmail.com",
  github: "https://github.com/AroopBiswal",
  trading: "https://aroopbiswal.com/trading",
  linkedin: "https://linkedin.com/in/AroopBiswal/",
  resume: "/resume.pdf",
};

const INTERESTS: { label: string; bg: string; fg?: string }[] = [
  { label: "Travel", bg: "#F97316" },
  { label: "Basketball", bg: "#F59E0B" },
  { label: "Snowboarding", bg: "#3B82F6", fg: "#fff" },
  { label: "Hike (if it's not too hot outside)", bg: "#10B981" },
  { label: "Chess", bg: "#F43F5E", fg: "#fff" },
  { label: "EDM", bg: "#F97316" },
  { label: "Try new food", bg: "#F59E0B" },
  { label: "Be Spontaneous", bg: "#3B82F6", fg: "#fff" },
  { label: "Cook", bg: "#10B981" },
  { label: "Weightlift", bg: "#F43F5E", fg: "#fff" },
  { label: "Run", bg: "#F97316" },
];

const PHOTOS = [
  { src: "/photos/photo2.jpg", alt: "Snapshot 1", pos: "50% 90%" },
  { src: "/photos/photo3.jpg", alt: "Snapshot 2", pos: "50% 50%" },
  { src: "/photos/photo1.jpg", alt: "Snapshot 3", pos: "50% 50%" },
];

const GLANCE = [
  "SWE @ Google (Google Cloud)",
  "UC Davis class of 2024",
  "I love quality time with my friends",
  "I live in SF (my dream city!)",
];

function Eye({
  size,
  pupil,
  border = 3,
  style,
}: {
  size: number | string;
  pupil: number | string;
  border?: number | string;
  style?: CSSProperties;
}) {
  return (
    <span className="eye" style={{ width: size, height: size, borderWidth: border, ...style }}>
      <span className="pupil" style={{ width: pupil, height: pupil }} />
    </span>
  );
}

/**
 * The theme lives on `html[data-theme]`, written pre-paint by the init script in
 * layout.tsx. Reading it through useSyncExternalStore keeps the server render
 * ("light") and the client in step without a setState-in-effect.
 */
function useTheme() {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("themechange", onChange);
      return () => window.removeEventListener("themechange", onChange);
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("site-theme", next);
    } catch {}
    window.dispatchEvent(new Event("themechange"));
  };

  return [theme, toggle] as const;
}

function NavBtn({
  t,
  tab,
  go,
  children,
}: {
  t: Tab;
  tab: Tab;
  go: (t: Tab) => void;
  children: ReactNode;
}) {
  return (
    <button className={`navbtn${tab === t ? " active" : ""}`} onClick={() => go(t)}>
      {children}
    </button>
  );
}

export default function Site({ work, projects }: { work: WorkData; projects: Project[] }) {
  const [tab, setTab] = useState<Tab>("home");
  const [theme, toggleTheme] = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  /** About is a panel you switch to; everything else is a scroll target. */
  const goTo = (t: Tab, behavior: ScrollBehavior = "smooth") => {
    setTab(t);
    if (t !== "about") {
      const sv = scrollRef.current;
      const sec = sv?.querySelector<HTMLElement>(`[data-section="${t}"]`);
      if (sv && sec) sv.scrollTo({ top: sec.offsetTop, behavior });
    }
  };

  // Sync tab with URL hash so /#work etc. deep-link into the page.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if ((TABS as readonly string[]).includes(h)) goTo(h as Tab, "auto");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Scroll spy: whichever section has passed the halfway mark owns the nav.
  useEffect(() => {
    const sv = scrollRef.current;
    if (!sv || tab === "about") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current: Tab = "home";
      sv.querySelectorAll<HTMLElement>("[data-section]").forEach((sec) => {
        if (sv.scrollTop >= sec.offsetTop - sv.clientHeight / 2) {
          current = sec.dataset.section as Tab;
        }
      });
      setTab((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    sv.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sv.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tab]);

  // One global listener drives every googly eye on the page.
  useEffect(() => {
    let raf = 0;
    let mx: number | null = null;
    let my: number | null = null;
    const update = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>(".pupil").forEach((p) => {
        const r = p.parentElement!.getBoundingClientRect();
        if (!r.width) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (mx ?? cx) - cx;
        const dy = (my ?? cy) - cy;
        const a = Math.atan2(dy, dx);
        const dist = Math.min(r.width * 0.22, Math.hypot(dx, dy) / 5);
        p.style.transform = `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px)`;
      });
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tab]);

  const go = (t: Tab) => {
    goTo(t);
    history.replaceState(null, "", t === "home" ? window.location.pathname : `#${t}`);
  };

  return (
    <div className="site-root">
      <div className="site-rule" />

      <header className="site-header">
      <nav className="site-nav">
        <NavBtn tab={tab} go={go} t="home">Home</NavBtn>
        <NavBtn tab={tab} go={go} t="work">Work</NavBtn>
        <NavBtn tab={tab} go={go} t="projects">Projects</NavBtn>
        <NavBtn tab={tab} go={go} t="contact">Contact</NavBtn>
      </nav>

      <nav className="site-nav site-nav-right">
        <a className="navbtn" href={LINKS.trading} target="_blank" rel="noreferrer">
          Trading
        </a>
        <NavBtn tab={tab} go={go} t="about">About Me</NavBtn>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </nav>
      </header>

      <div className="site-content">
        {/* Home, Work, Projects and Contact are one continuous scroll. */}
        <div ref={scrollRef} className="scroll-view no-scrollbar" style={{ display: tab === "about" ? "none" : "block" }}>
          <HomePanel go={go} />
          <WorkPanel featured={work.featured} jobs={work.jobs} />
          <ProjectsPanel projects={projects} />
          <ContactPanel />
        </div>
        {tab === "about" && <AboutPanel />}
      </div>
    </div>
  );
}

/* ============ HOME ============ */

function HomePanel({ go }: { go: (t: Tab) => void }) {
  // Everything in the hero name is sized in em so it scales as one unit with the
  // clamp()ed font-size; colors come from --hero-fill/--hero-stroke for dark mode.
  const outline = (stroke: string): CSSProperties => ({
    color: "var(--hero-fill)",
    WebkitTextStroke: `${stroke} var(--hero-stroke)`,
    paintOrder: "stroke fill",
  });

  return (
    <div data-section="home" className="section section-centered">
      {/* Floating blob friends */}
      <div className="float-deco" style={{ position: "absolute", top: "6%", left: "5%", ["--rot" as string]: "-10deg", animation: "floaty 5.5s ease-in-out infinite" }}>
        <div style={{ width: 118, height: 118, background: "#E5372A", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 11 }}>
            <Eye size={34} pupil={16} />
            <Eye size={34} pupil={16} />
          </div>
          <div style={{ position: "absolute", top: 74, left: "50%", transform: "translateX(-50%)", width: 24, height: 18, background: "#F5821F", border: "3px solid #151310", borderRadius: "50%" }} />
        </div>
      </div>
      <div className="float-deco" style={{ position: "absolute", bottom: "8%", left: "9%", ["--rot" as string]: "9deg", animation: "floatyB 4.6s ease-in-out infinite" }}>
        <div style={{ width: 100, height: 100, background: "#6FB92C", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 9 }}>
            <Eye size={30} pupil={14} />
            <Eye size={30} pupil={14} />
          </div>
        </div>
      </div>
      <span className="float-deco" style={{ position: "absolute", top: "12%", right: "7%", width: 54, height: 54, background: "#FFC93C", border: "4px solid #151310", borderRadius: "50%", animation: "floaty 6s ease-in-out infinite" }} />
      <span className="float-deco" style={{ position: "absolute", bottom: "14%", right: "11%", width: 38, height: 38, background: "#2E4BD8", border: "4px solid #151310", borderRadius: 9, ["--rot" as string]: "14deg", transform: "rotate(14deg)", animation: "floatyB 5s ease-in-out infinite" }} />
      <div className="float-deco" style={{ position: "absolute", top: "42%", right: "5%", ["--rot" as string]: "-6deg", animation: "floaty 5.2s ease-in-out infinite" }}>
        <div style={{ width: 108, height: 108, background: "#2E4BD8", border: "5px solid #151310", borderRadius: "50%", boxShadow: "7px 7px 0 var(--shadow)", position: "relative" }}>
          <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 11 }}>
            <Eye size={32} pupil={15} />
            <Eye size={32} pupil={15} />
          </div>
        </div>
      </div>

      {/* Hero — margin auto centers it but still allows scrolling if the screen is short */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, maxWidth: 660, margin: "auto", padding: "12px 0" }}>
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
          <button className="sticker" onClick={() => go("work")} style={{ color: "#fff", background: "#2E4BD8" }}>
            See my work
          </button>
          <button className="sticker" onClick={() => go("contact")} style={{ color: "var(--ink)", background: "var(--panel)", borderColor: "var(--line)", ["--tilt" as string]: "2deg" }}>
            Say hi
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button className="chip-btn" onClick={() => go("projects")} style={{ color: "#151310", background: "#FFC93C" }}>
            My Projects
          </button>
          <a className="chip-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer" style={{ color: "#151310", background: "#6FB92C", ["--tilt" as string]: "2deg" }}>
            LinkedIn
          </a>
          <button className="chip-btn" onClick={() => go("about")} style={{ color: "#fff", background: "#E5372A" }}>
            About Me
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ WORK ============ */

function WorkPanel({ featured, jobs }: { featured: Job; jobs: Job[] }) {
  return (
    <div data-section="work" className="section">
      <div className="panel-head">
        <span className="panel-label">Experience — 01</span>
        <h2 className="panel-title">What I do</h2>
      </div>
      <div style={{ width: "100%" }}>
        <div className="work-grid">
          <div className="card" style={{ gridColumn: "1 / -1", padding: "32px 34px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <h3 style={{ fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: "-0.3px" }}>{featured.company}</h3>
                <span style={{ fontWeight: 500, fontSize: 14, color: "var(--muted)" }}>{featured.role}</span>
              </div>
              <span className="period-pill">{featured.period}</span>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.45, margin: featured.highlights.length ? "0 0 18px" : 0, color: "var(--muted)" }}>
              {featured.blurb}
            </p>
            {featured.highlights.length > 0 && (
              <ul className="job-bullets">
                {featured.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
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
      </div>
    </div>
  );
}

/* ============ PROJECTS ============ */

function ProjectsPanel({ projects }: { projects: Project[] }) {
  return (
    <div data-section="projects" className="section">
      <div className="panel-head">
        <span className="panel-label">Selected work — 02</span>
        <h2 className="panel-title">Things I&apos;ve made</h2>
      </div>
      <div style={{ width: "100%" }}>
        <div className="project-list inter">
          {projects.map((p) => {
            const inner = (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontWeight: 500, fontSize: 14, color: "var(--muted)", letterSpacing: 1 }}>{p.num}</span>
                  {p.date && <span className="proj-date">{p.date}</span>}
                </div>
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
      </div>
    </div>
  );
}

/* ============ ABOUT ============ */

function AboutPanel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);
  const [photo, setPhoto] = useState(0);

  const onScroll = () => {
    const sc = scrollRef.current;
    if (sc) setSection(Math.round(sc.scrollTop / sc.clientHeight));
  };

  const goSection = (i: number) => {
    const sc = scrollRef.current;
    if (sc) sc.scrollTo({ top: i * sc.clientHeight, behavior: "smooth" });
  };

  return (
    <div className="panel" style={{ overflow: "hidden" }}>
      <div ref={scrollRef} className="about-scroll" onScroll={onScroll}>
        {/* Section 1: intro */}
        <div className="about-section">
          <div className="about-intro">
            <div className="about-blob" style={{ flex: "none", position: "relative", width: 240, height: 240, background: "#F59E0B", border: "5px solid #151310", borderRadius: "47% 47% 44% 44% / 49% 49% 44% 44%" }}>
              <div style={{ position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 18 }}>
                <Eye size={62} pupil={28} border={4} />
                <Eye size={62} pupil={28} border={4} />
              </div>
              <div style={{ position: "absolute", top: 150, left: "50%", transform: "translateX(-50%)", width: 34, height: 26, background: "#F97316", border: "4px solid #151310", borderRadius: "50%" }} />
            </div>
            <div className="inter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ alignSelf: "flex-start", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", fontSize: 13, color: "#151310", background: "#F59E0B", border: "3px solid #151310", borderRadius: 999, padding: "7px 16px" }}>
                The personal bit
              </span>
              <h2 style={{ fontWeight: 700, fontSize: "clamp(32px, 5vw, 44px)", margin: 0, letterSpacing: "-0.5px" }}>About Me</h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--muted)", margin: 0, maxWidth: 520, fontFamily: "var(--font-dm-sans)" }}>
                Hi, I&apos;m Aroop! In my free time I like playing basketball, going to
                concerts, and trying new food in SF.
              </p>
              <span style={{ fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", fontSize: 12, color: "var(--muted)" }}>
                Things I like to do
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 560 }}>
                {INTERESTS.map((it) => (
                  <span key={it.label} className="interest-chip" style={{ background: it.bg, color: it.fg ?? "#151310" }}>
                    {it.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "opacity .35s ease", opacity: section === 0 ? 1 : 0 }}>
            <span className="inter" style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)" }}>Scroll</span>
            <span style={{ width: 26, height: 26, border: "2.5px solid var(--line)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "floatyB 1.6s ease-in-out infinite" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Section 2: photos */}
        <div className="about-section" style={{ gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 22, height: 22, background: "#F97316", border: "3px solid #151310", borderRadius: "50%" }} />
            <h2 className="inter" style={{ fontWeight: 700, fontSize: "clamp(26px, 4vw, 36px)", margin: 0, letterSpacing: "-0.5px" }}>Some pics</h2>
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, width: "100%", justifyContent: "center" }}>
            <button onClick={() => setPhoto((photo - 1 + PHOTOS.length) % PHOTOS.length)} aria-label="Previous photo" style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--panel)", border: "2.5px solid var(--line)", color: "var(--ink)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              ‹
            </button>
            <div style={{ width: "min(560px, 100%)", aspectRatio: "7 / 5", overflow: "hidden", border: "2.5px solid var(--line)", borderRadius: 16 }}>
              <div style={{ display: "flex", height: "100%", transition: "transform .55s cubic-bezier(.22,1.18,.36,1)", transform: `translateX(-${photo * 100}%)` }}>
                {PHOTOS.map((ph) => (
                  <div key={ph.src} style={{ flex: "none", width: "100%", height: "100%", position: "relative" }}>
                    <Image src={ph.src} alt={ph.alt} fill className="object-cover" style={{ objectPosition: ph.pos }} sizes="560px" />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPhoto((photo + 1) % PHOTOS.length)} aria-label="Next photo" style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--panel)", border: "2.5px solid var(--line)", color: "var(--ink)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              ›
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PHOTOS.map((ph, i) => (
              <button key={ph.src} className="dot" onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} style={{ background: i === photo ? "var(--ink)" : "var(--muted)", opacity: i === photo ? 1 : 0.45 }} />
            ))}
          </div>
        </div>

        {/* Section 3: at a glance */}
        <div className="about-section">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, maxWidth: 560 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <Eye size={46} pupil={21} border={4} />
              <Eye size={46} pupil={21} border={4} />
            </div>
            <h2 className="inter" style={{ fontWeight: 700, fontSize: "clamp(26px, 4vw, 36px)", margin: 0, letterSpacing: "-0.5px" }}>At a glance</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
              {GLANCE.map((item) => (
                <div key={item} className="card inter" style={{ padding: "14px 20px", fontSize: 16, fontWeight: 500 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section dots (hidden on mobile, where sections free-scroll) */}
      <div className="about-dots">
        {[0, 1, 2].map((i) => (
          <button key={i} className="dot" onClick={() => goSection(i)} aria-label={`About section ${i + 1}`} style={{ background: i === section ? "var(--ink)" : "var(--muted)", opacity: i === section ? 1 : 0.45 }} />
        ))}
      </div>
    </div>
  );
}

/* ============ CONTACT ============ */

function ContactPanel() {
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
    <div data-section="contact" className="section section-centered">
      <div className="contact-card">
        <span className="float-deco" style={{ position: "absolute", top: 22, left: 30, width: 40, height: 40, background: "#FFC93C", border: "4px solid #151310", borderRadius: "50%", animation: "floaty 5s ease-in-out infinite" }} />
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 18 }}>
          <Eye size={58} pupil={27} border={5} style={{ boxShadow: "4px 4px 0 var(--shadow)" }} />
          <Eye size={58} pupil={27} border={5} style={{ boxShadow: "4px 4px 0 var(--shadow)" }} />
        </div>
        <br/>
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
    </div>
  );
}
