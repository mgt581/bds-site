import { ScoreCard } from './ScoreCard'
import { AISummaryCard } from './AISummary'
import { RecommendationCard } from './RecommendationCard'
import { Button } from '@/components/ui/Button'
import type { AuditData } from '@/lib/audit'
import type { Recommendation } from '@/lib/recommendations'
import type { AISummary } from '@/lib/ai'

interface AuditResultsProps {
  reportId: string
  businessName: string
  website: string
  createdAt: string
  auditData: AuditData
  recommendations: Recommendation[]
  aiSummary: AISummary
}

export function AuditResults({
  reportId,
  businessName,
  website,
  createdAt,
  auditData,
  recommendations,
  aiSummary,
}: AuditResultsProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{businessName}</h1>
          <p className="text-sm text-gray-500">{website}</p>
          <p className="text-xs text-gray-400">Report generated on {date}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/reports/${reportId}/pdf`}>
            <Button variant="outline">Download PDF</Button>
          </a>
          <a href="https://bryantdigitalsolutions.com/contactus.html">
            <Button variant="secondary">Book a Strategy Call</Button>
          </a>
        </div>
      </div>

      <ScoreCard scores={auditData.scores} />

      <AISummaryCard summary={aiSummary} />

      <div>
        <h2 className="mb-4 text-lg font-bold text-brand-dark">
          Recommendations ({recommendations.length})
        </h2>
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
          {recommendations.length === 0 && (
            <p className="text-sm text-gray-500">
              Great news - no major issues were detected in this audit!
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark p-8 text-center text-white">
        <h2 className="text-xl font-bold">Ready to fix these issues?</h2>
        <p className="mt-2 text-sm text-gray-300">
          Book a free 30-minute strategy call and we&apos;ll walk you through a custom action plan.
        </p>
        <a href="https://bryantdigitalsolutions.com/contactus.html">
          <Button variant="secondary" className="mt-4">
            Book a Free Strategy Call
          </Button>
        </a>
      </div>
    </div>
  )
}
