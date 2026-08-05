"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const subcategoryIcons: Record<string, string> = {
  "PJU LED": "💡",
  "PJU Tenaga Surya": "☀️",
  "Smart PJU": "🔌",
};

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export function RelatedProducts({
  products,
  title = "Produk Terkait",
}: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/products/${product.slug}`} className="block group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Image (dari Sanity) atau fallback emoji */}
                  <div className="aspect-square rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 flex items-center justify-center mb-4 overflow-hidden relative">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-6xl">
                        {subcategoryIcons[product.subcategory] || "💡"}
                      </span>
                    )}
                  </div>

                  <Badge className="mb-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800">
                    {product.subcategory}
                  </Badge>

                  <h4 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                    {product.name}
                  </h4>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <ul className="space-y-1">
                    {product.highlights.slice(0, 2).map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-1.5 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
