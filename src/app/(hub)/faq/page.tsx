import type { Metadata } from 'next'
import FAQClient, { faqData } from './faq-client'
import { createFAQSchema } from '@/lib/seo/json-ld'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'FAQ | PT DBSN',
  description: 'Tanya jawab seputar PJU Tenaga Surya, solar panel, baterai storage, penangkal petir, serta standar proyek dan garansi PT. Daya Berkah Sentosa Nusantara (DBSN).',
}

export default function FAQPage() {
  const allFaqs = Object.values(faqData).flat()
  const schema = createFAQSchema(allFaqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FAQClient />
    </>
  )
}
