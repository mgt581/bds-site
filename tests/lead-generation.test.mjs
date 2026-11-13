import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { normalizeLead, STATUSES } from '../functions/_shared/core.js'

test('pipeline exposes exactly the required eight statuses', () => {
  assert.deepEqual(STATUSES, ['TEST', 'NEW', 'GENUINE', 'SPAM', 'CONTACTED', 'QUOTED', 'WON', 'LOST'])
})

test('BDS attribution and customer fields normalize safely', () => {
  const lead = normalizeLead({
    name: 'Alex Example',
    email: 'alex@example.com',
    service: 'SEO Services',
    message: 'Website: https://example.com',
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: 'fareham',
    form_name: 'Homepage contact form',
  })
  assert.equal(lead.source, 'facebook')
  assert.equal(lead.utm_medium, 'social')
  assert.equal(lead.form_name, 'Homepage contact form')
  assert.match(lead.message, /example\.com/)
})

test('all public root pages load the shared site script once', () => {
  const pages = readdirSync(new URL('../', import.meta.url))
    .filter((name) => name.endsWith('.html') && name !== 'dashboard.html')
  assert.ok(pages.length > 10)
  for (const page of pages) {
    const html = readFileSync(new URL('../' + page, import.meta.url), 'utf8')
    if (/http-equiv=["']refresh/i.test(html) || /window\.location\.replace/.test(html)) continue
    assert.equal((html.match(/assets\/site\.js/g) || []).length, 1, page)
  }
})

test('dashboard does not load public tracking and URL tokens are unsupported', () => {
  const dashboard = readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8')
  const auth = readFileSync(new URL('../functions/_shared/core.js', import.meta.url), 'utf8')
  assert.doesNotMatch(dashboard, /lead-tracking\.js/)
  assert.doesNotMatch(auth, /searchParams|get\(['"]token/)
})

test('committed browser assets contain no obvious secret values', () => {
  for (const path of ['../assets/site-config.js', '../assets/lead-tracking.js', '../dashboard.html']) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /\bre_[A-Za-z0-9_-]{12,}/)
    assert.doesNotMatch(source, /LEADS_EXPORT_TOKEN\s*[:=]\s*['"][^'"]+/)
  }
})
