import * as cheerio from 'cheerio'
import { fetchPage } from './fetcher'
import { runOnPageChecks, type OnPageResult } from './checks/onpage'
import { runTechnicalChecks, type TechnicalResult } from './checks/technical'
import { runLinkChecks, type LinksResult } from './checks/links'
import { runPerformanceChecks, type PerformanceResult } from './checks/performance'
import { runSocialChecks, type SocialResult } from './checks/social'
import { runSchemaChecks, type SchemaResult } from './checks/schema'
import { runLocalChecks, type LocalResult } from './checks/local'
import { runAccessibilityChecks, type AccessibilityResult } from './checks/accessibility'
import { calculateScores, type AuditScores } from '../scoring'

export interface AuditData {
  url: string
  finalUrl: string
  fetchedAt: string
  responseTimeMs: number
  httpStatus: number
  fetchError?: string
  onPage: OnPageResult
  technical: TechnicalResult
  links: LinksResult
  performance: PerformanceResult
  social: SocialResult
  schema: SchemaResult
  local: LocalResult
  accessibility: AccessibilityResult
  scores: AuditScores
}

export async function runAudit(url: string): Promise<AuditData> {
  const fetchResult = await fetchPage(url)

  if (fetchResult.error || !fetchResult.html) {
    // Build a minimal, mostly-empty audit result so the pipeline degrades gracefully
    // instead of throwing when a page cannot be fetched at all.
    const $ = cheerio.load('<html><head></head><body></body></html>')
    const onPage = runOnPageChecks($)
    const technical = await runTechnicalChecks($, fetchResult, url)
    const social = runSocialChecks($)
    const schemaResult = runSchemaChecks($)
    const local = runLocalChecks($, schemaResult)
    const accessibility = runAccessibilityChecks($)
    const links: LinksResult = { internal: 0, external: 0, total: 0, brokenSample: [], issues: [] }
    const performance: PerformanceResult = {
      source: 'estimated',
      performanceScore: 0,
      metrics: { fcp: null, lcp: null, cls: null, tti: null, speedIndex: null },
      issues: ['Unable to analyze performance - the page could not be fetched'],
    }

    const scores = calculateScores({
      technicalIssueCount: technical.https.issues.length +
        technical.robotsTxt.issues.length +
        technical.sitemap.issues.length +
        technical.canonical.issues.length +
        technical.redirects.issues.length +
        technical.httpStatus.issues.length + 3,
      onPageIssueCount: 10,
      performanceScore: 0,
      localIssueCount: local.issues.length,
      accessibilityIssueCount: accessibility.issues.length,
    })

    return {
      url,
      finalUrl: fetchResult.finalUrl,
      fetchedAt: new Date().toISOString(),
      responseTimeMs: fetchResult.responseTimeMs,
      httpStatus: fetchResult.status,
      fetchError: fetchResult.error || 'Failed to fetch page content',
      onPage,
      technical,
      links,
      performance,
      social,
      schema: schemaResult,
      local,
      accessibility,
      scores,
    }
  }

  const $ = cheerio.load(fetchResult.html)

  const [onPage, technical, links, performance, social] = await Promise.all([
    Promise.resolve(runOnPageChecks($)),
    runTechnicalChecks($, fetchResult, url),
    runLinkChecks($, fetchResult.finalUrl || url),
    runPerformanceChecks(fetchResult.finalUrl || url, fetchResult.html, fetchResult.responseTimeMs),
    Promise.resolve(runSocialChecks($)),
  ])

  const schemaResult = runSchemaChecks($)
  const local = runLocalChecks($, schemaResult)
  const accessibility = runAccessibilityChecks($)

  const technicalIssueCount =
    technical.https.issues.length +
    technical.robotsTxt.issues.length +
    technical.sitemap.issues.length +
    technical.canonical.issues.length +
    technical.redirects.issues.length +
    technical.httpStatus.issues.length

  const onPageIssueCount =
    onPage.title.issues.length +
    onPage.metaDescription.issues.length +
    onPage.headings.issues.length +
    onPage.images.issues.length +
    onPage.keywordOptimization.issues.length +
    social.issues.length +
    schemaResult.issues.length +
    (links.issues.length > 0 ? 1 : 0)

  const scores = calculateScores({
    technicalIssueCount,
    onPageIssueCount,
    performanceScore: performance.performanceScore,
    localIssueCount: local.issues.length,
    accessibilityIssueCount: accessibility.issues.length,
  })

  return {
    url,
    finalUrl: fetchResult.finalUrl || url,
    fetchedAt: new Date().toISOString(),
    responseTimeMs: fetchResult.responseTimeMs,
    httpStatus: fetchResult.status,
    onPage,
    technical,
    links,
    performance,
    social,
    schema: schemaResult,
    local,
    accessibility,
    scores,
  }
}
