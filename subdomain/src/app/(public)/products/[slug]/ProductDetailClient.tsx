"use client";

import { useState } from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import { useSpoke } from "@/components/SpokeProvider";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToRFQModal } from "@/components/rfq/AddToRFQModal";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import {
  ArrowLeft,
  Download,
  Lightbulb,
  Sun,
  Cpu,
  Battery,
  BatteryCharging,
  Zap,
  Shield,
  Plug,
  CheckCircle2,
  FolderOpen,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Per-subdomain subcategory icons — falls back to subdomain default icon
const subcategoryIcons: Record<string, React.ElementType> = {
  // PJU subcategories
  "PJU LED": Lightbulb,
  "PJU Tenaga Surya": Sun,
  "Smart PJU": Cpu,
  // Baterai subcategories
  "baterai-12v": Battery,
  "ups": Plug,
  "battery-charger": BatteryCharging,
  // Solar Panel subcategories
  "solarpanel-kecil": Sun,
  "solarpanel-besar": Sun,
  "solar-charge-controller": Plug,
  // Penangkal Petir subcategories
  "kurn": Shield,
  "viking": Shield,
  "erico": Shield,
  "lpi-guardian": Shield,
  "thomas": Shield,
  "ef": Shield,
  "aksesoris-petir": Zap,
};

// Default icon per subdomain
const subdomainDefaultIcons: Record<string, React.ElementType> = {
  pju: Lightbulb,
  baterai: Battery,
  solarpanel: Sun,
  penangkalpetir: Shield,
};

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const Icon = subcategoryIcons[product.subcategory] || subdomainDefaultIcons[product.category] || Lightbulb;
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { subdomain } = useSpoke();

  const hasImages = product.images && product.images.length > 0 && product.images[0];
  const activeImage = hasImages ? product.images[activeImageIdx] : null;

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Produk
          </Link>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image (dari Sanity) atau fallback icon */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 flex items-center justify-center border overflow-hidden relative">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <Icon className="size-32 text-emerald-300 dark:text-emerald-600" />
                )}
              </div>
              {/* Thumbnail gallery (jika ada lebih dari 1 gambar) */}
              {hasImages && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors relative ${
                        idx === activeImageIdx
                          ? "border-emerald-600"
                          : "border-transparent hover:border-emerald-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <Badge className="mb-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800">
                  {product.subcategory}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                  {product.name}
                </h1>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Highlights */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Keunggulan
                </h3>
                <ul className="space-y-2">
                  {product.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  size="lg"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  asChild
                >
                  <Link href={`/rfq?product=${product.slug}`}>
                    <Send className="size-4" />
                    Ajukan Penawaran Langsung
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setRfqModalOpen(true)}
                >
                  <FolderOpen className="size-4" />
                  Tambah ke Draft RFQ
                </Button>
              </div>

              {/* Show "Unduh Spesifikasi" button if product has specs, manual content, or an uploaded file */}
              {(
                (product.specifications && product.specifications.length > 0) ||
                product.specificationFileUrl ||
                product.specificationManualContent
              ) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  asChild
                >
                  <a href={`/api/spec-pdf/${product.slug}?subdomain=${subdomain}`} target="_blank" rel="noopener noreferrer">
                    <Download className="size-4" />
                    Unduh Spesifikasi
                  </a>
                </Button>
              )}
            </motion.div>
          </div>

          {/* Specifications Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Spesifikasi Teknis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={spec.label}
                      className={`flex items-center py-3 ${
                        index % 2 === 0 ? "bg-muted/30" : ""
                      } rounded px-4`}
                    >
                      <span className="font-medium text-foreground w-1/3">
                        {spec.label}
                      </span>
                      <span className="text-muted-foreground w-2/3">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              >
                {tag}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Add to RFQ Modal */}
      <AddToRFQModal
        open={rfqModalOpen}
        onOpenChange={setRfqModalOpen}
        product={product}
      />

      {/* Related Products */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      </section>
    </div>
  );
}
