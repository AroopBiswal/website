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
  caption: string;
  /** Intrinsic pixel size, or 0/0 when unknown (a dashboard upload). */
  width: number;
  height: number;
  /** ISO timestamp. */
  uploadedAt: string;
};

/** What the admin is allowed to change about a photo. */
export type PhotoEdit = Pick<Photo, "pathname" | "caption" | "width" | "height">;

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
