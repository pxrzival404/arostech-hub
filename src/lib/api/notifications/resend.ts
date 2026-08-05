import { Resend } from 'resend'
import { Lead } from '@prisma/client'

export async function sendRfqAcknowledgment(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.error('Resend email credentials missing')
    return
  }

  const resend = new Resend(apiKey)

  const to = lead.contactEmail || ''
  if (!to) {
    console.error('Lead contact email missing')
    return
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Quotation Request Received - RFQ #${lead.id}`,
      html: `<p>Dear ${lead.contactName || 'Valued Customer'},</p>
<p>Thank you for submitting your Request for Quotation (RFQ).</p>
<p>Our sales team will review your request and get back to you shortly.</p>
<p><b>RFQ Details:</b></p>
<ul>
  <li>Segment: ${lead.segment}</li>
  <li>Products: ${lead.productCategory || 'N/A'}</li>
  <li>Total Quantity: ${lead.quantity || 0}</li>
</ul>
<p>Best regards,<br/>Sentra Daya Team</p>`,
    })

    if (error) {
      console.error('Resend ACK email sending failed:', error)
    }
  } catch (err) {
    console.error('Failed to send ACK email:', err)
  }
}

export async function sendInternalNotification(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.error('Resend email credentials missing')
    return
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: fromEmail, // Sales notifications are routed to the verified sender email domain/admin address
      subject: `[SALES ALERT] New ${lead.segment} RFQ Submission - #${lead.id}`,
      html: `<h2>New RFQ Received</h2>
<p><b>Lead ID:</b> ${lead.id}</p>
<p><b>Segment:</b> ${lead.segment}</p>
<p><b>Contact Name:</b> ${lead.contactName || 'N/A'}</p>
<p><b>Contact Email:</b> ${lead.contactEmail || 'N/A'}</p>
<p><b>Contact Phone:</b> ${lead.contactPhone || 'N/A'}</p>
<p><b>Company:</b> ${lead.companyName || 'N/A'}</p>
<p><b>Products:</b> ${lead.productCategory || 'N/A'}</p>
<p><b>Quantity:</b> ${lead.quantity || 0}</p>
<p><b>Project Scope:</b></p>
<p>${lead.projectScope || 'N/A'}</p>
<p><b>Timeline:</b> ${lead.timeline || 'N/A'}</p>
<p><b>Notes:</b> ${lead.notes || 'N/A'}</p>`,
    })

    if (error) {
      console.error('Resend internal email sending failed:', error)
    }
  } catch (err) {
    console.error('Failed to send internal email notification:', err)
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.error('Resend email credentials missing')
    return
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Atur Ulang Kata Sandi - DBSN Portal',
      html: `<h2>Atur Ulang Kata Sandi</h2>
<p>Halo,</p>
<p>Kami menerima permintaan untuk mengatur ulang kata sandi akun DBSN Portal Anda.</p>
<p>Silakan klik tautan di bawah ini untuk mengatur ulang kata sandi Anda. Tautan ini akan kedaluwarsa dalam 1 jam:</p>
<p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#2563eb;color:white;text-decoration:none;border-radius:6px;">Atur Ulang Kata Sandi</a></p>
<p>Jika tautan di atas tidak berfungsi, salin dan tempel URL berikut ke peramban Anda:</p>
<p>${resetUrl}</p>
<p>Jika Anda tidak meminta ini, abaikan saja email ini.</p>
<p>Best regards,<br/>Sentra Daya Team</p>`,
    })

    if (error) {
      console.error('Resend password reset email sending failed:', error)
    }
  } catch (err) {
    console.error('Failed to send password reset email:', err)
  }
}

