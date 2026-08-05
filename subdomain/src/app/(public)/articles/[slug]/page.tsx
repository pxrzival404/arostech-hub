import { notFound } from "next/navigation";
// P2: Pakai Sanity-first fetcher
import {
  getArticleBySlug,
  getAllArticles,
  getCompanyInfo,
} from "@/sanity/fetchers";
import { getRelatedArticles } from "@/lib/recommendation";
import { ArticleDetailClient } from "./ArticleDetailClient";

// Force dynamic rendering for article detail pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const [article, allArticles, companyData] = await Promise.all([
    getArticleBySlug(slug),
    getAllArticles(),
    getCompanyInfo(),
  ]);

  if (!article) {
    notFound();
  }

  const recentArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const relatedArticles = getRelatedArticles(article, allArticles, 3);

  return (
    <ArticleDetailClient
      article={article}
      recentArticles={recentArticles}
      relatedArticles={relatedArticles}
      companyDescription={companyData.companyDescription.substring(0, 150)}
    />
  );
}
