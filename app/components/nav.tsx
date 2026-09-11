"use client";

import { ReactNode } from "react";
import Link from "next/link";

export const TABS = ["home", "work", "projects", "about", "contact"] as const;
export type Tab = (typeof TABS)[number];

export const LINKS = {
  email: "mailto:aroopbiswal@gmail.com",
  github: "https://github.com/AroopBiswal",
  trading: "https://aroopbiswal.com/trading",
  linkedin: "https://linkedin.com/in/AroopBiswal/",
  resume: "/resume.pdf",
};

/**
 * The header, shared by the scrolling home page and the pages with their own
 * routes (the blog, the alligator).
 *
 * On the home page the section links scroll the view, so they are buttons and
 * `go` is supplied. Anywhere else there is nothing to scroll, so the same
 * items render as links back to `/#section`.
 */
export function SiteNav({
  active,
  go,
  toggle,
}: {
  /** Which item is lit: a section of the home page, a page of its own, or nothing (the admin). */
  active: Tab | "blog" | "photos" | "alligator" | null;
  /** Supplied by the home page only; its absence switches the nav to links. */
  go?: (t: Tab) => void;
  /** The theme toggle, which each page owns. */
  toggle: ReactNode;
}) {
  const item = (t: Tab, label: string) => {
    const className = `navbtn${active === t ? " active" : ""}`;
    return go ? (
      <button className={className} onClick={() => go(t)}>
        {label}
      </button>
    ) : (
      <Link className={className} href={t === "home" ? "/" : `/#${t}`}>
        {label}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <nav className="site-nav">
        {item("home", "Home")}
        {item("work", "Work")}
        {item("projects", "Projects")}
        {item("contact", "Contact")}
      </nav>

      <nav className="site-nav site-nav-right">
        {/* Opens a new tab, so the hover shows an outward arrow with it. */}
        <a className="navbtn navbtn-ext" href={LINKS.trading} target="_blank" rel="noreferrer">
          Trading
          <svg className="navbtn-ext-arrow" viewBox="0 0 12 12" width="9" height="9" aria-hidden focusable="false">
            <path d="M3 9 9 3M4.5 3H9v4.5" />
          </svg>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <Link className={`navbtn${active === "blog" ? " active" : ""}`} href="/blog">
          Blog
        </Link>
        <Link className={`navbtn${active === "photos" ? " active" : ""}`} href="/photos">
          Photography
        </Link>
        <Link className={`navbtn${active === "alligator" ? " active" : ""}`} href="/alligator">
          Alligator
        </Link>
        {item("about", "About Me")}
        {toggle}
      </nav>
    </header>
  );
}
