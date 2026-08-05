import type { Metadata } from 'next'
import ProductsClient from './products-client'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Produk | PT DBSN',
  description: 'Katalog lengkap produk energi terbarukan PT. Daya Berkah Sentosa Nusantara (DBSN): PJU Solar Cell, panel surya, baterai lithium storage, dan alat penangkal petir.',
}

export default function ProductsPage() {
  return <ProductsClient />
}
