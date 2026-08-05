"use client";

import { SpokeLink as Link } from "@/components/SpokeLink";
import Image from "next/image";
import { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 py-0 gap-0">
      {/* Cover image (dari Sanity) atau fallback letter */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center overflow-hidden">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-4xl font-bold text-emerald-200 dark:text-emerald-700 select-none">
            {article.title.charAt(0)}
          </div>
        )}
      </div>

      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {article.readingTime} menit
          </span>
        </div>
        <h3 className="font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
      </CardHeader>

      <CardContent className="px-5 pt-2 pb-0">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4">
        <Link
          href={`/articles/${article.slug}`}
          className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
        >
          Baca Selengkapnya
          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
