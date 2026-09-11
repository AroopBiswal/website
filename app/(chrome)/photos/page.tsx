import type { Metadata } from "next";
import { getPhotos } from "@/lib/photos";
import Gallery from "./gallery";

// Unlike the rest of the site, this page's data changes without a deploy: the
// admin page uploads photos and then calls revalidatePath("/photos"). The hour
// is only a backstop for a photo dropped straight into the store.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Photography · Aroop Biswal",
  description: "Photography by Aroop Biswal.",
};

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <>
      <div className="panel-head photos-head">
        <h1 className="panel-title">Photography</h1>
      </div>
      {photos.length === 0 ? (
        <p className="blog-empty">No photos yet — the camera roll is on its way.</p>
      ) : (
        <Gallery photos={photos} />
      )}
    </>
  );
}
