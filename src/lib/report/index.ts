import type { AuditData } from '../audit'
import type { Recommendation } from '../recommendations'
import type { AISummary } from '../ai'
import { scoreColor, scoreLabel } from '../scoring'

export interface ReportInput {
  businessName: string
  website: string
  createdAt: string
  auditData: AuditData
  recommendations: Recommendation[]
  aiSummary: AISummary
}

const BRAND_DARK = '#1e3a5f'
const BRAND_GOLD = '#d4a017'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function scoreCard(label: string, score: number): string {
  return `
    <div style="flex:1;min-width:140px;background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
      <div style="font-size:32px;font-weight:700;color:${scoreColor(score)};">${score}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">${label}</div>
      <div style="font-size:12px;font-weight:600;color:${scoreColor(score)};margin-top:2px;">${scoreLabel(score)}</div>
    </div>`
}

function recommendationRow(rec: Recommendation): string {
  const impactColors: Record<string, string> = {
    High: '#dc2626',
    Medium: '#d97706',
    Low: '#2563eb',
  }
  return `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px 8px;vertical-align:top;">
        <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:700;color:#fff;background:${impactColors[rec.impact]};">${rec.impact}</span>
      </td>
      <td style="padding:12px 8px;vertical-align:top;">
        <div style="font-weight:600;color:#111827;">${escapeHtml(rec.title)}</div>
        <div style="font-size:13px;color:#4b5563;margin-top:4px;">${escapeHtml(rec.description)}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:6px;"><strong>Why it matters:</strong> ${escapeHtml(rec.whyItMatters)}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;"><strong>How to fix:</strong> ${escapeHtml(rec.howToFix)}</div>
      </td>
      <td style="padding:12px 8px;vertical-align:top;font-size:12px;color:#6b7280;white-space:nowrap;">${rec.difficulty}</td>
    </tr>`
}

export function generateHtmlReport(input: ReportInput): string {
  const { businessName, website, createdAt, auditData, recommendations, aiSummary } = input
  const scores = auditData.scores
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SEO Audit Report - ${escapeHtml(businessName)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <div style="background:${BRAND_DARK};padding:32px 24px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:0.5px;">BRYANT DIGITAL SOLUTIONS</div>
    <div style="font-size:13px;color:${BRAND_GOLD};margin-top:4px;letter-spacing:2px;">FREE SEO AUDIT REPORT</div>
  </div>

  <div style="max-width:800px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:24px;border:1px solid #e5e7eb;">
      <h1 style="margin:0 0 8px;font-size:20px;color:${BRAND_DARK};">${escapeHtml(businessName)}</h1>
      <div style="font-size:13px;color:#6b7280;">${escapeHtml(website)}</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Report generated on ${date}</div>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
      ${scoreCard('Overall Score', scores.overall)}
      ${scoreCard('Technical', scores.technical)}
      ${scoreCard('On-Page', scores.onPage)}
      ${scoreCard('Performance', scores.performance)}
      ${scoreCard('Local SEO', scores.local)}
      ${scoreCard('Accessibility', scores.accessibility)}
    </div>

    <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:24px;border:1px solid #e5e7eb;">
      <h2 style="margin:0 0 12px;font-size:16px;color:${BRAND_DARK};">Executive Summary</h2>
      <p style="font-size:14px;line-height:1.6;color:#374151;">${escapeHtml(aiSummary.executiveSummary)}</p>
      <h3 style="font-size:14px;color:${BRAND_DARK};margin:16px 0 8px;">Biggest Opportunities</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.7;">
        ${aiSummary.biggestOpportunities.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}
      </ul>
      <h3 style="font-size:14px;color:${BRAND_DARK};margin:16px 0 8px;">Priority Action Plan</h3>
      <ol style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.7;">
        ${aiSummary.priorityActionPlan.map((o) => `<li>${escapeHtml(o.replace(/^\d+\.\s*/, ''))}</li>`).join('')}
      </ol>
      <p style="font-size:13px;color:#374151;margin-top:12px;"><strong>Expected improvements:</strong> ${escapeHtml(aiSummary.expectedImprovements)}</p>
    </div>

    <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:24px;border:1px solid #e5e7eb;">
      <h2 style="margin:0 0 12px;font-size:16px;color:${BRAND_DARK};">Recommendations (${recommendations.length})</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;text-align:left;">
            <th style="padding:8px;font-size:12px;color:#6b7280;">Impact</th>
            <th style="padding:8px;font-size:12px;color:#6b7280;">Recommendation</th>
            <th style="padding:8px;font-size:12px;color:#6b7280;">Effort</th>
          </tr>
        </thead>
        <tbody>
          ${recommendations.map(recommendationRow).join('')}
        </tbody>
      </table>
    </div>

    <div style="background:${BRAND_DARK};border-radius:12px;padding:32px 24px;text-align:center;margin-bottom:24px;">
      <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">Ready to fix these issues?</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#d1d5db;">Book a free 30-minute strategy call with our team and we'll walk you through a custom action plan.</p>
      <a href="https://bryantdigitalsolutions.com/contactus.html" style="display:inline-block;background:${BRAND_GOLD};color:${BRAND_DARK};font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">Book a Free Strategy Call</a>
    </div>

    <div style="text-align:center;padding:16px;font-size:12px;color:#9ca3af;">
      Bryant Digital Solutions &middot; info@bryantdigitalsolutions.com &middot; This report was generated automatically and reflects a point-in-time snapshot of publicly available page data.
    </div>
  </div>
</body>
</html>`
}
