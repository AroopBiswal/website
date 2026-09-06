import type { Metadata } from "next";
import Game from "./game";

// Nothing here depends on build-time data; the whole game runs in the browser.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Alligator · Aroop Biswal",
  description: "Press the teeth. One of them is the trap. Don't press that one.",
};

export default function AlligatorPage() {
  return <Game />;
}
