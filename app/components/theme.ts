"use client";

import { useSyncExternalStore } from "react";

/**
 * The theme lives on `html[data-theme]`, written pre-paint by the init script in
 * layout.tsx. Reading it through useSyncExternalStore keeps the server render
 * ("light") and the client in step without a setState-in-effect.
 *
 * Shared by every page that carries the light/dark toggle.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("themechange", onChange);
      return () => window.removeEventListener("themechange", onChange);
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("site-theme", next);
    } catch {}
    window.dispatchEvent(new Event("themechange"));
  };

  return [theme, toggle] as const;
}
