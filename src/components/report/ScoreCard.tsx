import { ScoreCircle } from '@/components/ui/ScoreCircle'
import type { AuditScores } from '@/lib/scoring'

interface ScoreCardProps {
  scores: AuditScores
}

export function ScoreCard({ scores }: ScoreCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex flex-col items-center gap-4">
        <ScoreCircle score={scores.overall} label="Overall Score" size={140} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <ScoreCircle score={scores.technical} label="Technical" size={80} />
        <ScoreCircle score={scores.onPage} label="On-Page" size={80} />
        <ScoreCircle score={scores.performance} label="Performance" size={80} />
        <ScoreCircle score={scores.local} label="Local SEO" size={80} />
        <ScoreCircle score={scores.accessibility} label="Accessibility" size={80} />
      </div>
    </div>
  )
}
