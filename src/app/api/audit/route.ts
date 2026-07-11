import { NextRequest, NextResponse } from 'next/server'
import { auditRequestSchema } from '@/lib/validations/audit'
import { runAudit } from '@/lib/audit'
import { generateRecommendations } from '@/lib/recommendations'
import { generateAISummary } from '@/lib/ai'
import { generateHtmlReport } from '@/lib/report'
import { sendCustomerAuditEmail, sendAdminNotificationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'

export const maxDuration = 60

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many audit requests. Please try again later.',
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = auditRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, website, businessName } = parsed.data

    // Run the audit engine against the target website.
    const auditData = await runAudit(website)
    const recommendations = generateRecommendations(auditData)
    const aiSummary = await generateAISummary(auditData, recommendations, businessName)

    // Persist the lead and audit report.
    const lead = await prisma.lead.create({
      data: { name, email, phone, website, businessName },
    })

    const reportInput = {
      businessName,
      website,
      createdAt: new Date().toISOString(),
      auditData,
      recommendations,
      aiSummary,
    }
    const reportHtml = generateHtmlReport(reportInput)

    const report = await prisma.auditReport.create({
      data: {
        leadId: lead.id,
        overallScore: auditData.scores.overall,
        technicalScore: auditData.scores.technical,
        onPageScore: auditData.scores.onPage,
        performanceScore: auditData.scores.performance,
        localScore: auditData.scores.local,
        accessibilityScore: auditData.scores.accessibility,
        auditData: JSON.parse(JSON.stringify({ auditData, recommendations })),
        reportHtml,
        aiSummary: JSON.stringify(aiSummary),
      },
    })

    // Fire off emails without blocking the response on delivery failures.
    const emailResults = await Promise.allSettled([
      sendCustomerAuditEmail({
        to: email,
        businessName,
        reportId: report.id,
        auditData,
        recommendations,
      }),
      sendAdminNotificationEmail({
        leadId: lead.id,
        reportId: report.id,
        name,
        email,
        phone,
        website,
        businessName,
        auditData,
      }),
    ])

    const emailWarnings = emailResults
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message || 'Unknown email error')

    return NextResponse.json({
      success: true,
      reportId: report.id,
      leadId: lead.id,
      scores: auditData.scores,
      emailWarnings: emailWarnings.length > 0 ? emailWarnings : undefined,
    })
  } catch (err) {
    console.error('[api/audit] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong while running your audit. Please try again.' },
      { status: 500 }
    )
  }
}
