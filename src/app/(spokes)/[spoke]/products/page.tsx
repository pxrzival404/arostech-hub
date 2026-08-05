import { getSpokeConfig, getProductsBySpoke } from '@/lib/api/sanity/queries'
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
    title: `Produk ${config.name} - DBSN`,
    description: `Daftar lengkap produk infrastruktur ${config.name} terbaik di Indonesia.`,
    alternates: {
      canonical: `https://${spoke}.dayaberkah.id/products`,
    },
  }
}

export default async function SpokeProductsPage({
  params,
}: {
  params: Promise<{ spoke: string }>
}) {
  const { spoke } = await params
  const [config, products] = await Promise.all([
    getSpokeConfig(spoke),
    getProductsBySpoke(spoke),
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
              Katalog Produk {config.name}
            </h1>
            <p className="mt-4 text-slate-600">
              Jelajahi seluruh rangkaian produk berkualitas tinggi dari {config.name} untuk memenuhi kebutuhan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square w-full bg-slate-100 relative">
                      {prod.images?.[0] ? (
                        <Image
                          src={getOptimizedImageUrl(prod.images[0], 300, 300) || ''}
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">🔆</div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-slate-900 leading-snug line-clamp-1">{prod.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{prod.shortDescription}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <Link
                      href={`/${spoke}/products/${prod.slug}`}
                      className="block w-full text-center py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Selengkapnya
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center col-span-full py-8">Belum ada produk di spoke ini.</p>
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
