interface ProgressProps {
  value: number // 0-100
  color?: string
  className?: string
}

export function Progress({ value, color = '#1e3a5f', className = '' }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
