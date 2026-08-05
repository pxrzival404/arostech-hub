// P2: Server component - fetch projects from Sanity (with fallback hardcoded)
import { getAllProjects } from "@/sanity/fetchers";
import { PortfolioPageClient } from "./PortfolioPageClient";

export default async function PortfolioPage() {
  const projects = await getAllProjects();

  return <PortfolioPageClient projects={projects} />;
}
