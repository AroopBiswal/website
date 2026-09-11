"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { deletePhoto, recordUploads, savePhotos } from "@/lib/photos";
import type { Photo, PhotoEdit } from "@/lib/photos-shared";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    // A wrong guess costs a moment. Not a rate limit, but it makes a brute
    // force through this form slow enough to be pointless.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That is not the password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin");
}

/**
 * Files a batch the browser has just uploaded. Every write to the gallery
 * ends by revalidating /photos, which is what lets the page stay cached
 * between edits and still show a change within seconds.
 */
export async function recordUploadsAction(items: PhotoEdit[]): Promise<Photo[]> {
  await requireAdmin();
  const photos = await recordUploads(items);
  revalidatePath("/photos");
  return photos;
}

/** Writes the order and captions the admin has arranged. */
export async function savePhotosAction(edits: PhotoEdit[]): Promise<Photo[]> {
  await requireAdmin();
  const photos = await savePhotos(edits);
  revalidatePath("/photos");
  return photos;
}

/** Removes the file from the store and the row from the manifest. */
export async function deletePhotoAction(pathname: string): Promise<Photo[]> {
  await requireAdmin();
  const photos = await deletePhoto(pathname);
  revalidatePath("/photos");
  return photos;
}

/**
 * Rebuilds the public /photos page from the store right now, without a
 * redeploy. Every save and upload already does this; the button is for
 * changes made somewhere else, like deleting a file in the Vercel dashboard.
 */
export async function refreshGalleryAction(): Promise<void> {
  await requireAdmin();
  revalidatePath("/photos");
}
