"use client";

import { ReactNode } from "react";
import { useEyeTracking } from "../components/googly";
import { useTheme } from "../components/theme";
import { SiteNav } from "../components/nav";

/**
 * The chrome shared by the blog index and each post: a sticky bar carrying the
 * back link and the theme toggle, and the column the content sits in.
 */
export default function BlogShell({ children }: { children: ReactNode }) {
  const [theme, toggleTheme] = useTheme();
  useEyeTracking();

  return (
    <div className="blog-root">
      {/* The site's own nav, so the blog reads as part of the site rather than
          somewhere else. The back arrow goes up one level: a post to the index,
          the index home. */}
      <div className="blog-bar">
        {/* The same line the home page draws at 44px, sitting below the nav
            instead of through it. It slides between the two on navigation. */}
        <div className="blog-rule" />
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
