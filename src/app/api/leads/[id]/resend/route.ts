import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCustomerAuditEmail } from '@/lib/email'
import type { AuditData } from '@/lib/audit'
import type { Recommendation } from '@/lib/recommendations'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { auditReports: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    if (!lead || lead.auditReports.length === 0) {
      return NextResponse.json({ error: 'Lead or report not found' }, { status: 404 })
    }

    const report = lead.auditReports[0]
    const stored = report.auditData as unknown as {
      auditData: AuditData
      recommendations: Recommendation[]
    }

    const result = await sendCustomerAuditEmail({
      to: lead.email,
      businessName: lead.businessName,
      reportId: report.id,
      auditData: stored.auditData,
      recommendations: stored.recommendations,
    })

    if (!result.sent) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/leads/:id/resend] Failed to resend email:', err)
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 })
  }
}
