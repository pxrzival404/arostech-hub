'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import type { PortfolioWithRelations } from '@/lib/api/sanity/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, Eye, Calendar, MapPin, Building } from 'lucide-react'

interface Props {
  portfolios: PortfolioWithRelations[]
}

type CategoryFilter = 'All' | 'B2G' | 'B2B' | 'Private'

export default function PortfolioGridClient({ portfolios }: Props) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All')

  // Categories configurations
  const filters: { key: CategoryFilter; label: string; count: number }[] = useMemo(() => {
    const counts = {
      All: portfolios.length,
      B2G: portfolios.filter(
        (p) => p.clientCategory === 'Government' || p.clientCategory === 'BUMN'
      ).length,
      B2B: portfolios.filter(
        (p) =>
          p.clientCategory === 'Private' ||
          p.clientCategory === 'BUMN' ||
          p.clientCategory === 'EPC'
      ).length,
      Private: portfolios.filter((p) => p.clientCategory === 'Private').length,
    }
    return [
      { key: 'All', label: 'Semua Proyek', count: counts.All },
      { key: 'B2G', label: 'B2G (Pemerintah/BUMN)', count: counts.B2G },
      { key: 'B2B', label: 'B2B (Swasta/EPC)', count: counts.B2B },
      { key: 'Private', label: 'Private (Swasta)', count: counts.Private },
    ]
  }, [portfolios])

  // Filtered portfolio list
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      if (activeFilter === 'All') return true
      if (activeFilter === 'B2G') {
        return p.clientCategory === 'Government' || p.clientCategory === 'BUMN'
      }
      if (activeFilter === 'B2B') {
        return (
          p.clientCategory === 'Private' ||
          p.clientCategory === 'BUMN' ||
          p.clientCategory === 'EPC'
        )
      }
      if (activeFilter === 'Private') {
        return p.clientCategory === 'Private'
      }
      return true
    })
  }, [portfolios, activeFilter])

  return (
    <div className="space-y-10">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeFilter === f.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none scale-105'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeFilter === f.key ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid List */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPortfolios.map((entry) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={entry._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Lazy Image Box with Skeleton Loader */}
                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {entry.images?.[0] ? (
                    <LazyPortfolioImage
                      src={getOptimizedImageUrl(entry.images[0], 600, 338) || ''}
                      alt={entry.title}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <Building className="w-12 h-12" />
                      <span className="text-xs mt-2">DBSN Project</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Link
                      href={`/portfolio/${entry.slug}`}
                      className="bg-white/90 text-slate-900 px-4 py-2 rounded-full font-bold text-xs shadow-md flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition duration-300"
                    >
                      <Eye className="w-3.5 h-3.5" /> Lihat Detail
                    </Link>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        entry.clientCategory === 'Government'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : entry.clientCategory === 'BUMN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : entry.clientCategory === 'Private'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {entry.clientCategory}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {entry.location}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-300">
                    <Link href={`/portfolio/${entry.slug}`}>{entry.title}</Link>
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {entry.outcome}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Selesai: {entry.completionYear}
                </span>
                <Link
                  href={`/portfolio/${entry.slug}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn"
                >
                  Detail Proyek
                  <span className="transform group-hover/btn:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPortfolios.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada portofolio proyek terdaftar untuk kategori ini.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function LazyPortfolioImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <Building className="w-8 h-8 text-slate-300" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-all duration-500 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </>
  )
}
