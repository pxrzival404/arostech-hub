"use client";

import { useState, useMemo } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, FileSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Article } from "@/types";
import { useSpoke } from "@/components/SpokeProvider";
import { SUBDOMAIN_PAGE_CONFIG } from "@/lib/subdomain";

const ITEMS_PER_PAGE = 9;

interface ArticlesPageClientProps {
  articles: Article[];
}

export function ArticlesPageClient({ articles }: ArticlesPageClientProps) {
  const { subdomain } = useSpoke();
  const pageConfig = SUBDOMAIN_PAGE_CONFIG[subdomain];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique tags from articles
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // Filter articles based on search query and selected tag
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Search filter: matches title, excerpt, or content
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTag = !selectedTag || article.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [articles, searchQuery, selectedTag]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedTag !== null;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setCurrentPage(1);
  };

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/30 dark:to-background py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={pageConfig.articlesBadge}
            title={pageConfig.articlesTitle}
            description={pageConfig.articlesDescription}
          />
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari artikel berdasarkan judul, isi, atau penulis..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Tag Filter — Tabs style like Products page */}
          <Tabs
            value={selectedTag ?? "all"}
            onValueChange={(val) => handleTagChange(val === "all" ? null : val)}
            className="mt-6 mb-8"
          >
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Semua
              </TabsTrigger>
              {allTags.map((tag) => (
                <TabsTrigger
                  key={tag}
                  value={tag}
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white capitalize"
                >
                  {tag.replace(/-/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-12 lg:pb-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{filteredArticles.length}</span> dari {articles.length} artikel
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
                Hapus Filter
              </Button>
            </div>
          )}
          {filteredArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)} dari {filteredArticles.length} artikel
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex size-20 rounded-full bg-muted/50 items-center justify-center mb-4">
                <FileSearch className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Tidak Ada Artikel Ditemukan
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau pilih tag yang berbeda
                untuk menemukan artikel yang Anda cari.
              </p>
              <Button
                onClick={clearFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <X className="size-4" />
                Reset Pencarian
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
