import type { CheerioAPI } from 'cheerio'

export interface AccessibilityResult {
  missingAltCount: number
  unlabeledInputsCount: number
  hasLangAttribute: boolean
  hasSkipLink: boolean
  lowContrastWarning: boolean
  issues: string[]
}

export function runAccessibilityChecks($: CheerioAPI): AccessibilityResult {
  const images = $('img')
  let missingAltCount = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (!alt || !alt.trim()) missingAltCount++
  })

  const inputs = $('input, textarea, select')
  let unlabeledInputsCount = 0
  inputs.each((_, el) => {
    const id = $(el).attr('id')
    const ariaLabel = $(el).attr('aria-label')
    const ariaLabelledBy = $(el).attr('aria-labelledby')
    const type = ($(el).attr('type') || '').toLowerCase()
    if (['hidden', 'submit', 'button'].includes(type)) return
    const hasLabel = (id && $(`label[for="${id}"]`).length > 0) || ariaLabel || ariaLabelledBy
    if (!hasLabel) unlabeledInputsCount++
  })

  const hasLangAttribute = !!$('html').attr('lang')
  const hasSkipLink =
    $('a[href="#main"], a[href="#content"], a.skip-link, a[class*="skip"]').length > 0

  // Very rough heuristic: flag if a large number of inline styles use light grey text colors.
  const html = $.html()
  const lowContrastWarning = /(color:\s*#(?:ccc|ddd|eee|d3d3d3|c0c0c0))/i.test(html)

  const issues: string[] = []
  if (missingAltCount > 0) issues.push(`${missingAltCount} image(s) missing alternative text`)
  if (unlabeledInputsCount > 0)
    issues.push(`${unlabeledInputsCount} form input(s) missing associated labels`)
  if (!hasLangAttribute) issues.push('Missing lang attribute on the <html> element')
  if (!hasSkipLink) issues.push('No skip navigation link found for keyboard/screen reader users')
  if (lowContrastWarning) issues.push('Potential low-contrast text detected (light grey on light background)')

  return {
    missingAltCount,
    unlabeledInputsCount,
    hasLangAttribute,
    hasSkipLink,
    lowContrastWarning,
    issues,
  }
}
