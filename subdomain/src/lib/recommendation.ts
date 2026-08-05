import { Article, Product } from "@/types";

/**
 * Rekomendasi artikel berdasarkan tag yang sama
 * @param currentArticle Artikel yang sedang dilihat
 * @param allArticles Daftar semua artikel
 * @param limit Jumlah rekomendasi yang diinginkan
 */
export function getRelatedArticles(
  currentArticle: Article,
  allArticles: Article[],
  limit: number = 3
): Article[] {
  // Hitung skor berdasarkan jumlah tag yang sama
  const scored = allArticles
    .filter((a) => a.id !== currentArticle.id) // Exclude current article
    .map((a) => {
      const sharedTags = a.tags.filter((tag) =>
        currentArticle.tags.includes(tag)
      ).length;
      // Bonus jika kategori sama
      const sameCategory = a.category === currentArticle.category ? 1 : 0;
      return {
        article: a,
        score: sharedTags * 2 + sameCategory,
      };
    })
    .filter((item) => item.score > 0) // Hanya yang punya relevansi
    .sort((a, b) => {
      // Sort by score desc, then by date desc
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.article.publishedAt).getTime() -
        new Date(a.article.publishedAt).getTime()
      );
    })
    .slice(0, limit)
    .map((item) => item.article);

  // Jika rekomendasi kurang dari limit, isi dengan artikel terbaru lainnya
  if (scored.length < limit) {
    const existingIds = new Set([
      currentArticle.id,
      ...scored.map((a) => a.id),
    ]);
    const fallback = allArticles
      .filter((a) => !existingIds.has(a.id))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, limit - scored.length);

    return [...scored, ...fallback];
  }

  return scored;
}

/**
 * Rekomendasi produk berdasarkan tag/subkategori yang sama
 * @param currentProduct Produk yang sedang dilihat
 * @param allProducts Daftar semua produk
 * @param limit Jumlah rekomendasi yang diinginkan
 */
export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 3
): Product[] {
  // Hitung skor berdasarkan jumlah tag yang sama
  const scored = allProducts
    .filter((p) => p.id !== currentProduct.id) // Exclude current product
    .map((p) => {
      const sharedTags = p.tags.filter((tag) =>
        currentProduct.tags.includes(tag)
      ).length;
      // Bonus jika subkategori sama
      const sameSubcategory =
        p.subcategory === currentProduct.subcategory ? 3 : 0;
      return {
        product: p,
        score: sharedTags * 2 + sameSubcategory,
      };
    })
    .filter((item) => item.score > 0) // Hanya yang punya relevansi
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);

  // Jika rekomendasi kurang dari limit, isi dengan produk highlight lainnya
  if (scored.length < limit) {
    const existingIds = new Set([
      currentProduct.id,
      ...scored.map((p) => p.id),
    ]);
    const fallback = allProducts
      .filter((p) => !existingIds.has(p.id))
      .sort((a, b) => Number(b.isHighlight) - Number(a.isHighlight))
      .slice(0, limit - scored.length);

    return [...scored, ...fallback];
  }

  return scored;
}
