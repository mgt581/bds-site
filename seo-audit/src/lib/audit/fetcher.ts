/**
 * Fetches a URL and extracts raw page data using cheerio.
 * This is the only place that makes outbound HTTP requests for the audit.
 * Future iterations can extend this to follow links (broken-link checks),
 * fetch robots.txt, or use a headless browser for JS-rendered content.
 */

import * as cheerio from 'cheerio';
import type { PageData } from '@/types/audit';

const FETCH_TIMEOUT_MS = 15_000;

export async function fetchPage(rawUrl: string): Promise<PageData> {
  // Normalise the URL — prepend https:// if missing a scheme
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

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
