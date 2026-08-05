// P2: Server component - fetch articles from Sanity (with fallback hardcoded)
import { getAllArticles } from "@/sanity/fetchers";
import { ArticlesPageClient } from "./ArticlesPageClient";

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return <ArticlesPageClient articles={articles} />;
}
