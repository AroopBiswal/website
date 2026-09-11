"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ALLOWED_TYPES, LOCAL_URL_PREFIX, MAX_BYTES, PHOTO_PREFIX, photoSize, safePhotoName, type Photo, type PhotoEdit, type StoreMode } from "@/lib/photos-shared";
import { deletePhotoAction, recordUploadsAction, savePhotosAction } from "./actions";

type Queued = {
  id: number;
  file: File;
  status: "waiting" | "uploading" | "done" | "failed";
  progress: number;
  error?: string;
};

/** Reads a file's pixel size in the browser, or 0/0 if it cannot be decoded. */
async function measureFile(file: File): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  } catch {
    return { width: 0, height: 0 };
  }
}

/** The same for a photo already in the store, by loading it. */
function measureUrl(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

/** Sends one file to whichever store is live and returns where it landed. */
async function send(file: File, mode: StoreMode, onProgress: (pct: number) => void): Promise<{ pathname: string }> {
  if (mode === "blob") {
    const blob = await upload(PHOTO_PREFIX + safePhotoName(file.name), file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      onUploadProgress: (p) => onProgress(p.percentage),
    });
    return { pathname: blob.pathname };
  }
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload-local", { method: "POST", body });
  const json = (await res.json()) as { pathname?: string; error?: string };
  if (!res.ok || !json.pathname) throw new Error(json.error ?? `Upload failed (${res.status}).`);
  onProgress(100);
  return { pathname: json.pathname };
}

const toEdit = (p: Photo): PhotoEdit => ({
  pathname: p.pathname,
  title: p.title,
  caption: p.caption,
  location: p.location,
  date: p.date,
  width: p.width,
  height: p.height,
});
const fingerprint = (photos: Photo[]) => JSON.stringify(photos.map(toEdit));

let nextId = 1;

export default function AdminPanel({ initial, mode }: { initial: Photo[]; mode: StoreMode }) {
  // `saved` is what the store holds; `draft` is what the rows show. They
  // drift apart as captions are typed and rows moved, and meet again on save.
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // The save bar is portalled to <body>: .page-wrap keeps a transform from
  // its arrival animation, which would make it the containing block for a
  // position: fixed child and pin the bar to the bottom of the column.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dirty = fingerprint(draft) !== fingerprint(saved);

  /** Applies a fresh list from the server, carrying over unsaved details. */
  const arrive = (photos: Photo[]) => {
    setSaved(photos);
    setDraft((d) => {
      const edited = new Map(d.map((p) => [p.pathname, p]));
      const merged = photos.map((p) => {
        const e = edited.get(p.pathname);
        return e ? { ...p, title: e.title, caption: e.caption, location: e.location, date: e.date } : p;
      });
      // Keep the draft's order for rows that were already here; newcomers
      // (fresh uploads) go to the front, where the server put them.
      const known = new Set(d.map((p) => p.pathname));
      const fresh = merged.filter((p) => !known.has(p.pathname));
      const kept = d.map((p) => merged.find((m) => m.pathname === p.pathname)).filter((p): p is Photo => Boolean(p));
      return [...fresh, ...kept];
    });
  };

  const patch = (id: number, next: Partial<Queued>) =>
    setQueue((q) => q.map((item) => (item.id === id ? { ...item, ...next } : item)));

  const add = (files: FileList | File[]) => {
    const items: Queued[] = [];
    for (const file of Array.from(files)) {
      const ok = (ALLOWED_TYPES as readonly string[]).includes(file.type);
      const small = file.size <= MAX_BYTES;
      items.push({
        id: nextId++,
        file,
        status: ok && small ? "waiting" : "failed",
        progress: 0,
        error: !ok ? "Not an accepted image type." : !small ? "Over the 50MB limit." : undefined,
      });
    }
    setQueue((q) => [...q, ...items]);
  };

  const uploadAll = async () => {
    const waiting = queue.filter((q) => q.status === "waiting");
    if (waiting.length === 0 || busy) return;
    setBusy(true);
    setNotice(null);
    const landed: PhotoEdit[] = [];
    for (const item of waiting) {
      patch(item.id, { status: "uploading", progress: 0 });
      try {
        const [{ pathname }, size] = await Promise.all([
          send(item.file, mode, (pct) => patch(item.id, { progress: pct })),
          measureFile(item.file),
        ]);
        landed.push({ pathname, title: "", caption: "", location: "", date: "", ...size });
        patch(item.id, { status: "done", progress: 100 });
      } catch (e) {
        patch(item.id, { status: "failed", error: (e as Error).message });
      }
    }
    if (landed.length > 0) {
      try {
        arrive(await recordUploadsAction(landed));
        // The uploads are filed; only the failures are worth keeping in view.
        setQueue((q) => q.filter((item) => item.status === "failed"));
        setNotice(`${landed.length} photo${landed.length === 1 ? "" : "s"} added.`);
      } catch (e) {
        setQueue((q) => q.map((item) => (item.status === "done" ? { ...item, status: "failed", error: `Uploaded, but not filed: ${(e as Error).message}` } : item)));
      }
    }
    setBusy(false);
  };

  const setField = (pathname: string, field: "title" | "caption" | "location" | "date", value: string) =>
    setDraft((d) => d.map((p) => (p.pathname === pathname ? { ...p, [field]: value } : p)));

  const move = (index: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = index + dir;
      if (j < 0 || j >= d.length) return d;
      const next = d.slice();
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      // Photos that arrived without a size (a dashboard upload) get measured
      // now, so the gallery stops guessing at their shape.
      const edits = await Promise.all(
        draft.map(async (p) => (p.width > 0 && p.height > 0 ? toEdit(p) : { ...toEdit(p), ...(await measureUrl(p.url)) })),
      );
      const photos = await savePhotosAction(edits);
      setSaved(photos);
      setDraft(photos);
      setNotice("Saved.");
    } catch (e) {
      setNotice(`Not saved: ${(e as Error).message}`);
    }
    setSaving(false);
  };

  const remove = async (pathname: string) => {
    setConfirming(null);
    setNotice(null);
    try {
      const photos = await deletePhotoAction(pathname);
      setSaved(photos);
      setDraft((d) => d.filter((p) => p.pathname !== pathname));
      setNotice("Deleted.");
    } catch (e) {
      setNotice(`Not deleted: ${(e as Error).message}`);
    }
  };

  const waiting = queue.filter((q) => q.status === "waiting").length;

  return (
    <>
      <section
        className={`admin-card admin-drop${dragging ? " dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <input
          ref={input}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="admin-drop-text">Drop photos here, or</p>
        <div className="admin-drop-actions">
          <button type="button" className="sticker admin-sticker" onClick={() => input.current?.click()}>
            Choose photos
          </button>
          {queue.length > 0 && (
            <button type="button" className="sticker admin-sticker admin-sticker-blue" onClick={uploadAll} disabled={busy || waiting === 0}>
              {busy ? "Uploading…" : `Upload ${waiting}`}
            </button>
          )}
        </div>

        {queue.length > 0 && (
          <ul className="admin-queue">
            {queue.map((item) => (
              <li key={item.id} className={`admin-queue-row ${item.status}`}>
                <span className="admin-queue-name">{item.file.name}</span>
                <span className="admin-queue-size">{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
                <span className="admin-queue-status">
                  {item.status === "waiting" && "Ready"}
                  {item.status === "uploading" && `${Math.round(item.progress)}%`}
                  {item.status === "done" && "Done"}
                  {item.status === "failed" && (item.error ?? "Failed")}
                </span>
                {item.status !== "uploading" && (
                  <button type="button" className="admin-queue-remove" aria-label={`Remove ${item.file.name}`} onClick={() => setQueue((q) => q.filter((x) => x.id !== item.id))}>
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-status">
        <p className="admin-note">
          {draft.length} photo{draft.length === 1 ? "" : "s"} in the{" "}
          {mode === "blob" ? "Blob store" : "local folder (.photos-local)"}. The gallery shows them in this order.
        </p>
        {notice && (
          <p className="admin-notice" role="status">
            {notice}
          </p>
        )}
      </div>

      <ul className="admin-list">
        {draft.map((p, i) => (
          <li key={p.pathname} className="admin-row">
            <Image src={p.url} alt="" {...photoSize(p)} sizes="120px" className="admin-thumb" unoptimized={p.url.startsWith(LOCAL_URL_PREFIX)} />
            <div className="admin-row-body">
              <div className="admin-fields">
                <input
                  className="admin-input admin-field-title"
                  type="text"
                  value={p.title}
                  placeholder="Title"
                  maxLength={120}
                  aria-label={`Title for ${p.pathname.slice(PHOTO_PREFIX.length)}`}
                  onChange={(e) => setField(p.pathname, "title", e.target.value)}
                />
                <input
                  className="admin-input"
                  type="text"
                  value={p.location}
                  placeholder="Location"
                  maxLength={120}
                  aria-label={`Location for ${p.pathname.slice(PHOTO_PREFIX.length)}`}
                  onChange={(e) => setField(p.pathname, "location", e.target.value)}
                />
                <input
                  className="admin-input admin-field-date"
                  type="month"
                  value={p.date}
                  aria-label={`Month taken for ${p.pathname.slice(PHOTO_PREFIX.length)}`}
                  onChange={(e) => setField(p.pathname, "date", e.target.value)}
                />
                <textarea
                  className="admin-input admin-field-caption"
                  value={p.caption}
                  placeholder="Description (optional) — shown under the title"
                  maxLength={500}
                  rows={3}
                  aria-label={`Description for ${p.pathname.slice(PHOTO_PREFIX.length)}`}
                  onChange={(e) => setField(p.pathname, "caption", e.target.value)}
                />
              </div>
              <div className="admin-row-meta">
                {p.pathname.slice(PHOTO_PREFIX.length)}
                {p.width > 0 && ` · ${p.width}×${p.height}`}
              </div>
            </div>
            <div className="admin-row-actions">
              <button type="button" className="admin-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
              <button type="button" className="admin-icon-btn" onClick={() => move(i, 1)} disabled={i === draft.length - 1} aria-label="Move down">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
              {confirming === p.pathname ? (
                <>
                  <button type="button" className="chip-btn admin-chip admin-chip-danger" onClick={() => remove(p.pathname)}>
                    Delete for good
                  </button>
                  <button type="button" className="chip-btn admin-chip" onClick={() => setConfirming(null)}>
                    Keep
                  </button>
                </>
              ) : (
                <button type="button" className="admin-icon-btn admin-icon-danger" onClick={() => setConfirming(p.pathname)} aria-label="Delete photo">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Pinned to the bottom of the viewport while there is something to save. */}
      {mounted &&
        createPortal(
          <div className={`admin-savebar${dirty ? " show" : ""}`} aria-hidden={!dirty}>
            <span className="admin-savebar-text">Unsaved changes to photo details or order.</span>
            <button type="button" className="chip-btn admin-chip" onClick={() => setDraft(saved)} disabled={saving} tabIndex={dirty ? 0 : -1}>
              Discard
            </button>
            <button type="button" className="sticker admin-sticker admin-sticker-green" onClick={save} disabled={saving} tabIndex={dirty ? 0 : -1}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
