import { promises as fs } from "fs";
import path from "path";
import { BlobNotFoundError, del, head, list, put } from "@vercel/blob";

/**
 * The photo gallery's data layer.
 *
 * Photos live in a Vercel Blob store: the image files under `photos/`, and one
 * small JSON manifest beside them holding the order and captions. Blob is the
 * truth for which photos *exist*; the manifest is the truth for how they are
 * *presented*. `getPhotos()` reconciles the two, so a photo dropped into the
 * store from the Vercel dashboard still shows up (at the end, uncaptioned) and
 * one deleted there quietly disappears from the manifest.
 *
 * Without a Blob token, development falls back to a folder on disk
 * (`.photos-local/`, git-ignored) served by `app/photos-local/`, so the whole
 * gallery and admin flow can be exercised locally without touching the real
 * store. In production a missing token means the gallery is simply empty.
 */

export type Photo = {
  /** The blob pathname, e.g. `photos/tahoe-a1b2c3.jpg`. Stable and unique. */
  pathname: string;
  /** The public URL the image is served from. */
  url: string;
  caption: string;
  /** Intrinsic pixel size, or 0/0 when unknown (a dashboard upload). */
  width: number;
  height: number;
  /** ISO timestamp. */
  uploadedAt: string;
};

type Manifest = { version: 1; photos: Photo[] };

export const PHOTO_PREFIX = "photos/";
const MANIFEST_PATH = "photos-manifest.json";

/** Which store backs the gallery right now. */
export type StoreMode = "blob" | "local" | "off";

export function storeMode(): StoreMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return process.env.NODE_ENV === "development" ? "local" : "off";
}

type StoredBlob = { pathname: string; url: string; uploadedAt: string };

interface Store {
  list(prefix: string): Promise<StoredBlob[]>;
  stat(pathname: string): Promise<StoredBlob | null>;
  readText(pathname: string): Promise<string | null>;
  writeText(pathname: string, text: string): Promise<void>;
  remove(url: string): Promise<void>;
}

/* ---- Vercel Blob ---- */

const blobStore: Store = {
  async list(prefix) {
    const out: StoredBlob[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const b of page.blobs) {
        out.push({ pathname: b.pathname, url: b.url, uploadedAt: b.uploadedAt.toISOString() });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out;
  },
  async stat(pathname) {
    try {
      const b = await head(pathname);
      return { pathname: b.pathname, url: b.url, uploadedAt: b.uploadedAt.toISOString() };
    } catch (e) {
      if (e instanceof BlobNotFoundError) return null;
      throw e;
    }
  },
  async readText(pathname) {
    const b = await this.stat(pathname);
    if (!b) return null;
    // The blob CDN caches for at least a minute; a fresh query string skips
    // that so a save is visible on the very next render.
    const res = await fetch(`${b.url}?v=${Date.now()}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Reading ${pathname} failed: ${res.status}`);
    return res.text();
  },
  async writeText(pathname, text) {
    await put(pathname, text, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
  },
  async remove(url) {
    await del(url);
  },
};

/* ---- Local disk, development only ---- */

export const LOCAL_DIR = path.join(process.cwd(), ".photos-local");
export const LOCAL_URL_PREFIX = "/photos-local/";

const localStore: Store = {
  async list(prefix) {
    const dir = path.join(LOCAL_DIR, prefix);
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch {
      return [];
    }
    const out: StoredBlob[] = [];
    for (const name of names) {
      if (name.startsWith(".")) continue;
      const pathname = prefix + name;
      const st = await fs.stat(path.join(LOCAL_DIR, pathname));
      if (!st.isFile()) continue;
      out.push({ pathname, url: LOCAL_URL_PREFIX + pathname, uploadedAt: st.mtime.toISOString() });
    }
    return out;
  },
  async stat(pathname) {
    try {
      const st = await fs.stat(path.join(LOCAL_DIR, pathname));
      if (!st.isFile()) return null;
      return { pathname, url: LOCAL_URL_PREFIX + pathname, uploadedAt: st.mtime.toISOString() };
    } catch {
      return null;
    }
  },
  async readText(pathname) {
    try {
      return await fs.readFile(path.join(LOCAL_DIR, pathname), "utf8");
    } catch {
      return null;
    }
  },
  async writeText(pathname, text) {
    const file = path.join(LOCAL_DIR, pathname);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, text);
  },
  async remove(url) {
    if (!url.startsWith(LOCAL_URL_PREFIX)) return;
    const rel = url.slice(LOCAL_URL_PREFIX.length);
    await fs.rm(path.join(LOCAL_DIR, rel), { force: true });
  },
};

/** Writes a local file and returns it as a stored blob. Development only. */
export async function writeLocalFile(pathname: string, data: Uint8Array): Promise<StoredBlob> {
  const file = path.join(LOCAL_DIR, pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
  return (await localStore.stat(pathname))!;
}

const offStore: Store = {
  async list() {
    return [];
  },
  async stat() {
    return null;
  },
  async readText() {
    return null;
  },
  async writeText() {
    throw new Error("No photo store is configured (BLOB_READ_WRITE_TOKEN is not set).");
  },
  async remove() {
    throw new Error("No photo store is configured (BLOB_READ_WRITE_TOKEN is not set).");
  },
};

function store(): Store {
  const mode = storeMode();
  return mode === "blob" ? blobStore : mode === "local" ? localStore : offStore;
}

/* ---- Manifest ---- */

async function readManifest(): Promise<Manifest> {
  const text = await store().readText(MANIFEST_PATH);
  if (!text) return { version: 1, photos: [] };
  try {
    const parsed = JSON.parse(text) as Partial<Manifest>;
    if (!Array.isArray(parsed.photos)) return { version: 1, photos: [] };
    return { version: 1, photos: parsed.photos.map(normalizePhoto) };
  } catch {
    // A corrupt manifest should not take the gallery down; the photos are
    // still in the store and will be listed uncaptioned.
    return { version: 1, photos: [] };
  }
}

function normalizePhoto(p: Partial<Photo>): Photo {
  return {
    pathname: String(p.pathname ?? ""),
    url: String(p.url ?? ""),
    caption: typeof p.caption === "string" ? p.caption : "",
    width: Number.isFinite(p.width) ? Math.max(0, Math.floor(p.width as number)) : 0,
    height: Number.isFinite(p.height) ? Math.max(0, Math.floor(p.height as number)) : 0,
    uploadedAt: typeof p.uploadedAt === "string" ? p.uploadedAt : "",
  };
}

async function writeManifest(photos: Photo[]): Promise<void> {
  const manifest: Manifest = { version: 1, photos };
  await store().writeText(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/* ---- Public API ---- */

/**
 * Every photo in the store, in gallery order: the manifest's order first,
 * then anything in the store the manifest has not heard of, newest first.
 * Manifest rows whose file is gone are dropped.
 */
export async function getPhotos(): Promise<Photo[]> {
  const [manifest, blobs] = await Promise.all([readManifest(), store().list(PHOTO_PREFIX)]);
  const byPath = new Map(blobs.map((b) => [b.pathname, b]));

  const kept: Photo[] = [];
  const seen = new Set<string>();
  for (const p of manifest.photos) {
    const b = byPath.get(p.pathname);
    if (!b || seen.has(p.pathname)) continue;
    seen.add(p.pathname);
    // The URL always comes from the store, never from the manifest, so a
    // hand-edited manifest cannot point the gallery somewhere else.
    kept.push({ ...p, url: b.url, uploadedAt: p.uploadedAt || b.uploadedAt });
  }

  const extra = blobs
    .filter((b) => !seen.has(b.pathname))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map<Photo>((b) => ({ ...b, caption: "", width: 0, height: 0 }));

  return [...kept, ...extra];
}

/** What the admin is allowed to change about a photo. */
export type PhotoEdit = Pick<Photo, "pathname" | "caption" | "width" | "height">;

/**
 * Replaces the manifest with the given order and captions. Pathnames the
 * store does not hold are ignored; photos in the store but missing from the
 * edit keep their place at the end, so a stale admin tab cannot lose a photo.
 */
export async function savePhotos(edits: PhotoEdit[]): Promise<Photo[]> {
  const current = await getPhotos();
  const byPath = new Map(current.map((p) => [p.pathname, p]));
  const next: Photo[] = [];
  const seen = new Set<string>();
  for (const e of edits) {
    const p = byPath.get(e.pathname);
    if (!p || seen.has(e.pathname)) continue;
    seen.add(e.pathname);
    next.push({
      ...p,
      caption: e.caption.trim().slice(0, 500),
      width: Math.max(0, Math.floor(e.width)) || 0,
      height: Math.max(0, Math.floor(e.height)) || 0,
    });
  }
  for (const p of current) if (!seen.has(p.pathname)) next.push(p);
  await writeManifest(next);
  return next;
}

/**
 * Files a batch of freshly uploaded photos at the front of the gallery. Each
 * pathname is checked against the store, so the client cannot manifest a
 * photo that was never uploaded.
 */
export async function recordUploads(items: PhotoEdit[]): Promise<Photo[]> {
  const manifest = await readManifest();
  const added: Photo[] = [];
  for (const item of items) {
    if (!item.pathname.startsWith(PHOTO_PREFIX)) continue;
    if (manifest.photos.some((p) => p.pathname === item.pathname)) continue;
    const b = await store().stat(item.pathname);
    if (!b) continue;
    added.push({
      ...b,
      caption: item.caption.trim().slice(0, 500),
      width: Math.max(0, Math.floor(item.width)) || 0,
      height: Math.max(0, Math.floor(item.height)) || 0,
    });
  }
  const next = [...added, ...manifest.photos];
  await writeManifest(next);
  return next;
}

/** Deletes the file and drops it from the manifest. */
export async function deletePhoto(pathname: string): Promise<Photo[]> {
  const current = await getPhotos();
  const target = current.find((p) => p.pathname === pathname);
  if (target) await store().remove(target.url);
  const next = current.filter((p) => p.pathname !== pathname);
  await writeManifest(next);
  return next;
}
