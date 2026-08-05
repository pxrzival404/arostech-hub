import { getCertifications } from '@/lib/api/sanity/queries'
import CertificationsGrid from './CertificationsGrid'
import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import SubpageHero from '@/components/shared/SubpageHero'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Sertifikasi | PT DBSN',
  description: 'Kepatuhan regulasi dan sertifikasi resmi PT. Daya Berkah Sentosa Nusantara (DBSN) termasuk SNI, TKDN, e-Katalog LKPP, dan ISO 9001 untuk jaminan kualitas proyek.',
}

export default async function CertificationsPage() {
  const certifications = await getCertifications()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      <SubpageHero
        title="Sertifikasi & Kepatuhan"
        subtitle="Komitmen kami terhadap pemenuhan standar nasional dan internasional demi keandalan sistem energi terbarukan."
        badgeLabel="Standardisasi & Mutu"
        badgeIconName="award"
      />

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {certifications && certifications.length > 0 ? (
          <CertificationsGrid certifications={certifications} />
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-slate-100">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada sertifikasi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Belum ada sertifikasi resmi yang dipublikasikan dari Sanity CMS saat ini. Silakan kembali lagi nanti.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
