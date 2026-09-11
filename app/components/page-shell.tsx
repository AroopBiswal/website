"use client";

import { ReactNode, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEyeTracking } from "./googly";
import { ThemeToggle } from "./theme-toggle";
import { SiteNav } from "./nav";
import { header } from "./header-state";

/**
 * The chrome for pages that live outside the home page's scroll — the blog,
 * the photos, the alligator and the admin: a sticky bar carrying the site nav, the rule that slides
 * between its two positions on navigation, a back arrow to the landing page,
 * and the column the content sits in.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  useEyeTracking();
  // One layout serves every route in the group, so which nav item is lit
  // comes from the URL. The admin page lights nothing: it has no nav item.
  const pathname = usePathname();
  const active = pathname.startsWith("/alligator")
    ? "alligator"
    : pathname.startsWith("/photos")
      ? "photos"
      : pathname.startsWith("/admin")
        ? null
        : "blog";
  // The photo pages want more than the blog's reading column.
  const wide = active === "photos" || active === null;

  // Arriving from About, the rule is already below the nav: mark the root
  // before the first paint so the arrival keyframes never start, the same
  // stillness a hop between the blog and the photos has. Either way, the
  // header is now in the "below" state for whoever comes next.
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const was = header.below;
    if (was && rootRef.current) rootRef.current.dataset.arrive = "still";
    header.below = true;
    // Restore on unmount so the effect is idempotent: StrictMode runs it
    // twice in development, and the second run must not see the first
    // run's write and take the still path when it came from the home page.
    return () => {
      header.below = was;
    };
  }, []);

  return (
    <div ref={rootRef} className="page-root">
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

      <main className={`page-wrap${wide ? " page-wrap-wide" : ""}`}>{children}</main>
    </div>
  );
}
