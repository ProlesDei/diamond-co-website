import config from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import { z } from 'zod'

import { clientIp, rateLimit, rateLimitUnavailable, refuse, verifyTurnstile } from '@/inquiry/guard'
import { getBookOptions } from '@/inquiry/options'
import type { BookOptions } from '@/inquiry/options'
import { bookInquirySchema } from '@/inquiry/schema'
import type { BookInquiryInput } from '@/inquiry/schema'
import { submitBookInquiry } from '@/inquiry/submit'
import { turnstileParked } from '@/inquiry/turnstileParked'

const SUBMITS_PER_HOUR = 5
const HOUR_MS = 60 * 60 * 1000
const MAX_BODY_BYTES = 16 * 1024

type InvalidBody = { error: 'invalid'; message: string; fields: Record<string, string> }

function invalidFields(fields: Record<string, string>, message?: string): Response {
  const body: InvalidBody = {
    error: 'invalid',
    message: message ?? 'Some answers need fixing. Fix each one named and send again.',
    fields,
  }
  return Response.json(body, { status: 400 })
}

function invalid(error: z.ZodError<Record<string, unknown>>): Response {
  const { formErrors, fieldErrors } = z.flattenError(error)
  const fields: Record<string, string> = {}
  for (const [field, messages] of Object.entries<string[] | undefined>(fieldErrors)) {
    if (messages?.[0]) fields[field] = messages[0]
  }
  return invalidFields(fields, formErrors[0])
}

function choiceErrors(input: BookInquiryInput, options: BookOptions): Record<string, string> {
  const fields: Record<string, string> = {}
  if (!options.pieceTypes.some((option) => option.value === input.pieceType)) {
    fields.pieceType = 'Choose one of the kinds of piece listed, or "Something else".'
  }
  if (!options.budgetRanges.some((option) => option.value === input.budget)) {
    fields.budget = 'Choose one of the ranges listed, or "Not sure yet".'
  }
  return fields
}

function saveFailed(error: unknown): Response {
  console.error(`inquiry: save failed (${error instanceof Error ? error.name : 'unknown error'}).`)
  return refuse(500, 'save_failed', 'We could not save your request. Try again in a minute, or call us.')
}

async function readText(request: Request): Promise<string | 'too-large'> {
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > MAX_BODY_BYTES) {
      await reader.cancel()
      return 'too-large'
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request)
  const limit = await rateLimit(`inquiry:${ip}`, SUBMITS_PER_HOUR, HOUR_MS)
  if (!limit.ok) {
    if (limit.reason === 'unavailable') return rateLimitUnavailable()
    const minutes = Math.ceil(limit.retryAfterSeconds / 60)
    const response = refuse(429, 'rate_limited', `Too many requests from here. Try again in ${minutes} minutes, or call us.`)
    response.headers.set('retry-after', String(limit.retryAfterSeconds))
    return response
  }

  const text = await readText(request)
  if (text === 'too-large') {
    return refuse(413, 'too_large', `The request is over ${MAX_BODY_BYTES / 1024} KB. Send only the form's fields.`)
  }

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return refuse(400, 'invalid_json', 'Send the request as a JSON object.')
  }

  const parsed = bookInquirySchema.safeParse(body)
  if (!parsed.success) return invalid(parsed.error)

  let payload: Payload
  try {
    payload = await getPayload({ config })
    const fields = choiceErrors(parsed.data, await getBookOptions(payload))
    if (Object.keys(fields).length > 0) return invalidFields(fields)
  } catch (error) {
    return saveFailed(error)
  }

  if (!turnstileParked()) {
    const token = (body as { turnstileToken?: unknown }).turnstileToken
    const turnstile = await verifyTurnstile(typeof token === 'string' ? token : '', ip)
    if (!turnstile.ok) return refuse(403, 'turnstile_failed', 'We could not check that this came from a person. Reload the page and send again.')
  }

  try {
    const inquiry = await submitBookInquiry(payload, parsed.data)
    return Response.json({ reference: inquiry.reference }, { status: 201 })
  } catch (error) {
    return saveFailed(error)
  }
}
