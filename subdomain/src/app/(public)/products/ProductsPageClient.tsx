"use client";

import { useState, useMemo } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Product } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_PAGE_CONFIG } from "@/lib/subdomain";

interface ProductsPageClientProps {
  products: Product[];
}

/** Format a subcategory slug into a human-readable name */
function formatSubcategoryName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ProductsPageClient({ products }: ProductsPageClientProps) {
  const { subdomain } = useSpoke();
  const pageConfig = SUBDOMAIN_PAGE_CONFIG[subdomain];

  // Derive categories dynamically from product data
  // Start with "Semua" (All), then add tabs for each unique subcategory found in products
  const productCategories = useMemo(() => {
    const subcategorySet = new Set<string>();
    for (const p of products) {
      const sub = p.subcategory || p.category;
      if (sub) subcategorySet.add(sub);
    }

    // Keep a map of slug → display name from hardcoded config as preferred labels
    const hardcodedMap = new Map(
      pageConfig.productCategories.map((c) => [c.slug, c.name])
    );

    // Build the dynamic list: "Semua" first, then sorted unique subcategories
    const sorted = Array.from(subcategorySet).sort();
    return [
      { name: "Semua", slug: "all" },
      ...sorted.map((slug) => ({
        name: hardcodedMap.get(slug) || formatSubcategoryName(slug),
        slug,
      })),
    ];
  }, [products, pageConfig.productCategories]);

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => (p.subcategory || p.category) === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={pageConfig.productsBadge}
            title={pageConfig.productsTitle}
            description={pageConfig.productsDescription}
          />
        </div>
      </section>

      {/* Products with filter */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="mb-8"
          >
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {productCategories.map((cat) => (
                <TabsTrigger
                  key={cat.slug}
                  value={cat.slug}
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {productCategories.map((cat) => (
              <TabsContent key={cat.slug} value={cat.slug}>
                <ProductGrid products={filteredProducts} />
              </TabsContent>
            ))}
          </Tabs>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Belum ada produk dalam kategori ini.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
