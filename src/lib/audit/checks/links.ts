import type { CheerioAPI } from 'cheerio'
import fetch from 'node-fetch'

export interface LinksResult {
  internal: number
  external: number
  total: number
  brokenSample: { url: string; status: number }[]
  issues: string[]
}

async function checkLink(url: string, timeoutMs = 6000): Promise<number> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BDSAuditBot/1.0)' },
    })
    clearTimeout(timeout)
    // Some servers reject HEAD; fall back to GET if we get a 405.
    if (res.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BDSAuditBot/1.0)' },
      })
      return getRes.status
    }
    return res.status
  } catch {
    clearTimeout(timeout)
    return 0
  }
}

export async function runLinkChecks($: CheerioAPI, pageUrl: string): Promise<LinksResult> {
  const base = new URL(pageUrl)
  const hrefs = $('a[href]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .filter(Boolean) as string[]

  let internal = 0
  let external = 0
  const uniqueExternal = new Set<string>()

  for (const href of hrefs) {
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue
    try {
      const resolved = new URL(href, pageUrl)
      if (resolved.host === base.host) {
        internal++
      } else {
        external++
        uniqueExternal.add(resolved.toString())
      }
    } catch {
      // ignore malformed URLs
    }
  }

  // Check a sample of unique links (max 20) for broken status.
  const sample = Array.from(uniqueExternal).slice(0, 20)
  const results = await Promise.allSettled(sample.map((url) => checkLink(url)))
  const brokenSample: { url: string; status: number }[] = []
  results.forEach((res, idx) => {
    if (res.status === 'fulfilled' && (res.value === 0 || res.value >= 400)) {
      brokenSample.push({ url: sample[idx], status: res.value })
    }
  })

  const issues: string[] = []
  if (brokenSample.length > 0) {
    issues.push(`${brokenSample.length} broken or unreachable external link(s) detected`)
  }
  if (internal === 0) {
    issues.push('No internal links found - this can hinder site navigation and crawling')
  }

  return {
    internal,
    external,
    total: internal + external,
    brokenSample,
    issues,
  }
}
