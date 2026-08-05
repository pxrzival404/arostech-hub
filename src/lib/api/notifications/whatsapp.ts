import { RfqB2BInput, RfqB2GInput } from '../../schema/rfq-schemas'

export function buildWhatsAppFallbackUrl(formData: RfqB2BInput | RfqB2GInput): string {
  const phone = (process.env.WHATSAPP_SALES_NUMBER || '').replace(/[^\d]/g, '')

  let text = `Halo Sales Team Sentra Daya,
Saya ingin mengajukan RFQ dengan detail berikut:

RFQ Segment: ${formData.segment}`

  text += `\nContact Name: ${formData.contact_name || ''}`
  text += `\nContact Email: ${formData.contact_email || ''}`
  if (formData.contact_phone) {
    text += `\nContact Phone: ${formData.contact_phone}`
  }
  if (formData.company_name) {
    text += `\nCompany: ${formData.company_name}`
  }

  text += `\n\nSelected Products:`
  formData.items.forEach((item) => {
    text += `\n- ${item.product_name} (Qty: ${item.quantity})`
    if (item.variant) {
      text += ` [Variant: ${item.variant}]`
    }
    if (item.item_notes) {
      text += ` [Item Notes: ${item.item_notes}]`
    }
  })

  if (formData.project_scope) {
    text += `\n\nProject Scope: ${formData.project_scope}`
  }
  if (formData.timeline) {
    text += `\nTimeline: ${formData.timeline}`
  }

  if (formData.segment === 'B2G') {
    const b2gData = formData as RfqB2GInput
    text += `\nProcurement Type: ${b2gData.procurement_type}`
    if (b2gData.dipa_reference) {
      text += `\nDIPA Reference: ${b2gData.dipa_reference}`
    }
  }

  if (formData.notes) {
    text += `\n\nAdditional Notes: ${formData.notes}`
  }

  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${phone}?text=${encodedText}`
}
