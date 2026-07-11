import type { CheerioAPI } from 'cheerio'
import type { SchemaResult } from './schema'

export interface LocalResult {
  hasNAP: boolean
  hasLocalBusinessSchema: boolean
  hasMapEmbed: boolean
  locationKeywordsDetected: string[]
  issues: string[]
}

const PHONE_REGEX = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
const ADDRESS_REGEX = /\d{1,5}\s+([A-Za-z0-9.'\s]{2,40})\s(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|suite|ste)\b/i

export function runLocalChecks($: CheerioAPI, schema: SchemaResult): LocalResult {
  const bodyText = $('body').text().replace(/\s+/g, ' ')

  const hasPhone = PHONE_REGEX.test(bodyText)
  const hasAddress = ADDRESS_REGEX.test(bodyText)
  const hasNAP = hasPhone && hasAddress

  const hasLocalBusinessSchema = schema.types.some((t) =>
    /localbusiness|store|restaurant|professionalservice/i.test(t)
  )

  const hasMapEmbed =
    $('iframe[src*="google.com/maps"]').length > 0 ||
    $('iframe[src*="maps.google"]').length > 0 ||
    /maps\.google|google\.com\/maps/i.test($.html())

  const locationKeywordMatches = bodyText.match(
    /\b(near me|in [A-Z][a-z]+(?:,\s?[A-Z]{2})?|serving [A-Z][a-z]+)\b/g
  )
  const locationKeywordsDetected = [...new Set(locationKeywordMatches || [])].slice(0, 10)

  const issues: string[] = []
  if (!hasNAP) issues.push('Name, Address, and Phone (NAP) information not clearly detected on page')
  if (!hasLocalBusinessSchema) issues.push('No LocalBusiness structured data markup found')
  if (!hasMapEmbed) issues.push('No embedded Google Map detected')
  if (locationKeywordsDetected.length === 0)
    issues.push('No location-based keywords detected in page content')

  return { hasNAP, hasLocalBusinessSchema, hasMapEmbed, locationKeywordsDetected, issues }
}
