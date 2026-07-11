import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isAdminApi = pathname.startsWith('/api/leads')

  if (isAdminRoute || isAdminApi) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const authenticated = await verifySessionToken(token)

    if (!authenticated) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/leads/:path*'],
}
