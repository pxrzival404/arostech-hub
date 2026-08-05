"use client";

import { useState, useMemo } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar, Building2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_PAGE_CONFIG } from "@/lib/subdomain";

const ITEMS_PER_PAGE = 6;

const scaleOptions = ["Semua", "Kecil", "Menengah", "Besar"] as const;

interface PortfolioPageClientProps {
  projects: Project[];
}

export function PortfolioPageClient({ projects }: PortfolioPageClientProps) {
  const { subdomain } = useSpoke();
  const pageConfig = SUBDOMAIN_PAGE_CONFIG[subdomain];
  const categoryOptions = pageConfig.portfolioCategoryOptions as readonly string[];

  const [selectedScale, setSelectedScale] = useState<string>("Semua");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesScale = selectedScale === "Semua" || p.projectScale === selectedScale;
      const matchesCategory = selectedCategory === "Semua" || p.productCategory === selectedCategory;
      return matchesScale && matchesCategory;
    });
  }, [projects, selectedScale, selectedCategory]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));

  // Reset to page 1 when filters change
  const handleScaleChange = (scale: string) => {
    setSelectedScale(scale);
    setCurrentPage(1);
  };
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={pageConfig.portfolioBadge}
            title={pageConfig.portfolioTitle}
            description={pageConfig.portfolioDescription}
          />
        </div>
      </section>

      {/* Filters & Projects */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="space-y-4 mb-10">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground mr-1">Kategori:</span>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "text-sm font-medium transition-colors cursor-pointer",
                    selectedCategory === cat
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scale Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground mr-1">Skala:</span>
              {scaleOptions.map((scale) => (
                <button
                  key={scale}
                  onClick={() => handleScaleChange(scale)}
                  className={cn(
                    "text-sm font-medium transition-colors cursor-pointer",
                    selectedScale === scale
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {filteredProjects.length}
              </span>{" "}
              dari {projects.length} proyek
            </p>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={`/portfolio/${project.slug}`} className="block group">
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Cover image (dari Sanity) atau fallback icon */}
                        <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center relative overflow-hidden">
                          {project.coverImage ? (
                            <Image
                              src={project.coverImage}
                              alt={project.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Building2 className="size-16 text-emerald-300 dark:text-emerald-700" />
                          )}
                          {project.isHighlight && (
                            <Badge className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Sparkles className="size-3 mr-1" />
                              Highlight
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800">
                              {project.productCategory}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.projectScale}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                            {project.title}
                          </h3>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {project.description}
                          </p>

                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 shrink-0" />
                              <span className="truncate">{project.client}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 shrink-0" />
                              <span className="truncate">{project.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 shrink-0" />
                              <span>{project.year} • {project.duration}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                            Lihat Detail
                            <ArrowRight className="size-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} dari {filteredProjects.length} proyek
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Hal {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Tidak ada proyek dengan filter ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
