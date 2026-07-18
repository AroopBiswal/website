import Site from "./components/site";
import { getWork, getProjects } from "@/lib/notion";

// Bake content into static HTML at build time. No ISR, no revalidate, no
// runtime fetching — content only changes on redeploy.
export const dynamic = "force-static";

export default async function Home() {
  const [work, projects] = await Promise.all([getWork(), getProjects()]);
  return <Site work={work} projects={projects} />;
}
