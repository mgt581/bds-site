import type { NextRequest } from 'next/server'

const DEFAULT_ALLOWED_ORIGINS = [
  'https://bryantdigitalsolutions.com',
  'https://www.bryantdigitalsolutions.com',
  'https://mgt581.github.io',
  'https://bds-site--bdssite-5fac1.europe-west4.hosted.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

function allowedOrigins(): Set<string> {
  return new Set(
    (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean)
  )
}

export function corsHeaders(
  request: NextRequest,
  methods = 'POST, OPTIONS'
): Record<string, string> {
  const origin = (request.headers.get('origin') || '').replace(/\/$/, '')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }

  if (origin && allowedOrigins().has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}
