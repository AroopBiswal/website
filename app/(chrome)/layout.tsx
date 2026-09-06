import { ReactNode } from "react";
import PageShell from "../components/page-shell";

/**
 * The blog and the alligator share this layout, which is the point: Next keeps
 * a layout mounted across navigations inside it, so moving between them leaves
 * the header alone. Its arrival animation only runs when you come in from the
 * home page, which is the only time the header actually changes state.
 */
export default function ChromeLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
