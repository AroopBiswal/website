"use client";

import { CSSProperties, useEffect } from "react";

/**
 * The googly eyes from the main site, pulled out so other pages can use them.
 * site.tsx still carries its own copy; this is the version new pages should
 * import, and site.tsx can adopt it whenever it is next touched.
 */
export function Eye({
  size,
  pupil,
  border = 3,
  style,
}: {
  size: number | string;
  pupil: number | string;
  border?: number | string;
  style?: CSSProperties;
}) {
  return (
    <span className="eye" style={{ width: size, height: size, borderWidth: border, ...style }}>
      <span className="pupil" style={{ width: pupil, height: pupil }} />
    </span>
  );
}

/** One listener drives every `.pupil` on the page. */
export function useEyeTracking(deps: unknown[] = []) {
  useEffect(() => {
    let raf = 0;
    let mx: number | null = null;
    let my: number | null = null;
    const update = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>(".pupil").forEach((p) => {
        const r = p.parentElement!.getBoundingClientRect();
        if (!r.width) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (mx ?? cx) - cx;
        const dy = (my ?? cy) - cy;
        const a = Math.atan2(dy, dx);
        const dist = Math.min(r.width * 0.22, Math.hypot(dx, dy) / 5);
        p.style.transform = `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px)`;
      });
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
