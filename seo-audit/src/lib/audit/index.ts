/**
 * Main audit orchestrator.
 *
 * Coordinates the fetch, all checks, scoring, and prioritization into a
 * single AuditResult. Adding a new check in future means:
 *  1. Create a new file in checks/
 *  2. Import and call it here
 *  3. Spread the findings into the `findings` array
 */

import { v4 as uuidv4 } from 'uuid';
import type { AuditInput, AuditResult } from '@/types/audit';
import { fetchPage } from './fetcher';
import { checkTitle } from './checks/title';
import { checkMetaDescription } from './checks/meta-description';
import { checkHeadings } from './checks/headings';
import { checkImages } from './checks/images';
import { calculateScore } from '@/lib/scoring';
import { buildSummary } from '@/lib/prioritization';

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  const page = await fetchPage(input.url);

  // Run all checks — future checks (broken links, Core Web Vitals, etc.) are added here
  const findings = [
    ...checkTitle(page),
    ...checkMetaDescription(page),
    ...checkHeadings(page),
    ...checkImages(page),
    // Future: ...checkBrokenLinks(page),
    // Future: ...checkCoreWebVitals(page),
    // Future: ...checkStructuredData(page),
  ];

  // Handle unreachable page — add a top-level finding
  if (page.fetchError) {
    findings.unshift({
      id: 'page-unreachable',
      category: 'Accessibility',
      label: 'Page could not be reached',
      status: 'fail',
      priority: 'high',
      explanation: `The audit tool could not load "${input.url}". Please check the URL is correct and publicly accessible. Error: ${page.fetchError}`,
      pointsDeducted: 30,
    });
  }

  const score = calculateScore(findings);
  const summary = buildSummary(findings);

  return {
    id: uuidv4(),
    input,
    auditedAt: new Date().toISOString(),
    score,
    findings,
    summary,
  };
}
