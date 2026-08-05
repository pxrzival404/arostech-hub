import { getSpokeConfig, getPortfolioEntries } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly
export const runtime = 'edge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spoke: string }>
}): Promise<Metadata> {
  const { spoke } = await params
  const config = await getSpokeConfig(spoke)
  if (!config) return {}
  return {
    title: `Portofolio ${config.name} - DBSN`,
    description: `Daftar proyek pemasangan dan implementasi infrastruktur ${config.name} sukses kami di seluruh Indonesia.`,
    alternates: {
      canonical: `https://${spoke}.dayaberkah.id/portfolio`,
    },
  }
}

export default async function SpokePortfolioPage({
  params,
}: {
  params: Promise<{ spoke: string }>
}) {
  const { spoke } = await params
  const [config, portfolio] = await Promise.all([
    getSpokeConfig(spoke),
    getPortfolioEntries(spoke),
  ])

  if (!config) {
    notFound()
  }

  const primaryColor = config.primaryColor || '#2563eb'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-bold text-slate-800 hover:text-blue-600">DBSN Hub</Link>
              <span className="text-slate-300">&bull;</span>
              <Link href={`/${spoke}`} className="font-extrabold capitalize hover:opacity-85" style={{ color: primaryColor }}>
                {config.name}
              </Link>
            </div>
            <Link href={`/${spoke}`} className="text-sm font-semibold hover:underline" style={{ color: primaryColor }}>
              &larr; Kembali ke Spoke
            </Link>
          </nav>
        </header>

        <main id="main-content" tabIndex={-1} className="container mx-auto px-6 py-12 outline-none">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight capitalize">
              Portofolio Proyek {config.name}
            </h1>
            <p className="mt-4 text-slate-600">
              Kumpulan kisah sukses pengerjaan proyek dan instalasi sistem {config.name} di seluruh penjuru tanah air.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio && portfolio.length > 0 ? (
              portfolio.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {entry.images?.[0] ? (
                        <Image
                          src={getOptimizedImageUrl(entry.images[0], 400, 225) || ''}
                          alt={entry.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-slate-300">🏢</span>
                      )}
                    </div>
                    
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          entry.clientCategory === 'Government' ? 'bg-blue-100 text-blue-800' :
                          entry.clientCategory === 'BUMN' ? 'bg-purple-100 text-purple-800' :
                          entry.clientCategory === 'Private' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.clientCategory}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{entry.location}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 leading-snug">
                        {entry.title}
                      </h2>
                      
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {entry.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Selesai: {entry.completionYear}</span>
                    <Link
                      href={`/portfolio/${entry.slug}`}
                      className="font-semibold flex items-center gap-1 hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Detail Proyek &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-slate-500 text-lg">Belum ada portofolio proyek untuk spoke ini.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} PT Sentra Daya Sinergi. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  )
}
