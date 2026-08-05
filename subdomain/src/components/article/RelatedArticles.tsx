"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { Article } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface RelatedArticlesProps {
  articles: Article[];
  title?: string;
}

export function RelatedArticles({
  articles,
  title = "Artikel Terkait",
}: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={`/articles/${article.slug}`} className="block group">
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Cover (dari Sanity) atau fallback letter */}
                  <div className="aspect-[16/10] rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center mb-3 overflow-hidden relative">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-emerald-200 dark:text-emerald-700 select-none">
                        {article.title.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 capitalize"
                      >
                        {tag.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>

                  <h4 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h4>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(article.publishedAt).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {article.readingTime} mnt
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
