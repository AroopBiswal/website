/**
 * The parts of the photo gallery that both the browser and the server need:
 * the types, the limits, and the name helpers. Nothing here touches the
 * store; that is lib/photos.ts, which is server-only.
 */

export type Photo = {
  /** The blob pathname, e.g. `photos/tahoe-a1b2c3.jpg`. Stable and unique. */
  pathname: string;
  /** The public URL the image is served from. */
  url: string;
  /** Short headline under the photo, e.g. "Docking at Bellagio". */
  title: string;
  caption: string;
  /** Where it was taken, free text, e.g. "Lake Como, Italy". */
  location: string;
  /** When it was taken, as "YYYY-MM", or "" when unset. */
  date: string;
  /** Intrinsic pixel size, or 0/0 when unknown (a dashboard upload). */
  width: number;
  height: number;
  /** ISO timestamp. */
  uploadedAt: string;
};

/** What the admin is allowed to change about a photo. */
export type PhotoEdit = Pick<Photo, "pathname" | "title" | "caption" | "location" | "date" | "width" | "height">;

/** Which store backs the gallery right now. */
export type StoreMode = "blob" | "local" | "off";

export const PHOTO_PREFIX = "photos/";

/** What an upload may be. Browsers cannot show HEIC, so it is not here; iOS
 *  converts to JPEG on the way out when the accept list leaves it out. */
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] as const;
export const MAX_BYTES = 50 * 1024 * 1024;

/** Where the development store serves from; the gallery skips next/image
 *  optimisation for these, since they only ever exist on localhost. */
export const LOCAL_URL_PREFIX = "/photos-local/";

/** A file name fit for a URL: lower case, ASCII, no path or query characters. */
export function safePhotoName(name: string): string {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const [stem, ext] = dot > 0 ? [lower.slice(0, dot), lower.slice(dot + 1)] : [lower, ""];
  const clean = (s: string) =>
    s
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "");
  const safeStem = clean(stem) || "photo";
  const safeExt = clean(ext);
  return safeExt ? `${safeStem}.${safeExt}` : safeStem;
}

/** A photo whose size is unknown reserves a landscape box until it loads. */
export function photoSize(p: Pick<Photo, "width" | "height">) {
  return p.width > 0 && p.height > 0 ? { width: p.width, height: p.height } : { width: 1600, height: 1200 };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-07" to "Jul 2026". Hand-rolled rather than Intl, so the server and
 *  the browser can never format it differently. */
export function formatMonth(date: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(date);
  if (!m) return "";
  const i = Number(m[2]) - 1;
  return i >= 0 && i < 12 ? `${MONTHS[i]} ${m[1]}` : "";
}

/** The small line beside a photo's title: place and month, whichever are set. */
export function photoPlace(p: Pick<Photo, "location" | "date">): string {
  return [p.location.trim(), formatMonth(p.date)].filter(Boolean).join(" · ");
}

/** Trims and bounds what the admin sends (and what an old manifest holds), so
 *  the manifest never carries junk: long text is cut, a bad date is dropped. */
export function tidyEdit(e: Partial<PhotoEdit>): Omit<PhotoEdit, "pathname"> {
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const size = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);
  const date = typeof e.date === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(e.date) ? e.date : "";
  return {
    title: text(e.title, 120),
    caption: text(e.caption, 500),
    location: text(e.location, 120),
    date,
    width: size(e.width),
    height: size(e.height),
  };
}
