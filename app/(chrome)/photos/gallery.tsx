"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LOCAL_URL_PREFIX, photoPlace, photoSize, type Photo } from "@/lib/photos-shared";

/**
 * The photos as a feed: one per row at the full width of the column, in a thin
 * frame, with the title and caption beneath on the left and where and when on
 * the right. A portrait frame is held to the height of the screen, and the
 * text under it narrows with it. Clicking a photo opens the lightbox.
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
      <div className="photo-feed">
        {photos.map((p, i) => {
          const size = photoSize(p);
          const place = photoPlace(p);
          return (
            <article className="photo-item" key={p.pathname} style={{ "--ratio": size.width / size.height } as CSSProperties}>
              <button type="button" className="photo-frame" onClick={() => setOpen(i)} aria-label={`Open photo${p.title ? `: ${p.title}` : ""}`}>
                <Image
                  src={p.url}
                  alt={p.title || p.caption}
                  {...size}
                  sizes="(max-width: 860px) 100vw, 1040px"
                  className="photo-img"
                  loading={i === 0 ? "eager" : "lazy"}
                  unoptimized={p.url.startsWith(LOCAL_URL_PREFIX)}
                />
              </button>
              {(p.title || p.caption || place) && (
                <div className="photo-meta">
                  <div className="photo-text">
                    {p.title && <h2 className="photo-title">{p.title}</h2>}
                    {p.caption && <p className="photo-caption">{p.caption}</p>}
                  </div>
                  {place && <span className="photo-place">{place}</span>}
                </div>
              )}
            </article>
          );
        })}
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
              alt={current.title || current.caption}
              {...photoSize(current)}
              sizes="100vw"
              className="photo-lightbox-img"
              unoptimized={current.url.startsWith(LOCAL_URL_PREFIX)}
              priority
            />
            <figcaption className="photo-lightbox-caption">
              <span>
                {current.title && <strong>{current.title}</strong>}
                {current.title && current.caption && " — "}
                {current.caption}
              </span>
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
