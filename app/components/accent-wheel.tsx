"use client";

import { useEffect, useState } from "react";

const ACCENT_COLORS = ["#f5b163", "#7bdff2", "#ff7ab2", "#9adf7d", "#f4e77d", "#c4a1ff"];
const STORAGE_KEY = "site-accent-index";

export default function AccentWheel() {
  const [accentIndex, setAccentIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return 0;
    const parsed = Number(saved);
    if (Number.isNaN(parsed) || parsed < 0 || parsed >= ACCENT_COLORS.length) return 0;
    return parsed;
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", ACCENT_COLORS[accentIndex]);
    window.localStorage.setItem(STORAGE_KEY, String(accentIndex));
  }, [accentIndex]);

  return (
    <button
      type="button"
      onClick={() => setAccentIndex((prev) => (prev + 1) % ACCENT_COLORS.length)}
      className="color-wheel color-wheel-orbit rounded-full"
      aria-label="Change accent color"
      title="Change accent color"
    >
      <span className="sr-only">Change accent color</span>
    </button>
  );
}
