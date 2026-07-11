import fetch from 'node-fetch'

export interface PerformanceResult {
  source: 'pagespeed' | 'estimated'
  performanceScore: number
  metrics: {
    fcp: number | null // First Contentful Paint (ms)
    lcp: number | null // Largest Contentful Paint (ms)
    cls: number | null // Cumulative Layout Shift
    tti: number | null // Time to Interactive (ms)
    speedIndex: number | null
  }
  issues: string[]
}

interface PageSpeedApiResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } }
    audits?: Record<string, { numericValue?: number; displayValue?: string }>
  }
}

export async function runPerformanceChecks(
  url: string,
  html: string,
  responseTimeMs: number
): Promise<PerformanceResult> {
  const apiKey = process.env.PAGESPEED_API_KEY

  if (apiKey) {
    try {
      const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&key=${apiKey}&category=performance&strategy=mobile`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 25000)
      const res = await fetch(endpoint, { signal: controller.signal })
      clearTimeout(timeout)

      if (res.ok) {
        const data = (await res.json()) as PageSpeedApiResponse
        const audits = data.lighthouseResult?.audits || {}
        const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100)

        const issues: string[] = []
        if (score < 50) issues.push('Poor Core Web Vitals - performance score is below 50')
        else if (score < 90) issues.push('Core Web Vitals could be improved - performance score is below 90')

        return {
          source: 'pagespeed',
          performanceScore: score,
          metrics: {
            fcp: audits['first-contentful-paint']?.numericValue ?? null,
            lcp: audits['largest-contentful-paint']?.numericValue ?? null,
            cls: audits['cumulative-layout-shift']?.numericValue ?? null,
            tti: audits['interactive']?.numericValue ?? null,
            speedIndex: audits['speed-index']?.numericValue ?? null,
          },
          issues,
        }
      }
    } catch {
      // Fall through to estimation below.
    }
  }

  return estimatePerformance(html, responseTimeMs)
}

/**
 * Provides a rough performance estimate when no PageSpeed API key is configured,
 * based on page weight, response time, and resource counts. Not a substitute for
 * real Core Web Vitals but gives directionally useful feedback.
 */
function estimatePerformance(html: string, responseTimeMs: number): PerformanceResult {
  const sizeKb = Buffer.byteLength(html, 'utf8') / 1024
  const scriptCount = (html.match(/<script/gi) || []).length
  const imageCount = (html.match(/<img/gi) || []).length
  const issues: string[] = []

  let score = 100
  if (sizeKb > 500) {
    score -= 15
    issues.push('HTML document is large, which can slow down page rendering')
  }
  if (scriptCount > 20) {
    score -= 15
    issues.push('High number of script tags detected, which may block rendering')
  }
  if (imageCount > 30) {
    score -= 10
    issues.push('Large number of images on the page may impact load performance')
  }
  if (responseTimeMs > 2000) {
    score -= 20
    issues.push('Server response time is slow (over 2 seconds)')
  } else if (responseTimeMs > 1000) {
    score -= 10
    issues.push('Server response time could be faster (over 1 second)')
  }
  score = Math.max(0, Math.min(100, Math.round(score)))

  if (issues.length === 0) {
    issues.push(
      'Estimated performance looks reasonable, but connect a PageSpeed API key for real Core Web Vitals data'
    )
  }

  return {
    source: 'estimated',
    performanceScore: score,
    metrics: {
      fcp: null,
      lcp: null,
      cls: null,
      tti: null,
      speedIndex: null,
    },
    issues,
  }
}
