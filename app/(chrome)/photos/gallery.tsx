"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LOCAL_URL_PREFIX, photoSize, type Photo } from "@/lib/photos-shared";

/**
 * The grid of photos plus a lightbox. The grid is CSS multi-column, so each
 * photo keeps its own aspect ratio and the columns pack like a pinboard.
 */
export default function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // The <dialog> owns Escape and the backdrop; we only steer it open/closed.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="photo-grid">
        {photos.map((p, i) => (
          <figure className="photo-card" key={p.pathname} style={{ "--tilt": i % 2 ? "1.2deg" : "-1.2deg" } as React.CSSProperties}>
            <button type="button" className="photo-card-btn" onClick={() => setOpen(i)} aria-label={p.caption ? `Open photo: ${p.caption}` : "Open photo"}>
              <Image
                src={p.url}
                alt={p.caption}
                {...photoSize(p)}
                sizes="(max-width: 860px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="photo-img"
                unoptimized={p.url.startsWith(LOCAL_URL_PREFIX)}
              />
            </button>
            {p.caption && <figcaption className="photo-caption">{p.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <dialog
        ref={dialog}
        className="photo-lightbox"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog itself, not a child.
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        {current && (
          <figure className="photo-lightbox-figure">
            <Image
              src={current.url}
              alt={current.caption}
              {...photoSize(current)}
              sizes="100vw"
              className="photo-lightbox-img"
              unoptimized={current.url.startsWith(LOCAL_URL_PREFIX)}
              priority
            />
            <figcaption className="photo-lightbox-caption">
              <span>{current.caption}</span>
              <span className="photo-lightbox-count">
                {open! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        )}
        {photos.length > 1 && (
          <>
            <button type="button" className="photo-lightbox-nav prev" onClick={() => step(-1)} aria-label="Previous photo">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
                <path d="M15 4 7 12l8 8" />
              </svg>
            </button>
            <button type="button" className="photo-lightbox-nav next" onClick={() => step(1)} aria-label="Next photo">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
                <path d="m9 4 8 8-8 8" />
              </svg>
            </button>
          </>
        )}
        <button type="button" className="photo-lightbox-close" onClick={() => setOpen(null)} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </dialog>
    </>
  );
}
