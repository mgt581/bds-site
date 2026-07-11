import type { AuditData } from '../../audit'
import type { Recommendation } from '../../recommendations'
import { scoreColor, scoreLabel } from '../../scoring'

const BRAND_DARK = '#1e3a5f'
const BRAND_GOLD = '#d4a017'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface CustomerEmailProps {
  businessName: string
  reportId: string
  auditData: AuditData
  recommendations: Recommendation[]
}

export function renderCustomerEmail({
  businessName,
  reportId,
  auditData,
  recommendations,
}: CustomerEmailProps): { subject: string; html: string } {
  const subject = `Your Free SEO Audit for ${businessName} is Ready!`
  const topRecs = recommendations.slice(0, 3)
  const reportLink = `${APP_URL}/audit/${reportId}`
  const bookingLink = 'https://bryantdigitalsolutions.com/contactus.html'

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f3f4f6;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:${BRAND_DARK};padding:28px 24px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#fff;">BRYANT DIGITAL SOLUTIONS</div>
        <div style="font-size:12px;color:${BRAND_GOLD};margin-top:4px;letter-spacing:1.5px;">YOUR SEO AUDIT IS READY</div>
      </div>
      <div style="padding:28px 24px;">
        <p style="font-size:15px;color:#111827;">Hi there,</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;">
          Thanks for requesting a free SEO audit for <strong>${businessName}</strong>! We've completed the analysis and your results are ready to view.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;width:120px;height:120px;border-radius:50%;background:${scoreColor(auditData.scores.overall)};color:#fff;line-height:120px;font-size:36px;font-weight:800;">
            ${auditData.scores.overall}
          </div>
          <div style="font-size:14px;color:#6b7280;margin-top:8px;">Overall Score: <strong>${scoreLabel(auditData.scores.overall)}</strong></div>
        </div>
        <h3 style="font-size:14px;color:${BRAND_DARK};margin-bottom:8px;">Top Recommendations</h3>
        <ul style="padding-left:18px;margin:0 0 20px;">
          ${topRecs
            .map(
              (r) =>
                `<li style="font-size:13px;color:#374151;margin-bottom:6px;"><strong>${r.title}</strong> — ${r.description}</li>`
            )
            .join('')}
        </ul>
        <div style="text-align:center;margin:28px 0 8px;">
          <a href="${reportLink}" style="display:inline-block;background:${BRAND_DARK};color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin:4px;">View Full Report</a>
          <a href="${bookingLink}" style="display:inline-block;background:${BRAND_GOLD};color:${BRAND_DARK};font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin:4px;">Book a Free Strategy Call</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:11px;color:#9ca3af;">
        Bryant Digital Solutions &middot; info@bryantdigitalsolutions.com
      </div>
    </div>
  </div>`

  return { subject, html }
}
