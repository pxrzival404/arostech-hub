// P2: Server component - fetch data from Sanity (with fallback hardcoded)
// Hanya halaman yang butuh data Sanity-first yang di-fetch di sini.
// Komponen interaktif (animation, dll) dipindah ke HomePageClient.tsx.

import {
  getHighlightProducts,
  getHighlightArticles,
  getCompanyInfo,
  getSpokeConfig,
} from "@/sanity/fetchers";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  // Fetch parallel untuk efisiensi
  const [highlightProducts, latestArticles, companyInfo, spokeConfig] = await Promise.all([
    getHighlightProducts(),
    getHighlightArticles(),
    getCompanyInfo(),
    getSpokeConfig(),
  ]);

  return (
    <HomePageClient
      highlightProducts={highlightProducts}
      latestArticles={latestArticles}
      companyInfo={companyInfo}
      sanityHeroImages={spokeConfig?.heroImages}
    />
  );
}
