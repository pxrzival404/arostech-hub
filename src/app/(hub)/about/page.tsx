import type { Metadata } from 'next'
import AboutClient from './about-client'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Tentang Kami | PT DBSN',
  description: 'Profil PT. Daya Berkah Sentosa Nusantara (DBSN), visi misi, jajaran manajemen, serta sejarah perjalanan kami dalam menghadirkan solusi energi terbarukan di Indonesia.',
}

export default function AboutPage() {
  return <AboutClient />
}
