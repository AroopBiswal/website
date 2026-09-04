"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useEyeTracking } from "../components/googly";
import { useTheme } from "../components/theme";
import { SiteNav } from "../components/nav";

/**
 * The chrome shared by the blog index and each post: a sticky bar carrying the
 * back link and the theme toggle, and the column the content sits in.
 */
export default function BlogShell({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  /** Not shown — the control is just an arrow, so this is its accessible name. */
  backLabel: string;
  children: ReactNode;
}) {
  const [theme, toggleTheme] = useTheme();
  useEyeTracking();

  return (
    <div className="blog-root">
      {/* The site's own nav, so the blog reads as part of the site rather than
          somewhere else. The back arrow goes up one level: a post to the index,
          the index home. */}
      <div className="blog-bar">
        <Link href={backHref} className="blog-back" aria-label={backLabel}>
          <span aria-hidden>&larr;</span>
        </Link>
        <SiteNav
          active="blog"
          toggle={
            <button className="theme-toggle" onClick={toggleTheme} suppressHydrationWarning>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          }
        />
      </div>

      <main className="blog-wrap">{children}</main>
    </div>
  );
}
