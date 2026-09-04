"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useEyeTracking } from "../components/googly";
import { ThemeToggle } from "../components/theme-toggle";
import { SiteNav } from "../components/nav";

/**
 * The chrome shared by the blog index and each post: a sticky bar carrying the
 * site nav and the theme toggle, a back arrow to the landing page under it,
 * and the column the content sits in.
 */
export default function BlogShell({ children }: { children: ReactNode }) {
  useEyeTracking();

  return (
    <div className="blog-root">
      {/* The site's own nav, so the blog reads as part of the site rather than
          somewhere else. */}
      <div className="blog-bar">
        {/* The same line the home page draws at 44px, sitting below the nav
            instead of through it. It slides between the two on navigation. */}
        <div className="blog-rule" />
        <SiteNav active="blog" toggle={<ThemeToggle />} />
      </div>

      {/* A thin arrow below the rule, top left, back to the landing page. It
          is outside the sticky bar on purpose: it belongs to the page, so it
          scrolls away with it. */}
      <Link href="/" className="blog-back" aria-label="Back to home">
        <svg viewBox="0 0 56 24" aria-hidden focusable="false">
          <path d="M54 12H2M12 2 2 12l10 10" />
        </svg>
      </Link>

      <main className="blog-wrap">{children}</main>
    </div>
  );
}
