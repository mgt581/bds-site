import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { AISummary } from '@/lib/ai'

export function AISummaryCard({ summary }: { summary: AISummary }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-bold text-brand-dark">Executive Summary</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-gray-700">{summary.executiveSummary}</p>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-brand-dark">Biggest Opportunities</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
            {summary.biggestOpportunities.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-brand-dark">Priority Action Plan</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
            {summary.priorityActionPlan.map((o, i) => (
              <li key={i}>{o.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg bg-brand-dark/5 p-3 text-sm text-gray-700">
          <span className="font-semibold text-brand-dark">Expected improvements: </span>
          {summary.expectedImprovements}
        </div>
      </CardBody>
    </Card>
  )
}
