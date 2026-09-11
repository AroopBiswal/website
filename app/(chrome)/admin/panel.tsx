"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ALLOWED_TYPES, LOCAL_URL_PREFIX, MAX_BYTES, PHOTO_PREFIX, photoSize, safePhotoName, type Photo, type PhotoEdit, type StoreMode } from "@/lib/photos-shared";
import { recordUploadsAction } from "./actions";

type Queued = {
  id: number;
  file: File;
  status: "waiting" | "uploading" | "done" | "failed";
  progress: number;
  error?: string;
};

/** Reads a file's pixel size in the browser, or 0/0 if it cannot be decoded. */
async function measure(file: File): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  } catch {
    return { width: 0, height: 0 };
  }
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

let nextId = 1;

export default function AdminPanel({ initial, mode }: { initial: Photo[]; mode: StoreMode }) {
  const [photos, setPhotos] = useState(initial);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

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
    const landed: PhotoEdit[] = [];
    for (const item of waiting) {
      patch(item.id, { status: "uploading", progress: 0 });
      try {
        const [{ pathname }, size] = await Promise.all([
          send(item.file, mode, (pct) => patch(item.id, { progress: pct })),
          measure(item.file),
        ]);
        landed.push({ pathname, caption: "", ...size });
        patch(item.id, { status: "done", progress: 100 });
      } catch (e) {
        patch(item.id, { status: "failed", error: (e as Error).message });
      }
    }
    if (landed.length > 0) {
      try {
        setPhotos(await recordUploadsAction(landed));
        // The uploads are filed; only the failures are worth keeping in view.
        setQueue((q) => q.filter((item) => item.status === "failed"));
      } catch (e) {
        setQueue((q) => q.map((item) => (item.status === "done" ? { ...item, status: "failed", error: `Uploaded, but not filed: ${(e as Error).message}` } : item)));
      }
    }
    setBusy(false);
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

      <p className="admin-note">
        {photos.length} photo{photos.length === 1 ? "" : "s"} in the{" "}
        {mode === "blob" ? "Blob store" : "local folder (.photos-local)"}. Newest first.
      </p>

      <ul className="admin-list">
        {photos.map((p) => (
          <li key={p.pathname} className="admin-row">
            <Image src={p.url} alt="" {...photoSize(p)} sizes="120px" className="admin-thumb" unoptimized={p.url.startsWith(LOCAL_URL_PREFIX)} />
            <div className="admin-row-body">
              <div className="admin-row-caption">{p.caption || <span className="admin-muted">No caption</span>}</div>
              <div className="admin-row-meta">
                {p.pathname.slice(PHOTO_PREFIX.length)}
                {p.width > 0 && ` · ${p.width}×${p.height}`}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
