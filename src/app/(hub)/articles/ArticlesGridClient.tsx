'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, ArrowRight, Heart, Search, Newspaper } from 'lucide-react'
import type { ArticleWithRelations } from '@/lib/api/sanity/types'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  articles: ArticleWithRelations[]
}

const categoryColors: Record<string, string> = {
  'Energi Terbarukan': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Regulasi: 'bg-amber-50 text-amber-700 border border-amber-200',
  Industri: 'bg-purple-50 text-purple-700 border border-purple-200',
  Teknik: 'bg-teal-50 text-teal-700 border border-teal-200',
  Teknologi: 'bg-orange-50 text-orange-700 border border-orange-200',
}

const STORAGE_KEY = 'dbsn-saved-articles'

function getInitialSavedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored) as string[])
  } catch {
    /* ignore */
  }
  return new Set<string>()
}

export default function ArticlesGridClient({ articles }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(getInitialSavedIds)

  // Toggle Save handler
  const toggleSave = useCallback((articleId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(articleId)) {
        next.delete(articleId)
      } else {
        next.add(articleId)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const isSaved = useCallback((articleId: string) => savedIds.has(articleId), [savedIds])

  // Get unique categories dynamically
  const categories = useMemo(() => {
    const cats = articles.map((a) => a.category).filter(Boolean)
    return ['all', ...Array.from(new Set(cats))]
  }, [articles])

  // Filtered and searched articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory

      const matchesSearch =
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSaved = !showSavedOnly || isSaved(article._id)

      return matchesCategory && matchesSearch && matchesSaved
    })
  }, [articles, activeCategory, searchQuery, showSavedOnly, isSaved])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari artikel atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 h-11 rounded-xl border-slate-200 focus-visible:ring-emerald-500 w-full"
          />
        </div>

        {/* Filters Toggles */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {savedIds.size > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-4 h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                showSavedOnly
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${showSavedOnly ? 'fill-emerald-500 text-emerald-500' : ''}`} />
              Saved ({savedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Category Tags Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeCategory === cat
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article) => {
            const saved = isSaved(article._id)
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={article._id}
              >
                <Card
                  className={`relative border transition-all duration-300 group overflow-hidden cursor-pointer h-full bg-white flex flex-col justify-between hover:shadow-lg ${
                    saved ? 'border-emerald-400' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header Image box with saved button */}
                    <div className="aspect-video bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                      <Newspaper className="w-12 h-12 text-emerald-200 group-hover:scale-110 transition duration-500" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          toggleSave(article._id)
                        }}
                        className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-slate-200 transition-all hover:scale-115 cursor-pointer"
                        aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan artikel'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            saved ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                          }`}
                        />
                      </button>

                      <Badge
                        className={`absolute top-3 left-3 font-semibold shadow-sm ${
                          categoryColors[article.category] || 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {article.category}
                      </Badge>

                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md px-2 py-0.5 shadow-sm text-[10px] font-semibold text-slate-500 border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.readingTime} menit baca</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors min-h-[44px]">
                        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-emerald-700 hover:text-emerald-950 flex items-center gap-1 font-bold group/btn"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredArticles.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada artikel yang cocok dengan filter atau kata kunci Anda.</p>
            {(activeCategory !== 'all' || searchQuery !== '' || showSavedOnly) && (
              <Button
                variant="outline"
                className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                onClick={() => {
                  setShowSavedOnly(false)
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
