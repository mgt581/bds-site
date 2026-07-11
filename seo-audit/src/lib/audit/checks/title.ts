/**
 * Page Title checks.
 *
 * SEO best-practice rules:
 *  - Title must be present
 *  - Optimal length: 30–60 characters
 *  - Should not be generic (e.g. "Home", "Untitled")
 */

import type { AuditFinding, PageData } from '@/types/audit';

const GENERIC_TITLES = new Set([
  'home',
  'index',
  'untitled',
  'untitled document',
  'new page',
  'welcome',
  'homepage',
]);

export function checkTitle(page: PageData): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // ── 1. Presence ────────────────────────────────────────────────────────────
  if (!page.title) {
    findings.push({
      id: 'title-missing',
      category: 'Page Title',
      label: 'Page title is missing',
      status: 'fail',
      priority: 'high',
      explanation:
        'Your page has no <title> tag. Search engines use the title as the headline in results, and missing it will hurt both rankings and click-through rate.',
      pointsDeducted: 20,
    });
    return findings; // no point running further title checks
  }

  const title = page.title;
  const len = title.length;

  // ── 2. Length ───────────────────────────────────────────────────────────────
  if (len < 30) {
    findings.push({
      id: 'title-too-short',
      category: 'Page Title',
      label: 'Page title is too short',
      status: 'warning',
      priority: 'medium',
      explanation: `Your title is only ${len} characters. Aim for 30–60 characters so search engines have enough context and it fills the results snippet nicely.`,
      value: title,
      pointsDeducted: 8,
    });
  } else if (len > 60) {
    findings.push({
      id: 'title-too-long',
      category: 'Page Title',
      label: 'Page title may be truncated in search results',
      status: 'warning',
      priority: 'medium',
      explanation: `Your title is ${len} characters, which is likely to be cut off in search results. Try to keep it under 60 characters.`,
      value: title,
      pointsDeducted: 5,
    });
  } else {
    findings.push({
      id: 'title-length-ok',
      category: 'Page Title',
      label: 'Page title length is good',
      status: 'pass',
      priority: 'low',
      explanation: `Your title is ${len} characters — right in the ideal 30–60 character range.`,
      value: title,
      pointsDeducted: 0,
    });
  }

  // ── 3. Generic title ────────────────────────────────────────────────────────
  if (GENERIC_TITLES.has(title.toLowerCase())) {
    findings.push({
      id: 'title-generic',
      category: 'Page Title',
      label: 'Page title appears generic',
      status: 'warning',
      priority: 'high',
      explanation: `"${title}" is too generic to help search engines understand what your page is about. Include your business name and primary keyword.`,
      value: title,
      pointsDeducted: 10,
    });
  }

  return findings;
}
