/**
 * Meta Description checks.
 *
 * SEO best-practice rules:
 *  - Must be present
 *  - Below 70 characters is flagged as too short; ideal range is 120–158 characters
 *  - Above 158 characters is likely to be truncated
 *  - Should not be duplicated from title
 */

import type { AuditFinding, PageData } from '@/types/audit';

export function checkMetaDescription(page: PageData): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // ── 1. Presence ────────────────────────────────────────────────────────────
  if (!page.metaDescription) {
    findings.push({
      id: 'meta-desc-missing',
      category: 'Meta Description',
      label: 'Meta description is missing',
      status: 'fail',
      priority: 'high',
      explanation:
        'No meta description was found. While Google sometimes rewrites them, a well-crafted description improves click-through rates by giving searchers a preview of your page.',
      pointsDeducted: 15,
    });
    return findings;
  }

  const desc = page.metaDescription;
  const len = desc.length;

  // ── 2. Length ───────────────────────────────────────────────────────────────
  if (len < 70) {
    findings.push({
      id: 'meta-desc-too-short',
      category: 'Meta Description',
      label: 'Meta description is too short',
      status: 'warning',
      priority: 'medium',
      explanation: `Your meta description is only ${len} characters. Aim for 120–158 characters to give a compelling summary that fills the snippet in search results.`,
      value: desc,
      pointsDeducted: 8,
    });
  } else if (len > 158) {
    findings.push({
      id: 'meta-desc-too-long',
      category: 'Meta Description',
      label: 'Meta description may be truncated',
      status: 'warning',
      priority: 'low',
      explanation: `Your meta description is ${len} characters, which is likely to be cut off by Google. Aim to keep it under 158 characters.`,
      value: desc,
      pointsDeducted: 4,
    });
  } else {
    findings.push({
      id: 'meta-desc-length-ok',
      category: 'Meta Description',
      label: 'Meta description length is good',
      status: 'pass',
      priority: 'low',
      explanation: `Your meta description is ${len} characters — within the ideal 120–158 character range.`,
      value: desc,
      pointsDeducted: 0,
    });
  }

  // ── 3. Same as title ────────────────────────────────────────────────────────
  if (
    page.title &&
    desc.trim().toLowerCase() === page.title.trim().toLowerCase()
  ) {
    findings.push({
      id: 'meta-desc-duplicates-title',
      category: 'Meta Description',
      label: 'Meta description duplicates the page title',
      status: 'warning',
      priority: 'medium',
      explanation:
        'Your meta description and page title are identical. Use the description to expand on the title and entice users to click — they should complement each other.',
      value: desc,
      pointsDeducted: 6,
    });
  }

  return findings;
}
