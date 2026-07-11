/**
 * Scoring engine.
 *
 * Starts at 100 and subtracts penalty points from each failing/warning finding.
 * The final score is clamped to [0, 100].
 *
 * Future iterations can weight categories differently or add bonus points
 * for positive signals (e.g. structured data, fast LCP).
 */

import type { AuditFinding } from '@/types/audit';

export function calculateScore(findings: AuditFinding[]): number {
  const totalDeducted = findings.reduce(
    (sum, finding) => sum + (finding.pointsDeducted ?? 0),
    0,
  );
  return Math.max(0, Math.min(100, 100 - totalDeducted));
}

/**
 * Returns a human-readable grade label for a numeric score.
 */
export function scoreLabel(score: number): { label: string; colour: string } {
  if (score >= 90) return { label: 'Excellent', colour: '#2d9249' };
  if (score >= 75) return { label: 'Good', colour: '#5c9e31' };
  if (score >= 60) return { label: 'Needs Work', colour: '#e07b00' };
  if (score >= 40) return { label: 'Poor', colour: '#d14b00' };
  return { label: 'Critical', colour: '#c0392b' };
}
