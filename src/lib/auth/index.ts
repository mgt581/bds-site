import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'bds_admin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || 'insecure-dev-secret'
}

// Uses the Web Crypto API (available in both the Node.js and Edge runtimes) so
// this module can be safely imported from middleware as well as server code.
async function hmacHex(payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Creates a signed session token containing an expiry timestamp so it can be
 * verified statelessly without a database lookup.
 */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = `${expiresAt}`
  const signature = await hmacHex(payload)
  return `${payload}.${signature}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = await hmacHex(payload)
  if (!timingSafeStringEqual(signature, expected)) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  return true
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return timingSafeStringEqual(password, expected)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS
