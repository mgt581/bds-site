import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPassword, createSessionToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({ password: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin login is not configured on this server' },
        { status: 500 }
      )
    }

    if (!checkAdminPassword(parsed.data.password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await createSessionToken()
    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
