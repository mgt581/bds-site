import type { CheerioAPI } from 'cheerio'

export interface SchemaResult {
  found: boolean
  types: string[]
  raw: unknown[]
  issues: string[]
}

export function runSchemaChecks($: CheerioAPI): SchemaResult {
  const scripts = $('script[type="application/ld+json"]')
  const types: string[] = []
  const raw: unknown[] = []

  scripts.each((_, el) => {
    const text = $(el).contents().text()
    if (!text) return
    try {
      const parsed = JSON.parse(text)
      raw.push(parsed)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        const graph = item['@graph']
        const candidates = Array.isArray(graph) ? graph : [item]
        for (const candidate of candidates) {
          const type = candidate?.['@type']
          if (typeof type === 'string') types.push(type)
          else if (Array.isArray(type)) types.push(...type)
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  })

  const issues: string[] = []
  if (types.length === 0) {
    issues.push('No structured data (schema.org) markup detected')
  }

  return {
    found: types.length > 0,
    types: [...new Set(types)],
    raw,
    issues,
  }
}
