import { scoreColor, scoreLabel } from '@/lib/scoring'

interface ScoreCircleProps {
  score: number
  label: string
  size?: number
}

export function ScoreCircle({ score, label, size = 96 }: ScoreCircleProps) {
  const color = scoreColor(score)
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={8}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={8}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs font-semibold" style={{ color }}>
          {scoreLabel(score)}
        </div>
      </div>
    </div>
  )
}
