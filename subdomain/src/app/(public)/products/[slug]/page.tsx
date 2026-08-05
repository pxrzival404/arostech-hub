import { notFound } from "next/navigation";
// P2: Pakai Sanity-first fetcher (dengan fallback hardcoded otomatis)
import { getProductBySlug, getRelatedProducts } from "@/sanity/fetchers";
import { ProductDetailClient } from "./ProductDetailClient";

// Force dynamic rendering for product detail pages
// This ensures fresh data after Studio publishes
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // P2: pakai Sanity fetcher untuk related products (filter by tags, exclude current)
  const relatedProducts = await getRelatedProducts(slug, product.tags);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
