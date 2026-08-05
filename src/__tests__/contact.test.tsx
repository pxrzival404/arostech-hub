import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactPage from '../app/(hub)/contact/page'

// Mock sub-forms
jest.mock('@/components/forms/RfqB2BForm', () => ({
  RfqB2BForm: () => <div data-testid="rfq-b2b-form">B2B Form</div>
}))

jest.mock('@/components/forms/RfqB2GForm', () => ({
  RfqB2GForm: () => <div data-testid="rfq-b2g-form">B2G Form</div>
}))

jest.mock('@/components/shared/ScrollReveal', () => {
  return function DummyScrollReveal({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-reveal">{children}</div>
  }
})

// Mock analytics hook
jest.mock('@/hooks/use-analytics', () => ({
  useTrackEvent: jest.fn(() => jest.fn()),
}))

jest.mock('@/lib/analytics/gtag', () => ({
  AnalyticsEvent: {
    CONTACT_CLICK: 'contact_click',
  },
}))

describe('ContactPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders contact page headings and sidebar info', () => {
    render(<ContactPage />)

    expect(screen.getByRole('heading', { name: /Pusat Kontak & Kemitraan/i })).toBeInTheDocument()
    expect(screen.getByText(/Alamat Kantor Utama/i)).toBeInTheDocument()
    expect(screen.getByText(/Jl. Raya Industri No. 88/i)).toBeInTheDocument()
  })

  it('allows switching between form tabs', () => {
    render(<ContactPage />)

    // Verify General Form is rendered initially
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument()
    expect(screen.queryByTestId('rfq-b2b-form')).not.toBeInTheDocument()

    // Switch to RFQ B2B tab
    const b2bTab = screen.getByRole('button', { name: /RFQ B2B/i })
    fireEvent.click(b2bTab)
    expect(screen.getByTestId('rfq-b2b-form')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Nama Lengkap/i)).not.toBeInTheDocument()

    // Switch to RFQ B2G tab
    const b2gTab = screen.getByRole('button', { name: /RFQ B2G/i })
    fireEvent.click(b2gTab)
    expect(screen.getByTestId('rfq-b2g-form')).toBeInTheDocument()
    expect(screen.queryByTestId('rfq-b2b-form')).not.toBeInTheDocument()
  })

  it('submits general contact form successfully', async () => {
    const mockResponse = { success: true }
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    )

    render(<ContactPage />)

    // Fill fields
    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/Email Bisnis/i), { target: { value: 'jane@doe.com' } })
    fireEvent.change(screen.getByLabelText(/Perihal/i), { target: { value: 'Lelang PJU' } })
    fireEvent.change(screen.getByLabelText(/Isi Pesan/i), { target: { value: 'Tolong kirimkan penawaran brosur.' } })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Kirim via Website/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Pesan Terkirim!')).toBeInTheDocument()
    })
  })
})
