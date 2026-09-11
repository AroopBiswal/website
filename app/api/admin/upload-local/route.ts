import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { isAdmin } from "@/lib/admin-auth";
import { ALLOWED_TYPES, MAX_BYTES, PHOTO_PREFIX, safePhotoName, storeMode, writeLocalFile } from "@/lib/photos";

/**
 * Development stand-in for the Blob client upload: the file is posted here
 * and written to `.photos-local/`. Refuses to run against any other store,
 * so it is a 404 in production even if someone finds it.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (storeMode() !== "local") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: `Not an accepted image type: ${file.type || "unknown"}.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is too large." }, { status: 400 });

  const base = safePhotoName(file.name);
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  const pathname = `${PHOTO_PREFIX}${stem}-${randomBytes(4).toString("hex")}${ext}`;
  const stored = await writeLocalFile(pathname, new Uint8Array(await file.arrayBuffer()));
  return NextResponse.json({ url: stored.url, pathname: stored.pathname });
}
