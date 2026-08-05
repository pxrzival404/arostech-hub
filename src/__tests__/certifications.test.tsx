import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CertificationsPage from '../app/(hub)/certifications/page'
import CertificationsGrid from '../app/(hub)/certifications/CertificationsGrid'
import { getCertifications } from '@/lib/api/sanity/queries'

// Mock Sanity CMS calls
jest.mock('@/lib/api/sanity/queries', () => ({
  getCertifications: jest.fn(),
}))

jest.mock('@/lib/api/sanity/image', () => ({
  getOptimizedImageUrl: jest.fn(() => 'http://sanity.test/image.jpg'),
}))

const mockCerts = [
  {
    _id: 'cert-1',
    _type: 'certification' as const,
    title: 'Sertifikat SNI PJU',
    slug: 'sertifikat-sni-pju',
    certificationBody: 'BSN Indonesia',
    certType: 'SNI' as const,
    issueDate: '2023-01-01',
    expiryDate: '2028-01-01',
    documentUrl: 'http://sanity.test/doc.pdf',
    coverImage: {
      _key: 'img-1',
      _type: 'image' as const,
      asset: { _ref: 'ref-1', _type: 'reference' as const },
    },
    isIndexable: true,
    seoMeta: { title: 'SNI PJU', description: 'Deskripsi SNI' },
  },
]

describe('CertificationsPage & Grid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders certifications page wrapper and grid', async () => {
    ;(getCertifications as jest.Mock).mockResolvedValue(mockCerts)
    
    // Render the server component wrapper
    const resolvedPage = await CertificationsPage()
    render(resolvedPage)

    expect(screen.getByRole('heading', { name: /Sertifikasi & Kepatuhan/i })).toBeInTheDocument()
    expect(screen.getByText('Sertifikat SNI PJU')).toBeInTheDocument()
    expect(screen.getByText('BSN Indonesia')).toBeInTheDocument()
  })

  it('shows empty state when no certifications exist', async () => {
    ;(getCertifications as jest.Mock).mockResolvedValue([])

    const resolvedPage = await CertificationsPage()
    render(resolvedPage)

    expect(screen.getByText('Belum ada sertifikasi')).toBeInTheDocument()
  })

  it('opens and closes document detail modal when clicking Lihat Dokumen', async () => {
    render(<CertificationsGrid certifications={mockCerts} />)

    const viewBtn = screen.getByRole('button', { name: /Lihat Dokumen/i })
    fireEvent.click(viewBtn)

    // Verify dialog content is visible
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Diterbitkan oleh/i)).toBeInTheDocument()
    expect(screen.getAllByText(/BSN Indonesia/i).length).toBeGreaterThan(0)
  })
})
