import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AuditResults } from '@/components/report/AuditResults'
import type { AuditData } from '@/lib/audit'
import type { Recommendation } from '@/lib/recommendations'
import type { AISummary } from '@/lib/ai'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AuditReportPage({ params }: PageProps) {
  const { id } = await params
  const report = await prisma.auditReport.findUnique({
    where: { id },
    include: { lead: true },
  })

  if (!report) {
    notFound()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AuditResults
        reportId={report.id}
        businessName={report.lead.businessName}
        website={report.lead.website}
        createdAt={report.createdAt.toISOString()}
        auditData={stored.auditData}
        recommendations={stored.recommendations}
        aiSummary={aiSummary}
      />
    </div>
  )
}
