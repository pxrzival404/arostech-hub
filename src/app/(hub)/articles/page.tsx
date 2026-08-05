import { getArticles } from '@/lib/api/sanity/queries'
import ArticlesGridClient from './ArticlesGridClient'
import type { Metadata } from 'next'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Artikel & Kabar Energi Terbarukan - DBSN',
  description:
    'Temukan wawasan terbaru, analisis regulasi TKDN, panduan e-Katalog LKPP, dan tren teknologi pembangkit listrik tenaga surya serta baterai di Indonesia.',
}

export default async function ArticlesPage() {
  const articles = await getArticles()
  const safeArticles = articles || []

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-7xl">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Artikel &amp; Berita Terbaru
          </h1>
          <div className="h-1 w-12 bg-emerald-600 mx-auto rounded-full" />
          <p className="text-lg text-slate-600 leading-relaxed">
            Dapatkan informasi, kabar terbaru, panduan regulasi, serta wawasan mendalam seputar inovasi teknologi energi terbarukan di Indonesia.
          </p>
        </div>

        {/* Client side Filtering and Search Grid */}
        <ArticlesGridClient articles={safeArticles} />
      </main>
    </div>
  )
}
