import { getCertifications, getPortfolioEntries } from '@/lib/api/sanity/queries'
import { getOptimizedImageUrl } from '@/lib/api/sanity/image'
import Script from 'next/script'
import HeroSection from '@/components/sections/HeroSection'
import TrustBadgeSection from '@/components/sections/TrustBadgeSection'
import AboutSection from '@/components/sections/AboutSection'
import ProductsSection from '@/components/sections/ProductsSection'
import PortfolioSection, { type PortfolioItem } from '@/components/sections/PortfolioSection'
import CertificationsSection, { type CertificationItem } from '@/components/sections/CertificationsSection'
import CTABanner from '@/components/sections/CTABanner'
import ContactSection from '@/components/sections/ContactSection'
import ProcessSection from '@/components/sections/ProcessSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ArticlesSection from '@/components/sections/ArticlesSection'
import FAQSection from '@/components/sections/FAQSection'
import { createHubHomeMetadata } from '@/lib/seo/metadata'
import { createOrganizationSchema } from '@/lib/seo/json-ld'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export function generateMetadata() {
  return createHubHomeMetadata()
}

export default async function HubHomePage() {
  const organizationSchema = createOrganizationSchema()

  const [rawCerts, rawPortfolio] = await Promise.all([
    getCertifications().catch(() => null),
    getPortfolioEntries().catch(() => null),
  ])

  // Map Sanity certification data to CertificationItem shape
  const certifications: CertificationItem[] | undefined = rawCerts?.map((c: any) => ({
    id: c._id ?? c.id ?? String(Math.random()),
    title: c.title ?? '',
    certType: c.certType ?? 'SNI',
    certificationBody: c.certificationBody ?? '',
    issueDate: c.issueDate ?? new Date().toISOString().slice(0, 10),
    expiryDate: c.expiryDate ?? '',
    description: c.description ?? null,
  })) ?? undefined

  // Map Sanity portfolio data to PortfolioItem shape
  const portfolioItems: PortfolioItem[] | undefined = rawPortfolio?.map((p: any) => ({
    id: p._id ?? String(Math.random()),
    title: p.title ?? '',
    clientCategory: p.clientCategory ?? 'Government',
    location: p.location ?? '',
    completionYear: p.completionYear ?? new Date().getFullYear(),
    scopeDescription: p.scopeDescription ?? '',
    outcome: p.outcome ?? '',
    images: p.images?.[0] ? getOptimizedImageUrl(p.images[0], 800, 450) : null,
    relatedSpoke: p.relatedSpoke ?? null,
    image: p.images?.[0] ? getOptimizedImageUrl(p.images[0], 800, 450) || undefined : undefined,
  })) ?? undefined

  return (
    <main>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      {/* Hero */}
      <HeroSection />

      {/* Trust Badges & Stats */}
      <TrustBadgeSection />

      {/* About */}
      <AboutSection />

      {/* Products — static data, no Sanity dependency */}
      <ProductsSection />

      {/* Portfolio — Sanity-powered with fallback */}
      <PortfolioSection portfolioItems={portfolioItems} />

      {/* Certifications — Sanity-powered with fallback */}
      <CertificationsSection certifications={certifications} />

      {/* Process / Workflow */}
      <ProcessSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Articles & News */}
      <ArticlesSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA Banner */}
      <CTABanner />

      {/* Contact */}
      <ContactSection />
    </main>
  )
}
