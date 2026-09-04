"use client";

import { useTheme } from "./theme";

/**
 * The light/dark switch, shared by every page that carries one: a round button
 * showing the theme you would switch *to* — a sun while dark, a moon while
 * light — which is what the old "Light"/"Dark" label said.
 *
 * Both icons are always in the DOM and CSS picks one off `html[data-theme]`.
 * The server renders "light" and the browser may already be dark, so choosing
 * the icon in React would either mismatch on hydration or flash the wrong one.
 * Only the accessible name changes, and that one mismatch is suppressed.
 */
export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      suppressHydrationWarning
    >
      <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
      <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden focusable="false">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
