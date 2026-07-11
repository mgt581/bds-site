import type { AuditData } from '../../audit'

const BRAND_DARK = '#1e3a5f'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface AdminEmailProps {
  leadId: string
  reportId: string
  name: string
  email: string
  phone?: string
  website: string
  businessName: string
  auditData: AuditData
}

export function renderAdminEmail({
  leadId,
  reportId,
  name,
  email,
  phone,
  website,
  businessName,
  auditData,
}: AdminEmailProps): { subject: string; html: string } {
  const subject = `New SEO Audit Lead: ${businessName} - Score: ${auditData.scores.overall}`
  const adminLink = `${APP_URL}/admin/leads/${leadId}`
  const reportLink = `${APP_URL}/audit/${reportId}`

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:${BRAND_DARK};padding:20px 24px;">
        <div style="font-size:16px;font-weight:800;color:#fff;">New SEO Audit Lead</div>
      </div>
      <div style="padding:24px;">
        <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-weight:700;width:140px;">Business</td><td>${businessName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Email</td><td>${email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Phone</td><td>${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Website</td><td>${website}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Overall Score</td><td>${auditData.scores.overall}/100</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Technical</td><td>${auditData.scores.technical}/100</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">On-Page</td><td>${auditData.scores.onPage}/100</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Performance</td><td>${auditData.scores.performance}/100</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Local</td><td>${auditData.scores.local}/100</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Accessibility</td><td>${auditData.scores.accessibility}/100</td></tr>
        </table>
        <div style="margin-top:24px;">
          <a href="${adminLink}" style="display:inline-block;background:${BRAND_DARK};color:#fff;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;margin-right:8px;">View in Admin Dashboard</a>
          <a href="${reportLink}" style="display:inline-block;background:#e5e7eb;color:#111827;font-weight:700;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">View Full Report</a>
        </div>
      </div>
    </div>
  </div>`

  return { subject, html }
}
