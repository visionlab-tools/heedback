import crypto from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import { appKey } from '#config/app'

const COOKIE_NAME = 'heedback_eu'
const MAX_AGE_SECONDS = 31_536_000 // 1 year

/**
 * Sign an end-user ID with HMAC to prevent cookie forgery.
 * Uses the app's secret key so the signature is unguessable.
 */
function sign(endUserId: string): string {
  const hmac = crypto.createHmac('sha256', appKey.release()).update(endUserId).digest('hex')
  return `${endUserId}.${hmac}`
}

/** Verify a signed cookie value and return the end-user ID, or null if invalid */
function verify(signed: string): string | null {
  const dotIndex = signed.lastIndexOf('.')
  if (dotIndex === -1) return null

  const endUserId = signed.slice(0, dotIndex)
  const signature = signed.slice(dotIndex + 1)
  const expected = crypto.createHmac('sha256', appKey.release()).update(endUserId).digest('hex')

  // Timing-safe comparison to prevent timing attacks
  if (signature.length !== expected.length) return null
  const sigBuf = Buffer.from(signature, 'hex')
  const expBuf = Buffer.from(expected, 'hex')
  if (sigBuf.length !== expBuf.length) return null

  return crypto.timingSafeEqual(sigBuf, expBuf) ? endUserId : null
}

/** Set the `heedback_eu` cookie scoped to this org's public API path */
export function setEndUserCookie(response: HttpContext['response'], endUserId: string, orgSlug: string) {
  // plainCookie bypasses AdonisJS's built-in encryption — we use our own HMAC
  response.plainCookie(COOKIE_NAME, sign(endUserId), {
    path: `/api/v1/org/${orgSlug}/public`,
    maxAge: MAX_AGE_SECONDS,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })
}

/** Read and verify the `heedback_eu` cookie, returning the end-user ID or null */
export function readEndUserCookie(request: HttpContext['request']): string | null {
  const raw = request.plainCookie(COOKIE_NAME)
  if (!raw || typeof raw !== 'string') return null
  return verify(raw)
}
