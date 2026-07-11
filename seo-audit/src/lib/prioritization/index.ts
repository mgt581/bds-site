/**
 * Prioritization helpers.
 *
 * Currently priority is set by each individual check — this module provides
 * helper functions for grouping and summarising findings by priority.
 *
 * Future iterations can introduce ML-based or heuristic re-prioritization
 * based on the specific business type or industry.
 */

import type { AuditFinding, AuditResult } from '@/types/audit';

export function buildSummary(
  findings: AuditFinding[],
): AuditResult['summary'] {
  return {
    high: findings.filter((f) => f.priority === 'high' && f.status !== 'pass').length,
    medium: findings.filter((f) => f.priority === 'medium' && f.status !== 'pass').length,
    low: findings.filter((f) => f.priority === 'low' && f.status !== 'pass').length,
    passed: findings.filter((f) => f.status === 'pass').length,
  };
}

export function groupByPriority(findings: AuditFinding[]): {
  high: AuditFinding[];
  medium: AuditFinding[];
  low: AuditFinding[];
  passed: AuditFinding[];
} {
  return {
    high: findings.filter((f) => f.priority === 'high' && f.status !== 'pass'),
    medium: findings.filter((f) => f.priority === 'medium' && f.status !== 'pass'),
    low: findings.filter((f) => f.priority === 'low' && f.status !== 'pass'),
    passed: findings.filter((f) => f.status === 'pass'),
  };
}
