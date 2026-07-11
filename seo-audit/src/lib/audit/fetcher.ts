/**
 * Fetches a URL and extracts raw page data using cheerio.
 * This is the only place that makes outbound HTTP requests for the audit.
 * Future iterations can extend this to follow links (broken-link checks),
 * fetch robots.txt, or use a headless browser for JS-rendered content.
 *
 * SSRF Protection: Only public HTTP/HTTPS URLs are allowed. Requests to
 * private IP ranges, loopback addresses, and link-local addresses are
 * rejected before any network connection is made.
 */

import * as cheerio from 'cheerio';
import type { PageData } from '@/types/audit';

const FETCH_TIMEOUT_MS = 15_000;

/**
 * Private/reserved IPv4 and IPv6 ranges that must not be fetched.
 * Prevents Server-Side Request Forgery (SSRF) attacks.
 */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '0.0.0.0',
  '::1',
  '0:0:0:0:0:0:0:1',
]);

const PRIVATE_IPV4_PATTERNS: RegExp[] = [
  /^10\./,                         // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./,   // 172.16.0.0/12
  /^192\.168\./,                   // 192.168.0.0/16
  /^127\./,                        // 127.0.0.0/8 (loopback)
  /^169\.254\./,                   // 169.254.0.0/16 (link-local)
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // 100.64.0.0/10 (shared address)
  /^0\./,                          // 0.0.0.0/8
  /^192\.0\.2\./,                  // TEST-NET-1
  /^198\.51\.100\./,               // TEST-NET-2
  /^203\.0\.113\./,                // TEST-NET-3
];

/**
 * Returns an error message if the hostname resolves to a blocked address,
 * or null if the hostname is safe to fetch.
 */
function validateHostname(hostname: string): string | null {
  const lower = hostname.toLowerCase();

  // Block known loopback/internal hostnames
  if (BLOCKED_HOSTNAMES.has(lower)) {
    return `Requests to "${hostname}" are not allowed.`;
  }

  // Block bare private IP addresses
  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(lower)) {
      return `Requests to private IP addresses are not allowed.`;
    }
  }

  // Block IPv6 private/loopback patterns
  if (lower.startsWith('[') || lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd')) {
    return `Requests to private IPv6 addresses are not allowed.`;
  }

  return null;
}

/**
 * Validates and normalises a raw URL string.
 * Returns { url } on success or { error } on failure.
 */
function parseAuditUrl(rawUrl: string): { url: string; error?: undefined } | { error: string; url?: undefined } {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: `"${rawUrl}" is not a valid URL.` };
  }

  // Only allow http and https schemes
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'Only http:// and https:// URLs are supported.' };
  }

  const hostnameError = validateHostname(parsed.hostname);
  if (hostnameError) {
    return { error: hostnameError };
  }

  return { url };
}

export async function fetchPage(rawUrl: string): Promise<PageData> {
  const validation = parseAuditUrl(rawUrl);

  if (validation.error) {
    return {
      url: rawUrl,
      title: null,
      metaDescription: null,
      h1s: [],
      h2s: [],
      h3s: [],
      images: [],
      canonicalUrl: null,
      robotsMeta: null,
      statusCode: 0,
      fetchError: validation.error,
    };
  }

  const url = validation.url as string;

  let html = '';
  let statusCode = 0;
  let fetchError: string | undefined;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'BryantDigitalSolutions-SEOAudit/1.0 (+https://bryantdigitalsolutions.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timer);
    statusCode = response.status;
    html = await response.text();
  } catch (err: unknown) {
    fetchError =
      err instanceof Error ? err.message : 'Unknown fetch error';
    statusCode = 0;
  }

  if (fetchError || !html) {
    return {
      url,
      title: null,
      metaDescription: null,
      h1s: [],
      h2s: [],
      h3s: [],
      images: [],
      canonicalUrl: null,
      robotsMeta: null,
      statusCode,
      fetchError,
    };
  }

  const $ = cheerio.load(html);

  const title = $('title').first().text().trim() || null;

  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null;

  const h1s: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1s.push(text);
  });

  const h2s: string[] = [];
  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });

  const h3s: string[] = [];
  $('h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3s.push(text);
  });

  const images: { src: string; alt: string | null }[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') ?? null;
    images.push({ src, alt });
  });

  const canonicalUrl =
    $('link[rel="canonical"]').attr('href')?.trim() || null;

  const robotsMeta =
    $('meta[name="robots"]').attr('content')?.trim() || null;

  return {
    url,
    title,
    metaDescription,
    h1s,
    h2s,
    h3s,
    images,
    canonicalUrl,
    robotsMeta,
    statusCode,
  };
}
