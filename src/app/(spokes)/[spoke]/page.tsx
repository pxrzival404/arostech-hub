import { getSpokeConfig, getProductsBySpoke, getAllSpokeConfigs } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import AnalyticsLink from '@/components/shared/AnalyticsLink'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createSpokeHomeMetadata } from '@/lib/seo/metadata'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate hourly

export async function generateMetadata({
  params,
}: {
  params: Promise<{ spoke: string }>
}): Promise<Metadata> {
  const { spoke } = await params
  const config = await getSpokeConfig(spoke)
  if (!config) return {}
  return createSpokeHomeMetadata(spoke, {
    name: config.seoDefaults?.title || config.name,
    tagline: config.seoDefaults?.description || config.tagline,
  })
}

export default async function SpokeHome({
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

  const primaryColor = config.primaryColor || '#2563eb' // Fallback to blue-600

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AnalyticsLink href="/" spoke="hub" source="spoke_home_header" className="font-bold text-slate-800 hover:text-blue-600">DBSN Hub</AnalyticsLink>
              <span className="text-slate-300">&bull;</span>
              <AnalyticsLink
                href={`/${spoke}`}
                spoke={spoke}
                source="spoke_home_header"
                className="font-extrabold capitalize hover:opacity-85"
                style={{ color: primaryColor }}
              >
                {config.name}
              </AnalyticsLink>
            </div>
            <a
              href="#products"
              className="text-sm font-semibold hover:opacity-85"
              style={{ color: primaryColor }}
            >
              Lihat Produk &darr;
            </a>
          </nav>
        </header>

        <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white overflow-hidden py-24 md:py-32">
          {config.heroImage && (
            <div className="absolute inset-0 z-0 opacity-40">
              <Image
                src={getOptimizedImageUrl(config.heroImage, 1920, 1080) || ''}
                alt={config.name}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}
          <div className="container mx-auto px-6 relative z-10 max-w-4xl space-y-6">
            <span
              className="text-xs uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur"
              style={{ color: primaryColor }}
            >
              Spoke Digital Ecosystem
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              {config.name}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
              {config.tagline}
            </p>
          </div>
        </section>

        {/* Featured Products */}
        {config.featuredProducts && config.featuredProducts.length > 0 && (
          <section className="container mx-auto px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
              Produk Unggulan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {config.featuredProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col md:flex-row"
                >
                  <div className="md:w-1/2 aspect-video md:aspect-square relative bg-slate-100">
                    {prod.images?.[0] ? (
                      <Image
                        src={getOptimizedImageUrl(prod.images[0], 400, 400) || ''}
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">🔆</div>
                    )}
                  </div>
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug">{prod.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-3">{prod.shortDescription}</p>
                    </div>
                    <div className="pt-4">
                      <Link
                        href={`/${spoke}/products/${prod.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-sm hover:opacity-85"
                        style={{ color: primaryColor }}
                      >
                        Detail Produk &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section id="products" className="container mx-auto px-6 py-16 border-t border-slate-200">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
            Semua Produk
          </h2>
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
        </section>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500 mt-16">
        <p>&copy; {new Date().getFullYear()} PT Sentra Daya Sinergi. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  )
}
