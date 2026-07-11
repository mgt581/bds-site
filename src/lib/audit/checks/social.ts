import type { CheerioAPI } from 'cheerio'

export interface SocialResult {
  openGraph: {
    title: string | null
    description: string | null
    image: string | null
    url: string | null
  }
  twitter: {
    card: string | null
    title: string | null
    description: string | null
  }
  issues: string[]
}

export function runSocialChecks($: CheerioAPI): SocialResult {
  const og = {
    title: $('meta[property="og:title"]').attr('content') || null,
    description: $('meta[property="og:description"]').attr('content') || null,
    image: $('meta[property="og:image"]').attr('content') || null,
    url: $('meta[property="og:url"]').attr('content') || null,
  }

  const twitter = {
    card: $('meta[name="twitter:card"]').attr('content') || null,
    title: $('meta[name="twitter:title"]').attr('content') || null,
    description: $('meta[name="twitter:description"]').attr('content') || null,
  }

  const issues: string[] = []
  if (!og.title || !og.description || !og.image) {
    issues.push('Incomplete Open Graph tags - social shares may look unpolished')
  }
  if (!twitter.card) {
    issues.push('Missing Twitter Card meta tags')
  }

  return { openGraph: og, twitter, issues }
}
