import type { Metadata } from "next";
import Calculator from "./calculator";

// Nothing here depends on build-time data, so it ships as static HTML and the
// calculation runs entirely in the browser.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Janine's End Date Calculator",
  description:
    "Work out the Friday that closes a 16 week term, skipping any week with a holiday in it.",
};

export default function J9CalculatorPage() {
  return <Calculator />;
}
