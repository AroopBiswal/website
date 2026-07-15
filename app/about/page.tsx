import { redirect } from "next/navigation";

// The old /about page is now the About tab on the single-page site.
export default function AboutPage() {
  redirect("/#about");
}
