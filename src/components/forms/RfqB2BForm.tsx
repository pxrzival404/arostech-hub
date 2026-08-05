'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rfqB2BSchema, RfqB2BInput } from '@/lib/schema/rfq-schemas'
import { extractTrackingMetadata } from '@/lib/utils/tracking'
import { TextField } from './TextField'
import { TextareaField } from './TextareaField'
import { useRfqCartStore, useRfqCartHydrated, selectCartItems } from '@/hooks/use-rfq-cart'
import { Trash2, Plus, Minus, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react'
import { useTrackEvent } from '@/hooks/use-analytics'
import { AnalyticsEvent } from '@/lib/analytics/gtag'
import Link from 'next/link'

interface RfqB2BFormProps {
  onSubmit: (data: RfqB2BInput) => void | Promise<void>
}

export function RfqB2BForm({ onSubmit }: RfqB2BFormProps) {
  const trackingMetadata = extractTrackingMetadata()
  const hydrated = useRfqCartHydrated()
  const cartItems = useRfqCartStore(selectCartItems)
  const isInitialized = useRef(false)

  const trackEvent = useTrackEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<{ message: string; fallbackUrl?: string } | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RfqB2BInput>({
    resolver: zodResolver(rfqB2BSchema),
    defaultValues: {
      segment: 'B2B',
      source_domain: trackingMetadata.source_domain,
      source_page_path: trackingMetadata.source_page_path,
      source_campaign_tag: trackingMetadata.source_campaign_tag,
      utm_source: trackingMetadata.utm_source,
      utm_medium: trackingMetadata.utm_medium,
      utm_campaign: trackingMetadata.utm_campaign,
      contact_name: '',
      contact_email: '',
      contact_phone: undefined,
      company_name: undefined,
      items: [],
      project_scope: undefined,
      timeline: undefined,
      notes: undefined,
    },
  })

  const { fields, remove } = useFieldArray({
    control,
    name: 'items',
  })

  // Hydrate form values from Zustand store exactly once upon successful store hydration
  useEffect(() => {
    if (hydrated && !isInitialized.current) {
      reset((prev) => ({
        ...prev,
        items: cartItems,
      }))
      isInitialized.current = true
    }
  }, [hydrated, cartItems, reset])

  const handleQuantityChange = (index: number, productId: string, qty: number, variant?: string) => {
    const clamped = Math.max(1, Math.min(qty, 100000))
    setValue(`items.${index}.quantity`, clamped, { shouldValidate: true })
    useRfqCartStore.getState().updateQuantity(productId, clamped, variant)
  }

  const handleNotesChange = (index: number, productId: string, notes: string, variant?: string) => {
    setValue(`items.${index}.item_notes`, notes, { shouldValidate: true })
    useRfqCartStore.getState().updateItemNotes(productId, notes, variant)
  }

  const handleRemoveItem = (index: number, productId: string, variant?: string) => {
    remove(index)
    useRfqCartStore.getState().removeItem(productId, variant)
  }

  // Loading skeleton state prior to client-side hydration
  if (!hydrated) {
    return (
      <div className="space-y-6 pb-20 animate-pulse" aria-label="Loading RFQ Form">
        <div className="h-8 w-1/3 bg-slate-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Premium empty cart view
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50 my-8">
        <div className="rounded-full bg-slate-100 p-3 text-slate-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Your RFQ Cart is empty</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">
          Please add products to your RFQ cart before submitting a B2B quotation request.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const handleFormSubmit = async (data: RfqB2BInput) => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await Promise.resolve(onSubmit(data))
      setIsSuccess(true)
      
      const spoke = trackingMetadata.source_domain ? trackingMetadata.source_domain.split('.')[0] : ''
      trackEvent(AnalyticsEvent.RFQ_SUBMIT, {
        segment: 'B2B',
        spoke,
        item_count: data.items.length
      })
      
      // Clear cart on success
      useRfqCartStore.getState().clearCart()
    } catch (err) {
      console.error('RFQ B2B Submission failed:', err)
      const error = err as Error & { fallback_url?: string; response?: { data?: { error?: { fallback_url?: string } } }; error?: { fallback_url?: string } }
      const fallbackUrl = error.fallback_url || error.response?.data?.error?.fallback_url || error.error?.fallback_url
      setSubmitError({
        message: error.message || 'Terjadi kesalahan sistem saat mengirim RFQ.',
        fallbackUrl
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 p-8 text-center bg-emerald-50/50 my-8">
        <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-950">RFQ Berhasil Dikirim!</h3>
        <p className="mt-2 text-sm text-emerald-800 max-w-sm">
          Permintaan penawaran harga Anda telah kami terima. Tim sales kami akan segera menghubungi Anda.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 pb-20"
      aria-label="B2B RFQ Form"
      noValidate
    >
      {/* Hidden tracking fields */}
      <input type="hidden" value="B2B" {...register('segment')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.source_domain} {...register('source_domain')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.source_page_path} {...register('source_page_path')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.source_campaign_tag || ''} {...register('source_campaign_tag')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.utm_source || ''} {...register('utm_source')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.utm_medium || ''} {...register('utm_medium')} aria-hidden="true" />
      <input type="hidden" value={trackingMetadata.utm_campaign || ''} {...register('utm_campaign')} aria-hidden="true" />

      {/* Contact Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        
        <TextField
          name="contact_name"
          control={control}
          label="Contact Name"
          placeholder="Your full name"
          error={errors.contact_name?.message}
          rules={{ required: true }}
        />

        <TextField
          name="contact_email"
          control={control}
          label="Contact Email"
          placeholder="email@example.com"
          type="email"
          error={errors.contact_email?.message}
          rules={{ required: true }}
        />

        <TextField
          name="contact_phone"
          control={control}
          label="Contact Phone"
          placeholder="+6281234567890"
          type="tel"
          error={errors.contact_phone?.message}
        />

        <TextField
          name="company_name"
          control={control}
          label="Company Name"
          placeholder="PT Example Company"
          error={errors.company_name?.message}
        />
      </div>

      {/* Selected Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-lg font-semibold text-slate-900">Selected Products</h2>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {fields.length} {fields.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {errors.items?.root && (
          <p className="text-sm text-red-500 mt-1">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="relative rounded-lg border border-slate-200 p-4 bg-white shadow-sm transition-all hover:border-slate-300"
            >
              <input type="hidden" {...register(`items.${index}.product_id` as const)} aria-hidden="true" />
              <input type="hidden" {...register(`items.${index}.product_name` as const)} aria-hidden="true" />
              <input type="hidden" {...register(`items.${index}.variant` as const)} aria-hidden="true" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-950 truncate">
                    {item.product_name}
                  </h3>
                  {item.variant && (
                    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 mt-1">
                      {item.variant}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index, item.product_id, item.variant)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 -m-1"
                  aria-label={`Remove ${item.product_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label htmlFor={`items.${index}.quantity`} className="block text-xs font-medium text-slate-500 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = Number(item.quantity) || 1
                        handleQuantityChange(index, item.product_id, currentVal - 1, item.variant)
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
                      disabled={(item.quantity || 1) <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      id={`items.${index}.quantity`}
                      type="number"
                      {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                      className="flex h-9 w-20 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val)) {
                          handleQuantityChange(index, item.product_id, val, item.variant)
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentVal = Number(item.quantity) || 1
                        handleQuantityChange(index, item.product_id, currentVal + 1, item.variant)
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
                      disabled={(item.quantity || 1) >= 100000}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {errors.items?.[index]?.quantity && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Item-level notes */}
                <div>
                  <label htmlFor={`items.${index}.item_notes`} className="block text-xs font-medium text-slate-500 mb-1">
                    Special Specifications
                  </label>
                  <input
                    id={`items.${index}.item_notes`}
                    type="text"
                    placeholder="e.g., custom cable length, customized color"
                    {...register(`items.${index}.item_notes` as const)}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    onChange={(e) => {
                      handleNotesChange(index, item.product_id, e.target.value, item.variant)
                    }}
                  />
                  {errors.items?.[index]?.item_notes && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.items[index]?.item_notes?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RFQ Details (Project level) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">RFQ Details</h2>

        <TextareaField
          name="project_scope"
          control={control}
          label="Project Scope"
          placeholder="Describe the project requirements"
          rows={4}
          error={errors.project_scope?.message}
        />

        <TextField
          name="timeline"
          control={control}
          label="Timeline"
          type="date"
          error={errors.timeline?.message}
        />

        <TextareaField
          name="notes"
          control={control}
          label="Additional Notes"
          placeholder="Any additional information"
          rows={3}
          error={errors.notes?.message}
        />
      </div>

      {/* Error Message and Fallback Button */}
      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100 space-y-3">
          <p className="text-sm text-red-800">{submitError.message}</p>
          {submitError.fallbackUrl && (
            <a
              href={submitError.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                const spoke = trackingMetadata.source_domain ? trackingMetadata.source_domain.split('.')[0] : ''
                trackEvent(AnalyticsEvent.RFQ_FALLBACK_WHATSAPP, { spoke })
              }}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none cursor-pointer"
            >
              Kirim via WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 min-w-[168px] rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            Mengirim...
          </>
        ) : (
          'Submit RFQ'
        )}
      </button>
    </form>
  )
}
