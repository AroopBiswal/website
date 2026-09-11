import { promises as fs } from "fs";
import path from "path";
import { LOCAL_DIR, storeMode } from "@/lib/photos";

/**
 * Serves the development photo store (`.photos-local/`). Only answers when
 * the gallery is running against local disk, which never happens in
 * production, where this route is a plain 404.
 */

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".json": "application/json",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (storeMode() !== "local") return new Response("Not found", { status: 404 });

  const { path: parts } = await ctx.params;
  const rel = path.posix.normalize(parts.join("/"));
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return new Response("Not found", { status: 404 });
  }
  const file = path.join(LOCAL_DIR, rel);
  try {
    const data = await fs.readFile(file);
    const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    return new Response(data, {
      headers: { "content-type": type, "cache-control": "no-store" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
