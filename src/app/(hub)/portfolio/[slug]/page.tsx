import { getPortfolioBySlug, getPortfolioEntries } from '@/lib/api/sanity/queries'
import GalleryCarousel from '@/components/shared/GalleryCarousel'
import { PortableText } from '@/components/shared/PortableText'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, MapPin, Calendar, Briefcase, FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate hourly

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const entry = await getPortfolioBySlug(slug)
    if (!entry) return {}
    return {
      title: `${entry.seoMeta?.title || entry.title} - DBSN`,
      description: entry.seoMeta?.description || entry.outcome,
    }
  } catch {
    return {}
  }
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await getPortfolioBySlug(slug)

  if (!entry) {
    notFound()
  }

  // Fetch sibling projects for related projects section
  const allEntries = await getPortfolioEntries()
  const relatedProjects = allEntries
    ? allEntries
        .filter(
          (item) =>
            item._id !== entry._id &&
            (item.clientCategory === entry.clientCategory ||
              item.relatedSpoke?._id === entry.relatedSpoke?._id)
        )
        .slice(0, 3)
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-6 pt-28 pb-20 max-w-7xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/portfolio"
            className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-2 transition duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Portofolio
          </Link>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    entry.clientCategory === 'Government'
                      ? 'bg-blue-100 text-blue-800'
                      : entry.clientCategory === 'BUMN'
                        ? 'bg-purple-100 text-purple-800'
                        : entry.clientCategory === 'Private'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {entry.clientCategory}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600 text-sm font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {entry.location}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600 text-sm font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Selesai: {entry.completionYear}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {entry.title}
              </h1>
            </div>

            {/* Slider Component */}
            <GalleryCarousel images={entry.images} alt={entry.title} />

            {/* Scope & Outcome Blocks */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 space-y-8 shadow-sm">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Lingkup Pekerjaan
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                  <PortableText value={entry.scopeDescription} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Hasil &amp; Dampak Teknis
                </h2>
                <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  {entry.outcome}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Project Specifications Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informasi Ringkas
              </h2>

              <div className="space-y-5 text-sm">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                    Jenis Proyek
                  </span>
                  <p className="text-slate-800 font-bold mt-1 text-base">{entry.projectType}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                    Kategori Klien
                  </span>
                  <p className="text-slate-800 font-bold mt-1 text-base">{entry.clientCategory}</p>
                </div>

                {entry.relatedSpoke && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                      Spoke Bisnis Terkait
                    </span>
                    <p className="text-slate-800 font-bold mt-1 text-base capitalize">
                      {entry.relatedSpoke.name}
                    </p>
                  </div>
                )}

                {entry.relatedProducts && entry.relatedProducts.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">
                      Produk yang Diimplementasi
                    </span>
                    <ul className="mt-2 space-y-2">
                      {entry.relatedProducts.map((prod) => (
                        <li key={prod._id}>
                          <Link
                            href={`/${entry.relatedSpoke?.subdomain || 'pju'}/products/${prod.slug}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 group/item"
                          >
                            <ChevronRight className="w-3.5 h-3.5 transform group-hover/item:translate-x-0.5 transition-transform" />
                            {prod.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Related Projects Sidebar */}
            {relatedProjects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 px-1">Proyek Terkait</h3>
                <div className="space-y-4">
                  {relatedProjects.map((proj) => (
                    <Link
                      href={`/portfolio/${proj.slug}`}
                      key={proj._id}
                      className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-300 group"
                    >
                      <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden relative flex-shrink-0">
                        {proj.images?.[0] ? (
                          <Image
                            src={getOptimizedImageUrl(proj.images[0], 120, 120) || ''}
                            alt={proj.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
                            <Briefcase className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1 overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {proj.location}
                        </span>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 text-xs leading-snug line-clamp-2 transition-colors duration-300">
                          {proj.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Tahun {proj.completionYear}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
