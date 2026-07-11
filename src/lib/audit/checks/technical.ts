import type { CheerioAPI } from 'cheerio'
import { fetchText } from '../fetcher'
import type { FetchResult } from '../fetcher'

export interface TechnicalResult {
  https: { enabled: boolean; issues: string[] }
  robotsTxt: { exists: boolean; blocksGooglebot: boolean; content: string | null; issues: string[] }
  sitemap: { exists: boolean; url: string | null; issues: string[] }
  canonical: { value: string | null; issues: string[] }
  redirects: { chain: string[]; count: number; issues: string[] }
  httpStatus: { code: number; issues: string[] }
}

export async function runTechnicalChecks(
  $: CheerioAPI,
  fetchResult: FetchResult,
  originalUrl: string
): Promise<TechnicalResult> {
  const base = new URL(fetchResult.finalUrl || originalUrl)
  const origin = `${base.protocol}//${base.host}`

  // HTTPS
  const httpsIssues: string[] = []
  if (!fetchResult.isHttps) httpsIssues.push('Site is not served over HTTPS')

  // Robots.txt
  const robotsRes = await fetchText(`${origin}/robots.txt`)
  const robotsIssues: string[] = []
  let blocksGooglebot = false
  if (!robotsRes.ok) {
    robotsIssues.push('robots.txt file not found')
  } else {
    const lower = robotsRes.body.toLowerCase()
    if (/user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*(\n|$)/i.test(lower)) {
      blocksGooglebot = true
      robotsIssues.push('robots.txt may be blocking all crawlers from the entire site')
    }
  }

  // Sitemap
  const sitemapIssues: string[] = []
  let sitemapExists = false
  let sitemapUrl: string | null = null
  for (const path of ['/sitemap.xml', '/sitemap_index.xml']) {
    const res = await fetchText(`${origin}${path}`)
    if (res.ok) {
      sitemapExists = true
      sitemapUrl = `${origin}${path}`
      break
    }
  }
  if (!sitemapExists) sitemapIssues.push('No XML sitemap found at common locations')

  // Canonical
  const canonicalValue = $('link[rel="canonical"]').attr('href') || null
  const canonicalIssues: string[] = []
  if (!canonicalValue) canonicalIssues.push('Missing canonical link tag')

  // Redirects
  const redirectIssues: string[] = []
  if (fetchResult.redirectChain.length > 2) {
    redirectIssues.push(`Long redirect chain detected (${fetchResult.redirectChain.length} hops)`)
  } else if (fetchResult.redirectChain.length > 0) {
    redirectIssues.push(`Page redirects ${fetchResult.redirectChain.length} time(s) before loading`)
  }

  // HTTP status
  const statusIssues: string[] = []
  if (fetchResult.status >= 400) {
    statusIssues.push(`Page returned HTTP error status ${fetchResult.status}`)
  } else if (fetchResult.status === 0) {
    statusIssues.push('Unable to determine HTTP status - the page may be unreachable')
  }

  return {
    https: { enabled: fetchResult.isHttps, issues: httpsIssues },
    robotsTxt: {
      exists: robotsRes.ok,
      blocksGooglebot,
      content: robotsRes.ok ? robotsRes.body.slice(0, 2000) : null,
      issues: robotsIssues,
    },
    sitemap: { exists: sitemapExists, url: sitemapUrl, issues: sitemapIssues },
    canonical: { value: canonicalValue, issues: canonicalIssues },
    redirects: {
      chain: fetchResult.redirectChain,
      count: fetchResult.redirectChain.length,
      issues: redirectIssues,
    },
    httpStatus: { code: fetchResult.status, issues: statusIssues },
  }
}
