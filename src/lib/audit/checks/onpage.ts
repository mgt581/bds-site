import type { CheerioAPI } from 'cheerio'

export interface OnPageResult {
  title: { value: string | null; length: number; issues: string[] }
  metaDescription: { value: string | null; length: number; issues: string[] }
  headings: { h1: string[]; h2: string[]; h3: string[]; issues: string[] }
  images: { total: number; missingAlt: number; issues: string[] }
  keywordOptimization: { detected: string[]; issues: string[] }
}

export function runOnPageChecks($: CheerioAPI): OnPageResult {
  // Title
  const titleValue = $('title').first().text().trim() || null
  const titleIssues: string[] = []
  if (!titleValue) {
    titleIssues.push('Missing page title tag')
  } else {
    if (titleValue.length < 30) titleIssues.push('Title tag is too short (under 30 characters)')
    if (titleValue.length > 60) titleIssues.push('Title tag is too long (over 60 characters)')
  }

  // Meta description
  const metaDescValue = $('meta[name="description"]').attr('content')?.trim() || null
  const metaDescIssues: string[] = []
  if (!metaDescValue) {
    metaDescIssues.push('Missing meta description')
  } else {
    if (metaDescValue.length < 70)
      metaDescIssues.push('Meta description is too short (under 70 characters)')
    if (metaDescValue.length > 160)
      metaDescIssues.push('Meta description is too long (over 160 characters)')
  }

  // Headings
  const h1 = $('h1')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  const h2 = $('h2')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  const h3 = $('h3')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)

  const headingIssues: string[] = []
  if (h1.length === 0) headingIssues.push('Missing H1 heading')
  if (h1.length > 1) headingIssues.push(`Multiple H1 headings found (${h1.length})`)
  if (h2.length === 0) headingIssues.push('No H2 headings found for content structure')

  // Images
  const images = $('img')
  const total = images.length
  let missingAlt = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (!alt || !alt.trim()) missingAlt++
  })
  const imageIssues: string[] = []
  if (missingAlt > 0) imageIssues.push(`${missingAlt} of ${total} images missing alt text`)

  // Basic keyword optimization heuristic: extract most frequent significant words from body text
  const bodyText = $('body').text().toLowerCase().replace(/\s+/g, ' ')
  const words = bodyText.match(/[a-z]{4,}/g) || []
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'your', 'have', 'more', 'will', 'also',
    'about', 'their', 'they', 'them', 'here', 'when', 'what', 'which', 'into',
    'been', 'were', 'these', 'than', 'over', 'such', 'each', 'some', 'other',
  ])
  const freq = new Map<string, number>()
  for (const w of words) {
    if (stopWords.has(w)) continue
    freq.set(w, (freq.get(w) || 0) + 1)
  }
  const detected = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w)

  const keywordIssues: string[] = []
  if (titleValue) {
    const titleLower = titleValue.toLowerCase()
    const overlap = detected.some((kw) => titleLower.includes(kw))
    if (!overlap && detected.length > 0) {
      keywordIssues.push('Primary page keywords do not appear to be reflected in the title tag')
    }
  }

  return {
    title: { value: titleValue, length: titleValue?.length || 0, issues: titleIssues },
    metaDescription: {
      value: metaDescValue,
      length: metaDescValue?.length || 0,
      issues: metaDescIssues,
    },
    headings: { h1, h2, h3, issues: headingIssues },
    images: { total, missingAlt, issues: imageIssues },
    keywordOptimization: { detected, issues: keywordIssues },
  }
}
