'use client'

interface SearchFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  scoreRange: string
  onScoreRangeChange: (value: string) => void
}

export function SearchFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  scoreRange,
  onScoreRangeChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search by name, email, or website..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
      >
        <option value="">All Statuses</option>
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="WON">Won</option>
        <option value="LOST">Lost</option>
      </select>
      <select
        value={scoreRange}
        onChange={(e) => onScoreRangeChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
      >
        <option value="">All Scores</option>
        <option value="0-40">Poor (&lt;40)</option>
        <option value="40-60">Fair (40-60)</option>
        <option value="60-80">Good (60-80)</option>
        <option value="80-100">Excellent (&gt;80)</option>
      </select>
    </div>
  )
}
