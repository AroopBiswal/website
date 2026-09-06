"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEyeTracking } from "./googly";
import { ThemeToggle } from "./theme-toggle";
import { SiteNav } from "./nav";

/**
 * The chrome for pages that live outside the home page's scroll — the blog and
 * the alligator: a sticky bar carrying the site nav, the rule that slides
 * between its two positions on navigation, a back arrow to the landing page,
 * and the column the content sits in.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  useEyeTracking();
  // One layout serves both routes, so which nav item is lit comes from the URL.
  const active = usePathname().startsWith("/alligator") ? "alligator" : "blog";

  return (
    <div className="page-root">
      {/* The site's own nav, so these pages read as part of the site rather
          than somewhere else. */}
      <div className="page-bar">
        {/* The same line the home page draws at 44px, sitting below the nav
            instead of through it. It slides between the two on navigation. */}
        <div className="page-rule" />
        <SiteNav active={active} toggle={<ThemeToggle />} />
      </div>

      {/* A thin arrow below the rule, top left, back to the landing page. It
          is outside the sticky bar on purpose: it belongs to the page, so it
          scrolls away with it. */}
      <Link href="/" className="page-back" aria-label="Back to home">
        <svg viewBox="0 0 56 24" width="56" height="24" aria-hidden focusable="false">
          <path d="M54 12H2M12 2 2 12l10 10" />
        </svg>
      </Link>

      <main className="page-wrap">{children}</main>
    </div>
  );
}
