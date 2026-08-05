import { Suspense } from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import BackToTop from '@/components/shared/BackToTop'
import ScrollProgress from '@/components/shared/ScrollProgress'

export const runtime = 'edge'

export default function HubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <ScrollProgress />
        
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>

        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <BackToTop />
    </div>
  )
}
