import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { scoreColor } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { auditReports: { orderBy: { createdAt: 'desc' } } },
  })

  if (!lead) notFound()

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-brand-dark hover:underline">
        &larr; Back to Leads
      </Link>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-dark">{lead.businessName}</h1>
            <p className="text-sm text-gray-500">{lead.website}</p>
          </div>
          <LeadStatusBadge status={lead.status} />
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase text-gray-400">Contact Name</div>
            <div className="text-sm text-gray-800">{lead.name}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-gray-400">Email</div>
            <div className="text-sm text-gray-800">{lead.email}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-gray-400">Phone</div>
            <div className="text-sm text-gray-800">{lead.phone || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-gray-400">Created</div>
            <div className="text-sm text-gray-800">
              {new Date(lead.createdAt).toLocaleString()}
            </div>
          </div>
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold text-brand-dark">Audit Reports</h2>
        <div className="flex flex-col gap-3">
          {lead.auditReports.map((report) => (
            <Card key={report.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: scoreColor(report.overallScore) }}
                  >
                    {report.overallScore}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Technical: {report.technicalScore}</span>
                  <span>On-Page: {report.onPageScore}</span>
                  <span>Performance: {report.performanceScore}</span>
                  <span>Local: {report.localScore}</span>
                  <span>A11y: {report.accessibilityScore}</span>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`/audit/${report.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand-dark hover:underline"
                  >
                    View Report
                  </a>
                  <a
                    href={`/api/reports/${report.id}/pdf`}
                    className="text-sm font-medium text-brand-dark hover:underline"
                  >
                    Download PDF
                  </a>
                </div>
              </CardBody>
            </Card>
          ))}
          {lead.auditReports.length === 0 && (
            <p className="text-sm text-gray-500">No audit reports found for this lead.</p>
          )}
        </div>
      </div>
    </div>
  )
}
