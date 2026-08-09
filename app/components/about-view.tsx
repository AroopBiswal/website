"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, ScrollCue, SiteChrome, SiteNav, useGooglyEyes, useScrollSpy } from "./shell";

/**
 * /about — its own scrolling page (deliberately not part of the home scroll).
 * Three full-height sections with side dots, scrolled by the document.
 */

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

const ABOUT_SECTIONS = ["about-intro", "about-photos", "about-glance"] as const;

export default function AboutView() {
  useGooglyEyes();
  const active = useScrollSpy(ABOUT_SECTIONS);
  const [photo, setPhoto] = useState(0);

  const goSection = (i: number) =>
    document.getElementById(ABOUT_SECTIONS[i])?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="site-root">
      <SiteChrome />
      <SiteNav active="about" page="about" />

      <main className="site-content">
        {/* Section 1: intro */}
        <section id="about-intro" className="section section-center">
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
              <h1 style={{ fontWeight: 700, fontSize: "clamp(32px, 5vw, 44px)", margin: 0, letterSpacing: "-0.5px" }}>About Me</h1>
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
          <ScrollCue />
        </section>

        {/* Section 2: photos */}
        <section id="about-photos" className="section section-center" style={{ gap: 20 }}>
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
        </section>

        {/* Section 3: at a glance */}
        <section id="about-glance" className="section section-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, maxWidth: 560, width: "100%" }}>
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
        </section>
      </main>

      {/* Section dots (hidden on mobile, where sections free-scroll) */}
      <div className="about-dots">
        {ABOUT_SECTIONS.map((id, i) => (
          <button key={id} className="dot" onClick={() => goSection(i)} aria-label={`About section ${i + 1}`} style={{ background: active === id ? "var(--ink)" : "var(--muted)", opacity: active === id ? 1 : 0.45 }} />
        ))}
      </div>
    </div>
  );
}
