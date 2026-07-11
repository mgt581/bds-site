/**
 * Heading structure checks (H1 / H2 / H3).
 *
 * SEO best-practice rules:
 *  - Page should have exactly one H1
 *  - H1 should be present (critical)
 *  - At least one H2 recommended for content structure
 *  - Multiple H1s are a signal of poor structure
 */

import type { AuditFinding, PageData } from '@/types/audit';

export function checkHeadings(page: PageData): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { h1s, h2s } = page;

  // ── 1. H1 presence ─────────────────────────────────────────────────────────
  if (h1s.length === 0) {
    findings.push({
      id: 'h1-missing',
      category: 'Headings',
      label: 'No H1 heading found',
      status: 'fail',
      priority: 'high',
      explanation:
        'Your page has no H1 heading. The H1 is the main title of the page and tells search engines (and visitors) what the page is about. Every page should have exactly one.',
      pointsDeducted: 15,
    });
  } else if (h1s.length === 1) {
    findings.push({
      id: 'h1-present',
      category: 'Headings',
      label: 'Single H1 heading found',
      status: 'pass',
      priority: 'low',
      explanation: `Good — your page has exactly one H1: "${h1s[0]}".`,
      value: h1s[0],
      pointsDeducted: 0,
    });
  } else {
    findings.push({
      id: 'h1-multiple',
      category: 'Headings',
      label: `Multiple H1 headings found (${h1s.length})`,
      status: 'warning',
      priority: 'medium',
      explanation: `Your page has ${h1s.length} H1 headings. Search engines expect only one H1 per page. Review your heading hierarchy and ensure only the most important heading uses H1.`,
      value: h1s.join(' | '),
      pointsDeducted: 8,
    });
  }

  // ── 2. H2 presence ─────────────────────────────────────────────────────────
  if (h2s.length === 0) {
    findings.push({
      id: 'h2-missing',
      category: 'Headings',
      label: 'No H2 headings found',
      status: 'warning',
      priority: 'medium',
      explanation:
        'No H2 headings were found. H2s break your page into sections, making content easier to scan for both users and search engines. Adding descriptive H2s can improve topical relevance.',
      pointsDeducted: 6,
    });
  } else {
    findings.push({
      id: 'h2-present',
      category: 'Headings',
      label: `${h2s.length} H2 heading${h2s.length > 1 ? 's' : ''} found`,
      status: 'pass',
      priority: 'low',
      explanation: `Good — your page uses ${h2s.length} H2 heading${h2s.length > 1 ? 's' : ''} to organise its content.`,
      value: h2s.slice(0, 3).join(' | ') + (h2s.length > 3 ? '…' : ''),
      pointsDeducted: 0,
    });
  }

  return findings;
}
