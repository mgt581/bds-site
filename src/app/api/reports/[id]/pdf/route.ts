import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateAuditPdf } from '@/lib/pdf'
import type { AuditData } from '@/lib/audit'
import type { Recommendation } from '@/lib/recommendations'
import type { AISummary } from '@/lib/ai'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const report = await prisma.auditReport.findUnique({
      where: { id },
      include: { lead: true },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const stored = report.auditData as unknown as {
      auditData: AuditData
      recommendations: Recommendation[]
    }
    const aiSummary: AISummary = report.aiSummary
      ? JSON.parse(report.aiSummary)
      : {
          executiveSummary: '',
          biggestOpportunities: [],
          priorityActionPlan: [],
          expectedImprovements: '',
        }

    const pdfBuffer = await generateAuditPdf({
      businessName: report.lead.businessName,
      website: report.lead.website,
      createdAt: report.createdAt.toISOString(),
      auditData: stored.auditData,
      recommendations: stored.recommendations,
      aiSummary,
    })

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="seo-audit-${report.lead.businessName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[api/reports/:id/pdf] Failed to generate PDF:', err)
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 })
  }
}
