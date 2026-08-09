import type { Metadata } from "next";
import AboutView from "../components/about-view";

export const metadata: Metadata = {
  title: "About · Aroop Biswal",
  description:
    "A bit about Aroop Biswal — interests, photos, and the short version at a glance.",
};

export default function AboutPage() {
  return <AboutView />;
}
