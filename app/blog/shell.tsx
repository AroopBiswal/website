"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useEyeTracking } from "../components/googly";
import { useTheme } from "../components/theme";

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
  backLabel: string;
  children: ReactNode;
}) {
  const [theme, toggleTheme] = useTheme();
  useEyeTracking();

  return (
    <div className="blog-root">
      <header className="blog-bar">
        <Link href={backHref} className="blog-back">
          <span aria-hidden>&larr;</span> {backLabel}
        </Link>
        <button className="theme-toggle" onClick={toggleTheme} suppressHydrationWarning>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main className="blog-wrap">{children}</main>
    </div>
  );
}
