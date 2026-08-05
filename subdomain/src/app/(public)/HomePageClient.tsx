"use client";

import { useState, useEffect } from "react";
import React from "react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContactBanner } from "@/components/common/ContactBanner";
import { StatCard } from "@/components/common/StatCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, Article, CompanyInfo } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_HERO_CONFIG, SUBDOMAIN_HERO_IMAGES, type Subdomain } from "@/lib/subdomain";

const certData = [
  { name: "SNI", image: "/images/cert-sni.png", description: "Standar Nasional Indonesia - Produk memenuhi standar keselamatan dan kinerja nasional" },
  { name: "TKDN", image: "/images/cert-tkdn.png", description: "Tingkat Komponen Dalam Negeri - Mengutamakan komponen produksi dalam negeri" },
];

interface HomePageClientProps {
  highlightProducts: Product[];
  latestArticles: Article[];
  companyInfo: CompanyInfo;
  sanityHeroImages?: string[];
}

export function HomePageClient({
  highlightProducts,
  latestArticles,
  companyInfo,
  sanityHeroImages,
}: HomePageClientProps) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const { subdomain, brandName } = useSpoke();
  const heroConfig = SUBDOMAIN_HERO_CONFIG[subdomain];
  // Use Sanity hero images if available, fallback to static files
  const heroImages = sanityHeroImages && sanityHeroImages.length > 0
    ? sanityHeroImages
    : SUBDOMAIN_HERO_IMAGES[subdomain];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
        {/* Layer 1 (bottom): Green background */}
        <div className="absolute inset-0 bg-emerald-700" />

        {/* Layer 2 (middle): Background slideshow images at 30% opacity (70% transparent) */}
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === currentHeroIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <Image src={img} alt="" fill className="object-cover opacity-30" priority={i === 0} />
          </div>
        ))}

        {/* Layer 3 (top): Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-emerald-500/30 text-emerald-100 border-emerald-400/30 hover:bg-emerald-500/40">
              {heroConfig.badge}
            </Badge>

            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {heroConfig.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h1>

            <p className="mt-6 text-lg text-emerald-50 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              {heroConfig.description}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base px-8"
                asChild
              >
                <Link href="/products">
                  Lihat Produk
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white/60 text-white hover:bg-white/15 hover:border-white text-base px-8"
                asChild
              >
                <Link href="/rfq">
                  Ajukan Penawaran
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            <StatCard value={String(companyInfo.stats?.projectsCompleted ?? 500)} suffix="+" label="Proyek Selesai" />
            <StatCard value={String(companyInfo.stats?.yearsExperience ?? 15)} suffix="+" label="Tahun Pengalaman" />
            <StatCard value={String(companyInfo.stats?.citiesCovered ?? 30)} suffix="+" label="Kota Terjangkau" />
          </motion.div>
        </div>
      </section>

      {/* Product Highlight Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Produk Unggulan"
            title={heroConfig.sectionHeading}
            description={heroConfig.sectionDescription}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlightProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">
                Lihat Semua Produk
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Article Highlight Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Artikel"
            title={heroConfig.articleHeading}
            description={heroConfig.articleDescription}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/articles">
                Lihat Semua Artikel
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top row: paragraph left + visi misi right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-4 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              >
                Tentang Kami
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {heroConfig.aboutHeading}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {companyInfo.companyDescription}
              </p>

              <div className="mt-8">
                <Button variant="outline" asChild>
                  <Link href="/about">
                    Selengkapnya
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Vision & Mission - right side, aligned with paragraph not heading */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="space-y-4 lg:mt-[3.75rem]"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                  <Eye className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Visi</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {companyInfo.vision}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                  <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Misi</h3>
                  <ul className="mt-1 space-y-1">
                    {companyInfo.mission.slice(0, 3).map((m) => (
                      <li
                        key={m}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-emerald-500 mt-1">&#8226;</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Certifications - wider rectangular boxes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
          >
            {certData.map((cert) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 p-5 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="size-16 rounded-lg overflow-hidden flex items-center justify-center bg-white p-2 shrink-0">
                  <Image src={cert.image} alt={cert.name} width={52} height={52} className="object-contain" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <ContactBanner />
    </>
  );
}
