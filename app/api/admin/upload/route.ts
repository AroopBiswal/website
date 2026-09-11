import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { ALLOWED_TYPES, MAX_BYTES, PHOTO_PREFIX } from "@/lib/photos";

/**
 * The token exchange behind browser uploads to Vercel Blob. The file itself
 * never passes through here (a Vercel function body is capped at 4.5MB, a
 * phone photo is often bigger): the browser asks this route for a short-lived
 * upload token, and this route hands one out only to a signed-in admin, only
 * for an image, only under `photos/`. The write token stays on the server.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // Checked here as well as inside the callback, so an anonymous request is
  // turned away before the SDK does any work. The upload-completed callback
  // comes from Vercel, without a cookie, and is verified by the SDK itself.
  if (body.type === "blob.generate-client-token" && !(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Not signed in.");
        if (!pathname.startsWith(PHOTO_PREFIX) || pathname.includes("..")) {
          throw new Error("Photos go under photos/.");
        }
        return {
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      // Vercel calls this back after the upload lands, but it cannot reach a
      // dev server and the browser already reports the result, so the client
      // records the photo through a server action instead.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
