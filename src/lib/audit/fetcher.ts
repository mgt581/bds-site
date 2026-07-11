import fetch from 'node-fetch'

export interface FetchResult {
  html: string
  status: number
  headers: Record<string, string>
  finalUrl: string
  redirectChain: string[]
  responseTimeMs: number
  isHttps: boolean
  error?: string
}

const DEFAULT_TIMEOUT_MS = 15000
const MAX_REDIRECTS = 10

/**
 * Fetches a URL's HTML, capturing headers, redirect chain, response time, and
 * final resolved URL. Uses a manual redirect loop so we can record every hop.
 */
export async function fetchPage(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<FetchResult> {
  const redirectChain: string[] = []
  let currentUrl = url
  const start = Date.now()

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; BDSAuditBot/1.0; +https://bryantdigitalsolutions.com/bot)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      clearTimeout(timeout)

      const headers: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        headers[key] = value
      })

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location')
        if (!location) {
          return {
            html: '',
            status: res.status,
            headers,
            finalUrl: currentUrl,
            redirectChain,
            responseTimeMs: Date.now() - start,
            isHttps: currentUrl.startsWith('https://'),
            error: 'Redirect without location header',
          }
        }
        const nextUrl = new URL(location, currentUrl).toString()
        redirectChain.push(currentUrl)
        currentUrl = nextUrl
        continue
      }

      const html = await res.text()

      return {
        html,
        status: res.status,
        headers,
        finalUrl: currentUrl,
        redirectChain,
        responseTimeMs: Date.now() - start,
        isHttps: currentUrl.startsWith('https://'),
      }
    } catch (err) {
      clearTimeout(timeout)
      const message = err instanceof Error ? err.message : 'Unknown fetch error'
      return {
        html: '',
        status: 0,
        headers: {},
        finalUrl: currentUrl,
        redirectChain,
        responseTimeMs: Date.now() - start,
        isHttps: currentUrl.startsWith('https://'),
        error: message.includes('abort') ? 'Request timed out' : message,
      }
    }
  }

  return {
    html: '',
    status: 0,
    headers: {},
    finalUrl: currentUrl,
    redirectChain,
    responseTimeMs: Date.now() - start,
    isHttps: currentUrl.startsWith('https://'),
    error: 'Too many redirects',
  }
}

/**
 * Fetches a small ancillary text resource (e.g. robots.txt, sitemap.xml) with a
 * short timeout, tolerating 404s gracefully.
 */
export async function fetchText(
  url: string,
  timeoutMs = 8000
): Promise<{ ok: boolean; status: number; body: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BDSAuditBot/1.0)' },
    })
    clearTimeout(timeout)
    const body = res.ok ? await res.text() : ''
    return { ok: res.ok, status: res.status, body }
  } catch {
    clearTimeout(timeout)
    return { ok: false, status: 0, body: '' }
  }
}
