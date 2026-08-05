// P2: Server component - fetch products from Sanity (with fallback hardcoded)
import { getAllProducts } from "@/sanity/fetchers";
import { ProductsPageClient } from "./ProductsPageClient";

// Force dynamic rendering to ensure fresh product data (including new subcategories)
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return <ProductsPageClient products={products} />;
}
