import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RfqB2GForm } from '../RfqB2GForm'
import { useRfqCartHydrated, useRfqCartStore } from '@/hooks/use-rfq-cart'

// Mock tracking utility
jest.mock('@/lib/utils/tracking', () => ({
  extractTrackingMetadata: jest.fn(() => ({
    source_domain: 'dayaberkah.id',
    source_page_path: '/pju',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'winter_promo',
  })),
}))

// Mock analytics hook
jest.mock('@/hooks/use-analytics', () => ({
  useTrackEvent: jest.fn(() => jest.fn()),
}))

jest.mock('@/lib/analytics/gtag', () => ({
  AnalyticsEvent: {
    RFQ_SUBMIT: 'rfq_submit',
    RFQ_FALLBACK_WHATSAPP: 'rfq_fallback_whatsapp',
  },
}))

// Mock Zustand store and hydration hooks
const mockUpdateQuantity = jest.fn()
const mockUpdateItemNotes = jest.fn()
const mockRemoveItem = jest.fn()
const mockClearCart = jest.fn()

const mockCartItems = [
  {
    product_id: 'prod-pju',
    product_name: 'PJU Solar Cell 100W',
    quantity: 50,
    variant: '100W Lithium',
    item_notes: 'Must include brackets',
  },
]

jest.mock('@/hooks/use-rfq-cart', () => {
  const actual = jest.requireActual('@/hooks/use-rfq-cart')
  return {
    ...actual,
    useRfqCartHydrated: jest.fn(() => true),
    useRfqCartStore: jest.fn((selector) => {
      const mockState = {
        items: mockCartItems,
      }
      return selector ? selector(mockState) : mockState
    }),
  }
})

// Add getState implementation to the mock store hook
const mockUseRfqCartStoreMock = useRfqCartStore as jest.MockedFunction<any>
mockUseRfqCartStoreMock.getState = jest.fn(() => ({
  updateQuantity: mockUpdateQuantity,
  updateItemNotes: mockUpdateItemNotes,
  removeItem: mockRemoveItem,
  clearCart: mockClearCart,
}))

describe('RfqB2GForm', () => {
  const mockOnSubmit = jest.fn()
  const mockUseRfqCartHydrated = useRfqCartHydrated as jest.MockedFunction<any>

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockUpdateQuantity.mockClear()
    mockUpdateItemNotes.mockClear()
    mockRemoveItem.mockClear()
    mockUseRfqCartHydrated.mockReturnValue(true)
    // Reset store items mock to default
    mockUseRfqCartStoreMock.mockImplementation((selector: any) => {
      const mockState = { items: mockCartItems }
      return selector ? selector(mockState) : mockState
    })
  })

  describe('Rendering States', () => {
    it('should render loading skeleton when not hydrated', () => {
      mockUseRfqCartHydrated.mockReturnValue(false)
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      expect(screen.getByLabelText(/loading rfq form/i)).toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('should render empty cart message when no items exist', () => {
      mockUseRfqCartStoreMock.mockImplementation((selector: any) => {
        const mockState = { items: [] }
        return selector ? selector(mockState) : mockState
      })

      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      expect(screen.getByText(/your rfq cart is empty/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /browse products/i })).toBeInTheDocument()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('should render form and product items when cart has items', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByText('PJU Solar Cell 100W')).toBeInTheDocument()
      expect(screen.getByText('100W Lithium')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Must include brackets')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    })
  })

  describe('Contact Details & General Fields', () => {
    it('should render contact_name field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/contact name/i)
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('type', 'text')
      expect(nameInput).toHaveAttribute('required')
    })

    it('should render contact_email field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/contact email/i)
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
    })

    it('should render contact_phone field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      expect(phoneInput).toBeInTheDocument()
      expect(phoneInput).toHaveAttribute('type', 'tel')
    })

    it('should render company_name field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const companyInput = screen.getByLabelText(/company name/i)
      expect(companyInput).toBeInTheDocument()
      expect(companyInput).toHaveAttribute('type', 'text')
    })

    it('should render project_scope field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const scopeInput = screen.getByLabelText(/project scope/i)
      expect(scopeInput).toBeInTheDocument()
    })

    it('should render timeline field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      expect(timelineInput).toBeInTheDocument()
      expect(timelineInput).toHaveAttribute('type', 'date')
    })

    it('should render notes field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const notesInput = screen.getByLabelText(/additional notes/i)
      expect(notesInput).toBeInTheDocument()
    })
  })

  describe('Government Procurement Fields', () => {
    it('should render procurement_type as select dropdown', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const procurementSelect = screen.getByLabelText(/procurement type/i)
      expect(procurementSelect).toBeInTheDocument()
      expect(procurementSelect.tagName.toLowerCase()).toBe('select')
    })

    it('should have correct procurement type options', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      expect(screen.getByRole('option', { name: 'Tender Langsung' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Tender Umum' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Penunjukan Langsung' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'E-Purchasing' })).toBeInTheDocument()
    })

    it('should render dipa_reference field', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const dipaInput = screen.getByLabelText(/dipa reference/i)
      expect(dipaInput).toBeInTheDocument()
      expect(dipaInput).toHaveAttribute('type', 'text')
    })
  })

  describe('In-Form Cart Actions', () => {
    it('should call updateQuantity when increasing quantity', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const increaseButton = screen.getByRole('button', { name: /increase quantity/i })
      await user.click(increaseButton)

      expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-pju', 51, '100W Lithium')
    })

    it('should call updateQuantity when decreasing quantity', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i })
      await user.click(decreaseButton)

      expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-pju', 49, '100W Lithium')
    })

    it('should call updateQuantity when typing a new quantity', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const quantityInput = screen.getByLabelText(/^quantity$/i)
      fireEvent.change(quantityInput, { target: { value: '150' } })

      expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-pju', 150, '100W Lithium')
    })

    it('should call updateItemNotes when editing notes', () => {
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const specInput = screen.getByLabelText(/special specifications/i)
      fireEvent.change(specInput, { target: { value: 'Include spare batteries' } })

      expect(mockUpdateItemNotes).toHaveBeenCalledWith('prod-pju', 'Include spare batteries', '100W Lithium')
    })

    it('should call removeItem when clicking trash button', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const removeButton = screen.getByRole('button', { name: /remove pju solar cell 100w/i })
      await user.click(removeButton)

      expect(mockRemoveItem).toHaveBeenCalledWith('prod-pju', '100W Lithium')
      expect(screen.queryByText('PJU Solar Cell 100W')).not.toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should show error when contact_name is empty', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Contact name is required')).toBeInTheDocument()
      })
    })

    it('should show error when contact_name exceeds 255 characters', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const nameInput = screen.getByLabelText(/contact name/i)
      const longName = 'A'.repeat(256)
      fireEvent.change(nameInput, { target: { value: longName } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/too long/i)).toBeInTheDocument()
      })
    })

    it('should show error when contact_email is invalid format', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const emailInput = screen.getByLabelText(/contact email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should show error when contact_phone does not match +62 format', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      await user.type(phoneInput, '08123456789')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/phone number.*\+62/i)).toBeInTheDocument()
      })
    })

    it('should accept valid +62 phone number', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const phoneInput = screen.getByLabelText(/contact phone/i)
      await user.type(phoneInput, '+6281234567890')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/phone number.*\+62/i)).not.toBeInTheDocument()
      })
    })

    it('should show error when timeline format is invalid', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      timelineInput.setAttribute('type', 'text')
      await user.type(timelineInput, '2025/01/01')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/timeline.*yyyy-mm-dd/i)).toBeInTheDocument()
      })
    })

    it('should accept valid timeline format (YYYY-MM-DD)', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const timelineInput = screen.getByLabelText(/timeline/i)
      await user.type(timelineInput, '2025-12-31')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/timeline.*yyyy-mm-dd/i)).not.toBeInTheDocument()
      })
    })

    it('should show error when notes exceeds 2000 characters', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const notesInput = screen.getByLabelText(/additional notes/i)
      const longNotes = 'A'.repeat(2001)
      fireEvent.change(notesInput, { target: { value: longNotes } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/notes.*too long/i)).toBeInTheDocument()
      })
    })

    it('should show error when procurement_type is not selected', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Procurement type is required')).toBeInTheDocument()
      })
    })

    it('should pass validation with all required fields filled correctly', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText(/contact phone/i), { target: { value: '+6281234567890' } })
      fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'PT Test Company' } })
      
      const procurementSelect = screen.getByLabelText(/procurement type/i)
      await user.selectOptions(procurementSelect, 'Tender Langsung')

      fireEvent.change(screen.getByLabelText(/timeline/i), { target: { value: '2025-12-31' } })
      fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Test notes for RFQ' } })

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Submission', () => {
    it('should call onSubmit with valid form data and items array', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: 'test@example.com' } })
      
      const procurementSelect = screen.getByLabelText(/procurement type/i)
      await user.selectOptions(procurementSelect, 'Tender Langsung')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            segment: 'B2G',
            contact_name: 'Test User',
            contact_email: 'test@example.com',
            procurement_type: 'Tender Langsung',
            items: [
              {
                product_id: 'prod-pju',
                product_name: 'PJU Solar Cell 100W',
                quantity: 50,
                variant: '100W Lithium',
                item_notes: 'Must include brackets',
              },
            ],
          })
        )
      })
    })

    it('should include hidden tracking metadata in submitted data', async () => {
      const user = userEvent.setup()
      render(<RfqB2GForm onSubmit={mockOnSubmit} />)

      fireEvent.change(screen.getByLabelText(/contact name/i), { target: { value: 'Test User' } })
      fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: 'test@example.com' } })
      
      const procurementSelect = screen.getByLabelText(/procurement type/i)
      await user.selectOptions(procurementSelect, 'Tender Langsung')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            source_domain: 'dayaberkah.id',
            source_page_path: '/pju',
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'winter_promo',
          })
        )
      })
    })
  })
})