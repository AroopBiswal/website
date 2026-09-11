import type { Metadata } from "next";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { getPhotos, storeMode } from "@/lib/photos";
import LoginForm from "./login-form";
import AdminPanel from "./panel";
import { logout } from "./actions";

// Reads the session cookie, so it can never be static.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Aroop Biswal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <>
        <h1 className="blog-masthead">Admin</h1>
        <p className="blog-empty">
          The admin is switched off: set <code>ADMIN_PASSWORD</code> in the environment to turn it on.
        </p>
      </>
    );
  }

  if (!(await isAdmin())) {
    return (
      <>
        <h1 className="blog-masthead">Admin</h1>
        <LoginForm />
      </>
    );
  }

  const mode = storeMode();
  if (mode === "off") {
    return (
      <>
        <h1 className="blog-masthead">Admin</h1>
        <p className="blog-empty">
          No photo store is connected: set <code>BLOB_READ_WRITE_TOKEN</code> (connect a Blob store to the Vercel project) to turn uploads on.
        </p>
      </>
    );
  }

  const photos = await getPhotos();

  return (
    <>
      <div className="admin-head">
        <h1 className="blog-masthead admin-masthead">Photos admin</h1>
        <form action={logout}>
          <button className="chip-btn admin-chip" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <AdminPanel initial={photos} mode={mode} />
    </>
  );
}
