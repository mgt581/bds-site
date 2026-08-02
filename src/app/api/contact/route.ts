import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { corsHeaders } from '@/lib/http/cors'

export const dynamic = 'force-dynamic'

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().default(''),
  service: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(5000),
  website: z.string().trim().max(2048).optional().default(''),
})

function json(request: NextRequest, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) })
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`contact:${getClientIp(request)}`)
    if (!rateLimit.allowed) {
      return json(request, { error: 'Too many requests. Please try again later.' }, 429)
    }

    const parsed = enquirySchema.safeParse(await request.json())
    if (!parsed.success) {
      return json(request, { error: 'Please check the form and try again.' }, 400)
    }

    const { name, email, company, service, message, website } = parsed.data
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[api/contact] RESEND_API_KEY is not configured')
      return json(request, { error: 'Email service is temporarily unavailable.' }, 503)
    }

    const resend = new Resend(apiKey)
    const from = process.env.RESEND_FROM_EMAIL || 'Bryant Digital Solutions <info@bryantdigitalsolutions.com>'
    const admin = process.env.ADMIN_EMAIL || 'ajbryantsleads@gmail.com'
    const safe = (value: string) => value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    })[char] || char)

    const adminResult = await resend.emails.send({
      from,
      to: admin,
      replyTo: email,
      subject: `New BDS enquiry: ${service} — ${name}`,
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Name:</strong> ${safe(name)}</p>
        <p><strong>Email:</strong> ${safe(email)}</p>
        <p><strong>Business:</strong> ${safe(company || 'Not provided')}</p>
        <p><strong>Service:</strong> ${safe(service)}</p>
        <p><strong>Website:</strong> ${safe(website || 'Not provided')}</p>
        <p><strong>Message:</strong></p>
        <p>${safe(message).replace(/\n/g, '<br>')}</p>
      `,
    })

    if (adminResult.error) throw new Error(adminResult.error.message)

    const customerResult = await resend.emails.send({
      from,
      to: email,
      replyTo: admin,
      subject: 'We received your Bryant Digital Solutions enquiry',
      html: `
        <p>Hi ${safe(name)},</p>
        <p>Thanks for contacting Bryant Digital Solutions about <strong>${safe(service)}</strong>.</p>
        <p>Your enquiry has been received. We will review the details and reply with clear next steps.</p>
        <p>Regards,<br><strong>Alex Bryant</strong><br>Bryant Digital Solutions</p>
      `,
    })

    if (customerResult.error) {
      console.error('[api/contact] Customer acknowledgement failed:', customerResult.error.message)
    }

    return json(request, { success: true, customerEmailSent: !customerResult.error })
  } catch (error) {
    console.error('[api/contact] Failed:', error)
    return json(request, { error: 'We could not send your enquiry. Please try again or call us.' }, 500)
  }
}
