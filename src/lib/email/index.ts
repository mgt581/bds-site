import { Resend } from 'resend'
import type { AuditData } from '../audit'
import type { Recommendation } from '../recommendations'
import { renderCustomerEmail } from './templates/customer'
import { renderAdminEmail } from './templates/admin'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bryantdigitalsolutions.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bryantdigitalsolutions.com'

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendCustomerAuditEmail(params: {
  to: string
  businessName: string
  reportId: string
  auditData: AuditData
  recommendations: Recommendation[]
}): Promise<{ sent: boolean; error?: string }> {
  const client = getClient()
  const { subject, html } = renderCustomerEmail({
    businessName: params.businessName,
    reportId: params.reportId,
    auditData: params.auditData,
    recommendations: params.recommendations,
  })

  if (!client) {
    console.warn('[email] RESEND_API_KEY not set - skipping customer email send. Subject:', subject)
    return { sent: false, error: 'Email service not configured' }
  }

  try {
    await client.emails.send({ from: FROM_EMAIL, to: params.to, subject, html })
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[email] Failed to send customer email:', message)
    return { sent: false, error: message }
  }
}

export async function sendAdminNotificationEmail(params: {
  leadId: string
  reportId: string
  name: string
  email: string
  phone?: string
  website: string
  businessName: string
  auditData: AuditData
}): Promise<{ sent: boolean; error?: string }> {
  const client = getClient()
  const { subject, html } = renderAdminEmail(params)

  if (!client) {
    console.warn('[email] RESEND_API_KEY not set - skipping admin email send. Subject:', subject)
    return { sent: false, error: 'Email service not configured' }
  }

  try {
    await client.emails.send({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject, html })
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[email] Failed to send admin email:', message)
    return { sent: false, error: message }
  }
}
