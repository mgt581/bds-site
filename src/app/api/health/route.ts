import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/http/cors'

export const dynamic = 'force-dynamic'

const EXPECTED_FROM_EMAIL = 'Bryant Digital Solutions <info@bryantdigitalsolutions.com>'
const EXPECTED_ADMIN_EMAIL = 'ajbryantsleads@gmail.com'

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request, 'GET, OPTIONS'),
  })
}

export async function GET(request: NextRequest) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || ''
  const adminEmail = process.env.ADMIN_EMAIL || ''
  const checks = {
    databaseUrl: Boolean(process.env.DATABASE_URL),
    directUrl: Boolean(process.env.DIRECT_URL),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    resendFromEmail: fromEmail === EXPECTED_FROM_EMAIL,
    adminEmail: adminEmail === EXPECTED_ADMIN_EMAIL,
  }
  const ok = Object.values(checks).every(Boolean)

  return NextResponse.json(
    {
      ok,
      service: 'bds-audit-api',
      backend: 'firebase-app-hosting',
      release: process.env.RELEASE_ID || 'development',
      checks,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        ...corsHeaders(request, 'GET, OPTIONS'),
        'Cache-Control': 'no-store',
      },
    }
  )
}
