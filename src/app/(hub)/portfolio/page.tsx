import { getPortfolioEntries } from '@/lib/api/sanity/queries'
import PortfolioGridClient from './PortfolioGridClient'
import type { Metadata } from 'next'
import SubpageHero from '@/components/shared/SubpageHero'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate hourly

export const metadata: Metadata = {
  title: 'Portofolio Proyek Terbarukan - DBSN',
  description: 'Jelajahi portofolio proyek energi terbarukan kami untuk sektor B2G, B2B, dan swasta di seluruh Indonesia.',
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolioEntries()
  const safePortfolio = portfolio || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <SubpageHero
        title="Portofolio Proyek Kami"
        subtitle="DBSN berkomitmen menghadirkan infrastruktur energi terbarukan berkualitas tinggi yang terintegrasi secara cerdas, andal, dan berkelanjutan untuk melayani kebutuhan nasional di berbagai pelosok Indonesia."
        badgeLabel="Portofolio"
        badgeIconName="building"
      />
      <main className="container mx-auto px-6 pt-8 pb-20 max-w-7xl">
        {/* Client-Side Category Filtering and Grid */}
        <PortfolioGridClient portfolios={safePortfolio} />
      </main>
    </div>
  )
}
