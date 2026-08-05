import { notFound } from "next/navigation";
// P2: Pakai Sanity-first fetcher
import { getProjectBySlug } from "@/sanity/fetchers";
import { ProjectDetailClient } from "./ProjectDetailClient";

// Force dynamic rendering for portfolio detail pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
