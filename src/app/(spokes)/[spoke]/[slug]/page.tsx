import { getSpokeConfig, getPageBySlug, getAllSpokeConfigs } from '@/lib/api/sanity/queries'
import { PortableText } from '@/components/shared/PortableText'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate hourly
export const runtime = 'edge'


export async function generateMetadata({
  params,
}: {
  params: Promise<{ spoke: string; slug: string }>
}): Promise<Metadata> {
  const { spoke, slug } = await params
  const page = await getPageBySlug(slug, spoke)
  if (!page) return {}
  return {
    title: `${page.seoMeta?.title || page.title} - DBSN`,
    description: page.seoMeta?.description,
    alternates: {
      canonical: `https://${spoke}.dayaberkah.id/${slug}`,
    },
  }
}

export default async function SpokeDynamicPage({
  params,
}: {
  params: Promise<{ spoke: string; slug: string }>
}) {
  const { spoke, slug } = await params
  const [config, pageData] = await Promise.all([
    getSpokeConfig(spoke),
    getPageBySlug(slug, spoke),
  ])

  // If the spoke config or page doesn't exist in the CMS, return 404
  if (!config || !pageData) {
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

        <main id="main-content" tabIndex={-1} className="container mx-auto px-6 py-12 max-w-4xl outline-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-10 space-y-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {pageData.title}
            </h1>
            
            <div className="border-t border-slate-100 pt-6">
              {/* Render CMS sections content if present */}
              {pageData.sections && Array.isArray(pageData.sections) && (
                <PortableText 
                  value={pageData.sections as any} 
                  className="prose prose-emerald max-w-none text-slate-700 leading-relaxed space-y-4"
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} PT Sentra Daya Sinergi. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  )
}
