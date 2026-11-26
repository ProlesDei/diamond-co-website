import config from '@payload-config'
import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { getPayload } from 'payload'
import { z } from 'zod'

import { isProduction } from '../lib/site'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const SITEVERIFY_TIMEOUT_MS = 5000
const SECRET_ERROR_CODES = new Set(['missing-input-secret', 'invalid-input-secret'])
const TEST_SECRET_SHAPE = /^[0-9]x0{31}[a-z]{2}$/
const TEST_KEY_HOSTNAME = 'example.com'

const refusesTestKeys = isProduction && process.env.VERCEL_ENV !== 'preview'

const isTestSecret = (secret: string): boolean => TEST_SECRET_SHAPE.test(secret.toLowerCase().replace(/[^0-9a-z]/g, ''))

const siteverifyAnswer = z.object({
  success: z.boolean(),
  'error-codes': z.array(z.string()).optional(),
  hostname: z.string().optional(),
  metadata: z.object({ result_with_testing_key: z.boolean().optional() }).optional(),
})

export type TurnstileResult = { ok: true } | { ok: false }

export async function verifyTurnstile(token: string, ip: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('turnstile: TURNSTILE_SECRET_KEY is not set, so every check is refused. Set it in .env.')
    return { ok: false }
  }
  if (refusesTestKeys && isTestSecret(secret)) {
    console.error(
      'turnstile: TURNSTILE_SECRET_KEY is a Cloudflare test key while SITE_ENV is production, so every check is refused. Set the real secret.',
    )
    return { ok: false }
  }
  if (!token) return { ok: false }

  let answer: unknown
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(ip === 'unknown' ? {} : { remoteip: ip }) }),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    })
    if (!response.ok) {
      console.error(`turnstile: siteverify answered HTTP ${response.status}; refused.`)
      return { ok: false }
    }
    answer = await response.json()
  } catch (error) {
    const kind = error instanceof Error ? error.name : 'unknown error'
    console.error(`turnstile: siteverify call failed (${kind}); refused.`)
    return { ok: false }
  }

  const parsed = siteverifyAnswer.safeParse(answer)
  if (!parsed.success) {
    console.error('turnstile: siteverify answered in an unexpected shape; refused.')
    return { ok: false }
  }
  if (parsed.data.success) {
    const testKeyAnswer =
      parsed.data.hostname === TEST_KEY_HOSTNAME || parsed.data.metadata?.result_with_testing_key === true
    if (refusesTestKeys && testKeyAnswer) {
      console.error(
        'turnstile: siteverify answered as a test key for TURNSTILE_SECRET_KEY while SITE_ENV is production, so every check is refused. Set the real secret.',
      )
      return { ok: false }
    }
    return { ok: true }
  }

  const secretCodes = (parsed.data['error-codes'] ?? []).filter((code) => SECRET_ERROR_CODES.has(code))
  if (secretCodes.length > 0) {
    console.error(`turnstile: siteverify rejected TURNSTILE_SECRET_KEY (${secretCodes.join(', ')}). Check its value.`)
  }
  return { ok: false }
}

const RATE_LIMITS = 'inquiry-rate-limits'
const RATE_LIMIT_TIMEOUT_MS = 3000

type Window = { _id: string; count: number; resetAt: Date }

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'limited'; retryAfterSeconds: number }
  | { ok: false; reason: 'unavailable' }

let expiryIndex: Promise<string> | undefined

async function rateLimits() {
  const payload = await getPayload({ config })
  if (payload.db.name !== 'mongoose') {
    throw new Error(`Rate limits need the MongoDB adapter; this app runs ${payload.db.name}.`)
  }
  const windows = (payload.db as MongooseAdapter).connection.collection<Window>(RATE_LIMITS)
  expiryIndex ??= windows
    .createIndex({ resetAt: 1 }, { expireAfterSeconds: 0, timeoutMS: RATE_LIMIT_TIMEOUT_MS })
    .catch((error: unknown) => {
      expiryIndex = undefined
      throw error
    })
  await expiryIndex
  return windows
}

// Counts requests per key, such as `inquiry:<ip>`, in MongoDB, so a limit holds across
// serverless instances and restarts: each request is one atomic write, and the database's
// TTL index removes a window once it ends. Callers key it by clientIp(), the first
// x-forwarded-for address. Vercel says it overwrites that header with the client's public IP
// and does not forward external IPs, to prevent spoofing
// (https://vercel.com/docs/headers/request-headers#x-forwarded-for); that page states it for a
// proxy in front of Vercel, so a client-sent header reaching Vercel directly is unverified.
// It does not stop a botnet spread over many IPs: only Turnstile slows that. Every request
// with no IP header shares the one `unknown` key. When the database can't answer, it refuses.
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date()
  const open = { $gt: ['$resetAt', now] }
  let window: Window | null
  try {
    const windows = await rateLimits()
    window = await windows.findOneAndUpdate(
      { _id: key },
      [
        {
          $set: {
            count: { $cond: [open, { $add: ['$count', 1] }, 1] },
            resetAt: { $cond: [open, '$resetAt', new Date(now.getTime() + windowMs)] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after', timeoutMS: RATE_LIMIT_TIMEOUT_MS },
    )
  } catch (error) {
    const kind = error instanceof Error ? error.name : 'unknown error'
    console.error(`rate limit: database call failed (${kind}); refused.`)
    return { ok: false, reason: 'unavailable' }
  }
  if (!window) {
    console.error('rate limit: database returned no window; refused.')
    return { ok: false, reason: 'unavailable' }
  }
  if (window.count <= limit) return { ok: true }
  const retryAfterSeconds = Math.max(1, Math.ceil((window.resetAt.getTime() - now.getTime()) / 1000))
  return { ok: false, reason: 'limited', retryAfterSeconds }
}

export function rateLimitUnavailable(): Response {
  return refuse(503, 'rate_limit_unavailable', 'We could not take requests just now. Try again in a minute.')
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  const real = request.headers.get('x-real-ip')?.trim()
  if (real) return real
  return 'unknown'
}

type ErrorBody ={ error: string; message: string }

export function refuse(status: number, code: string, message: string): Response {
  const body: ErrorBody = { error: code, message }
  return Response.json(body, { status })
}
