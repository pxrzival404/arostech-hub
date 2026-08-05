import { Lead } from '@prisma/client'

export async function alertNewRfq(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram bot credentials missing')
    return
  }

  const text = `<b>NEW RFQ RECEIVED</b>
Lead ID: <code>${lead.id}</code>
Segment: ${lead.segment}
Name: ${lead.contactName || 'N/A'}
Email: ${lead.contactEmail || 'N/A'}
Company: ${lead.companyName || 'N/A'}
Products: ${lead.productCategory || 'N/A'}
Total Quantity: ${lead.quantity || 0}
Project Scope: ${lead.projectScope || 'N/A'}
Timeline: ${lead.timeline || 'N/A'}`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      console.error(`Telegram API error: ${res.status} ${res.statusText}`)
    }
  } catch (error) {
    console.error('Failed to send Telegram alert:', error)
  }
}

export async function alertRfqFailure(error: Error, payload: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram bot credentials missing')
    return
  }

  const text = `🚨 <b>RFQ SUBMISSION FAILURE</b>
Error: ${error.message}
Payload: <pre>${JSON.stringify(payload, null, 2)}</pre>`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      console.error(`Telegram API error: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    console.error('Failed to send Telegram error alert:', err)
  }
}

export async function alertQueueFailure(job: any, error: Error): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('Telegram bot credentials missing')
    return
  }

  const text = `🚨 <b>NOTIFICATION QUEUE FAILURE</b>
Job ID: <code>${job.id}</code>
Type: ${job.type}
Lead ID: <code>${job.leadId}</code>
Attempts: ${job.attempts}/${job.maxAttempts}
Error: ${error.message}
Payload: <pre>${JSON.stringify(job.payload, null, 2)}</pre>`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      console.error(`Telegram API error: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    console.error('Failed to send Telegram queue failure alert:', err)
  }
}

