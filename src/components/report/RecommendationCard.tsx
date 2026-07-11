import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import type { Recommendation } from '@/lib/recommendations'

const impactColor: Record<Recommendation['impact'], 'red' | 'amber' | 'blue'> = {
  High: 'red',
  Medium: 'amber',
  Low: 'blue',
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={impactColor[rec.impact]}>{rec.impact} Impact</Badge>
          <Badge color="gray">{rec.difficulty}</Badge>
          <span className="text-xs uppercase tracking-wide text-gray-400">{rec.category}</span>
        </div>
        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
        <p className="text-sm text-gray-600">{rec.description}</p>
        <div className="mt-2 grid gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <span className="font-medium text-gray-800">Why it matters: </span>
            {rec.whyItMatters}
          </div>
          <div>
            <span className="font-medium text-gray-800">How to fix: </span>
            {rec.howToFix}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
