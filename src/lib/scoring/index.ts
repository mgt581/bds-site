export interface AuditScores {
  overall: number
  technical: number
  onPage: number
  performance: number
  local: number
  accessibility: number
}

const WEIGHTS = {
  technical: 0.25,
  onPage: 0.3,
  performance: 0.2,
  local: 0.15,
  accessibility: 0.1,
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Deducts points from a starting score of 100 based on the number of issues
 * found, with configurable per-issue penalty. Never drops below zero.
 */
function scoreFromIssues(issueCount: number, penaltyPerIssue = 12): number {
  return clampScore(100 - issueCount * penaltyPerIssue)
}

export interface ScoringInput {
  technicalIssueCount: number
  onPageIssueCount: number
  performanceScore: number
  localIssueCount: number
  accessibilityIssueCount: number
}

export function calculateScores(input: ScoringInput): AuditScores {
  const technical = scoreFromIssues(input.technicalIssueCount, 10)
  const onPage = scoreFromIssues(input.onPageIssueCount, 8)
  const performance = clampScore(input.performanceScore)
  const local = scoreFromIssues(input.localIssueCount, 15)
  const accessibility = scoreFromIssues(input.accessibilityIssueCount, 12)

  const overall = clampScore(
    technical * WEIGHTS.technical +
      onPage * WEIGHTS.onPage +
      performance * WEIGHTS.performance +
      local * WEIGHTS.local +
      accessibility * WEIGHTS.accessibility
  )

  return { overall, technical, onPage, performance, local, accessibility }
}

export function scoreLabel(score: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
  if (score < 40) return 'Poor'
  if (score < 60) return 'Fair'
  if (score < 80) return 'Good'
  return 'Excellent'
}

export function scoreColor(score: number): string {
  if (score < 40) return '#dc2626' // red-600
  if (score < 60) return '#d97706' // amber-600
  if (score < 80) return '#2563eb' // blue-600
  return '#16a34a' // green-600
}
