"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

/**
 * Pieces shared by the two pages of the site:
 *   /       — one long scroll: Home → Work → Projects → Contact
 *   /about  — its own scrolling page
 *
 * The nav is identical on both, so section links are plain anchors: on the
 * home page they point at "#work"; on /about they point at "/#work".
 */

export const LINKS = {
  email: "mailto:aroopbiswal@gmail.com",
  github: "https://github.com/AroopBiswal",
  linkedin: "https://linkedin.com/in/AroopBiswal/",
  resume: "/resume.pdf",
};

/* ---------- Googly eye ---------- */

export function Eye({
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
 * One global mousemove listener drives every .pupil on the page. The DOM is
 * re-queried on each frame, so eyes that mount later are picked up for free.
 */
export function useGooglyEyes() {
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
  }, []);
}

/**
 * Which section id is currently under the reading line (~45% down the
 * viewport). Pass a stable array — ids are read once per mount.
 */
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/* ---------- Theme ---------- */

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Read the value the no-flash script in layout.tsx already applied to <html>.
  // This has to happen after mount, not in a useState initializer: the server
  // can't know the theme, so initializing from the DOM would make the toggle
  // label mismatch the SSR output and break hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    if (t === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("site-theme", t);
    } catch {}
  };

  return [theme, toggle] as const;
}

/* ---------- Nav ---------- */

const SECTION_LINKS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
] as const;

export function SiteNav({ active, page }: { active: string; page: "home" | "about" }) {
  const [theme, toggleTheme] = useTheme();
  const navRef = useRef<HTMLElement>(null);
  // Section anchors live on the home page; /about has to route back to it.
  const to = (id: string) => (page === "home" ? `#${id}` : `/#${id}`);

  // The nav wraps to several rows on narrow screens, so publish its measured
  // height as --nav-h; the fixed gutter and every section's top padding key
  // off it (see globals.css).
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--nav-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <nav className="site-nav" ref={navRef}>
      {SECTION_LINKS.map((s) => (
        <a key={s.id} className={`navbtn${active === s.id ? " active" : ""}`} href={to(s.id)}>
          {s.label}
        </a>
      ))}
      <a className="navbtn" href={LINKS.github} target="_blank" rel="noreferrer">
        GitHub
      </a>
      <a className={`navbtn${active === "contact" ? " active" : ""}`} href={to("contact")}>
        Contact
      </a>
      <span className="nav-divider" />
      <a className={`navbtn${page === "about" ? " active" : ""}`} href="/about">
        About Me
      </a>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </nav>
  );
}

/** The "keep going" nudge at the bottom of a first screen. */
export function ScrollCue() {
  return (
    <div className="scroll-cue">
      <span className="inter" style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)" }}>
        Scroll
      </span>
      <span style={{ width: 26, height: 26, border: "2.5px solid var(--line)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "floatyB 1.6s ease-in-out infinite" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/**
 * Fixed border frame + the background strips that hide scrolling content
 * before it reaches the frame lines.
 */
export function SiteChrome() {
  return (
    <>
      <div className="site-gutter site-gutter-top" />
      <div className="site-gutter site-gutter-bottom" />
      <div className="site-frame" />
    </>
  );
}
