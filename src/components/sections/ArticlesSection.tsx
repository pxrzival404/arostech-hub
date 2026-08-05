"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar, Clock, ArrowRight, Newspaper, User,
  Share2, CheckCircle2, Heart, ChevronLeft, ChevronRight
} from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { articles, type Article } from "@/lib/api/articles";

const categoryColors: Record<string, string> = {
  "Energi Terbarukan": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900",
  Regulasi: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900",
  Industri: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-900",
  Teknik: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-900",
  Teknologi: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-900",
};

const categoryFilters = [
  { key: "all", label: "Semua" },
  { key: "Energi Terbarukan", label: "Energi Terbarukan" },
  { key: "Regulasi", label: "Regulasi" },
  { key: "Industri", label: "Industri" },
  { key: "Teknik", label: "Teknik" },
  { key: "Teknologi", label: "Teknologi" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STORAGE_KEY = "dbsn-saved-articles";

function getInitialSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as string[]);
    }
  } catch {
    // Ignore
  }
  return new Set<string>();
}

function useSavedArticles() {
  const [savedIds, setSavedIds] = useState<Set<string>>(getInitialSavedIds);

  const toggleSave = useCallback((articleId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (articleId: string) => savedIds.has(articleId),
    [savedIds]
  );

  return { savedCount: savedIds.size, toggleSave, isSaved };
}

export default function ArticlesSection() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [copied, setCopied] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { savedCount, toggleSave, isSaved } = useSavedArticles();

  const filtered = useMemo(() => {
    let result = activeCategory === "all" ? articles : articles.filter((a) => a.category === activeCategory);
    if (showSavedOnly) {
      result = result.filter((a) => isSaved(a.id));
    }
    return result;
  }, [activeCategory, showSavedOnly, isSaved]);

  const handleShare = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/artikel/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [filtered, emblaApi]);

  return (
    <section id="artikel" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 mb-4">
              <Newspaper className="w-3.5 h-3.5 mr-1.5" />Artikel &amp; Berita
            </Badge>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <h2 className="section-heading mb-0">Artikel &amp; Berita Terbaru</h2>
              {savedCount > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-medium gap-1">
                  <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" /> Tersimpan: {savedCount}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-2">
              Informasi terkini seputar infrastruktur kelistrikan dan perkembangan energi terbarukan di Indonesia
            </p>
          </div>
        </ScrollReveal>

        {/* Saved / All Toggle */}
        {savedCount > 0 && (
          <ScrollReveal delay={0.03}>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center rounded-lg border border-emerald-200 dark:border-emerald-800 bg-slate-50 dark:bg-gray-800 p-1">
                <button onClick={() => setShowSavedOnly(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] cursor-pointer ${!showSavedOnly ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
                  Semua
                </button>
                <button onClick={() => setShowSavedOnly(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] flex items-center gap-1.5 cursor-pointer ${showSavedOnly ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
                  <Heart className={`w-3.5 h-3.5 ${showSavedOnly ? "fill-emerald-500 text-emerald-500" : ""}`} />
                  Tersimpan ({savedCount})
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Category Filters */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categoryFilters.map((f) => (
              <Button key={f.key} variant={activeCategory === f.key ? "default" : "outline"} onClick={() => setActiveCategory(f.key)}
                className={activeCategory === f.key ? "bg-emerald-700 hover:bg-emerald-800 text-white min-h-[44px] px-4 text-xs font-semibold shadow-sm" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/20 min-h-[44px] px-4 text-xs font-semibold"}>
                {f.label}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Horizontal Carousel */}
        <ScrollReveal delay={0.1} className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 pb-4">
              {filtered.map((article) => {
                const saved = isSaved(article.id);
                return (
                  <div key={article.slug} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 h-full">
                    <Card className={`relative border transition-all duration-300 group overflow-hidden h-full dark:bg-gray-800 flex flex-col justify-between cursor-pointer ${saved ? "border-emerald-400 dark:border-emerald-500 shadow-emerald-100 dark:shadow-emerald-950/30 shadow-md" : "border-emerald-100 dark:border-emerald-850 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700"}`}
                      onClick={() => setSelectedArticle(article)}>
                      
                      {/* Bookmark button */}
                      <button onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                        className="absolute top-3 right-3 z-10 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-110 cursor-pointer"
                        aria-label={saved ? "Hapus dari tersimpan" : "Simpan artikel"}>
                        <Heart className={`w-4 h-4 transition-colors ${saved ? "fill-emerald-500 text-emerald-500" : "text-gray-400 hover:text-emerald-500"}`} />
                      </button>

                      {/* Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 dark:from-emerald-950/20 dark:via-emerald-900/10 dark:to-amber-900/10 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]" style={{ backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 8px, #047857 8px, #047857 9px)` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-emerald-300 dark:text-emerald-700" />
                        </div>
                        <Badge className={`absolute top-3 left-3 ${categoryColors[article.category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                          {article.category}
                        </Badge>
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
                          <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{article.readingTime} menit baca</span>
                        </div>
                      </div>

                      {/* Content - Compact, NO EXCERPT */}
                      <CardContent className="p-5 flex flex-col flex-1 justify-between gap-4">
                        <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors min-h-[40px]">
                          {article.title}
                        </h4>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-emerald-50 dark:border-emerald-900/50 mt-auto shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                            Baca <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </CardContent>

                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls (Desktop) */}
          <div className="hidden sm:flex items-center justify-between absolute top-1/2 -translate-y-1/2 -left-4 -right-4 pointer-events-none w-[calc(100%+32px)]">
            <Button
              variant="outline"
              size="icon"
              className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all pointer-events-auto min-h-[40px] ${!prevBtnEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all pointer-events-auto min-h-[40px] ${!nextBtnEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </Button>
          </div>
        </ScrollReveal>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {showSavedOnly ? "Belum ada artikel tersimpan." : "Belum ada artikel untuk kategori ini."}
            </p>
            <Button variant="outline" className="mt-4 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
              onClick={() => { setShowSavedOnly(false); setActiveCategory("all"); }}>
              Tampilkan Semua
            </Button>
          </div>
        )}

      </div>

      {/* Article Detail Dialog (Quick Preview) */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="max-w-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-lg" />
            <DialogHeader>
              <Badge className={`w-fit ${categoryColors[selectedArticle.category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"} mb-2`}>
                {selectedArticle.category}
              </Badge>
              <DialogTitle className="text-emerald-950 dark:text-emerald-100 text-lg sm:text-xl font-bold leading-snug">
                {selectedArticle.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                {selectedArticle.author && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-emerald-600" />{selectedArticle.author}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" />{formatDate(selectedArticle.publishedAt)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" />{selectedArticle.readingTime} menit baca</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm leading-relaxed">
              <p className="text-gray-600 dark:text-gray-300">{selectedArticle.excerpt}</p>
              
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" size="sm"
                  className={`gap-1.5 min-h-[40px] border-emerald-200 dark:border-emerald-800 text-xs ${isSaved(selectedArticle.id) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "text-emerald-700 hover:bg-emerald-50"}`}
                  onClick={() => toggleSave(selectedArticle.id)}>
                  <Heart className={`w-3.5 h-3.5 ${isSaved(selectedArticle.id) ? "fill-emerald-500" : ""}`} />
                  {isSaved(selectedArticle.id) ? "Tersimpan" : "Simpan"}
                </Button>

                <Button variant="outline" size="sm" className="gap-1.5 min-h-[40px] border-emerald-200 dark:border-emerald-800 text-emerald-700 hover:bg-emerald-50 text-xs"
                  onClick={() => handleShare(selectedArticle.slug)}>
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tautan Disalin!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Bagikan
                    </>
                  )}
                </Button>
              </div>

              <Link href={`/artikel/${selectedArticle.slug}`} onClick={() => setSelectedArticle(null)} className="block pt-2">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white min-h-[48px] gap-2 font-semibold">
                  Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
