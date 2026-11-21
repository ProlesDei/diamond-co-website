import config from '@payload-config'
import { del, get } from '@vercel/blob'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { randomBytes, randomUUID } from 'node:crypto'
import { getPayload, ValidationError } from 'payload'
import { z } from 'zod'

import { readBlobToken, requireBlobToken } from '@/lib/blob'

import { MAX_UPLOAD_BYTES } from './collections/InquiryUploads'
import { PENDING_PREFIX, UPLOAD_CONTENT_TYPES } from './directUpload'
import type { UploadWay } from './directUpload'
import { clientIp, rateLimit, rateLimitUnavailable, refuse, verifyTurnstile } from './guard'
import { turnstileParked } from './turnstileParked'

const UPLOADS_PER_HOUR = 20
const HOUR_MS = 60 * 60 * 1000
export const CLIENT_TOKEN_MS = 5 * 60 * 1000
const PENDING_PATHNAME = new RegExp(`^${PENDING_PREFIX}[a-f0-9]{32}$`)
const FORM_OVERHEAD_BYTES = 64 * 1024
const MAX_BODY_BYTES = MAX_UPLOAD_BYTES + FORM_OVERHEAD_BYTES
const HEIC_BRANDS = new Set(['heic', 'heix'])

type Kind = { mimetype: string; ext: string }

function startsWith(bytes: Buffer, prefix: number[]): boolean {
  return bytes.length >= prefix.length && prefix.every((byte, i) => bytes[i] === byte)
}

function sniff(bytes: Buffer): Kind | undefined {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mimetype: 'image/jpeg', ext: 'jpg' }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mimetype: 'image/png', ext: 'png' }
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { mimetype: 'application/pdf', ext: 'pdf' }
  if (
    bytes.length >= 12 &&
    bytes.toString('latin1', 4, 8) === 'ftyp' &&
    HEIC_BRANDS.has(bytes.toString('latin1', 8, 12))
  ) {
    return { mimetype: 'image/heic', ext: 'heic' }
  }
  return undefined
}

async function readCapped(stream: ReadableStream<Uint8Array> | null, max: number): Promise<Buffer | 'too-large'> {
  if (!stream) return Buffer.alloc(0)
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > max) {
      await reader.cancel()
      return 'too-large'
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}

function tooLarge(): Response {
  return refuse(413, 'too_large', `The file is over the ${MAX_UPLOAD_BYTES}-byte (10 MB) limit. Send a smaller file.`)
}

function wrongType(): Response {
  return refuse(415, 'unsupported_type', 'The file is not a JPG, PNG, HEIC or PDF. Send one of those.')
}

async function limitUploads(key: string): Promise<Response | undefined> {
  const limit = await rateLimit(key, UPLOADS_PER_HOUR, HOUR_MS)
  if (limit.ok) return undefined
  if (limit.reason === 'unavailable') return rateLimitUnavailable()
  const response = refuse(
    429,
    'rate_limited',
    `Too many uploads from this address. Try again in ${limit.retryAfterSeconds} seconds.`,
  )
  response.headers.set('retry-after', String(limit.retryAfterSeconds))
  return response
}

async function guardUpload(request: Request): Promise<Response | undefined> {
  const ip = clientIp(request)
  const limited = await limitUploads(`inquiry-upload:${ip}`)
  if (limited) return limited
  if (turnstileParked()) return undefined

  const turnstile = await verifyTurnstile(request.headers.get('x-turnstile-token') ?? '', ip)
  if (!turnstile.ok) {
    return refuse(403, 'turnstile_failed', 'The anti-spam check failed. Reload the page and try again.')
  }
  return undefined
}

async function createUpload(bytes: Buffer): Promise<Response> {
  const kind = sniff(bytes)
  if (!kind) return wrongType()

  const payload = await getPayload({ config })
  try {
    const doc = await payload.create({
      collection: 'inquiry-uploads',
      data: { id: randomBytes(12).toString('hex') },
      file: { data: bytes, mimetype: kind.mimetype, name: `${randomUUID()}.${kind.ext}`, size: bytes.length },
      overrideAccess: true,
    })
    return Response.json({ uploadId: doc.id }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) return wrongType()
    throw error
  }
}

export async function acceptUpload(request: Request): Promise<Response> {
  const refused = await guardUpload(request)
  if (refused) return refused

  const body = await readCapped(request.body, MAX_BODY_BYTES)
  if (body === 'too-large') return tooLarge()

  let form: FormData
  try {
    form = await new Response(body, { headers: { 'content-type': request.headers.get('content-type') ?? '' } }).formData()
  } catch {
    return refuse(400, 'bad_request', 'Send the file as multipart/form-data, in a field named file.')
  }

  const files = form.getAll('file')
  const file = files[0]
  if (files.length !== 1 || !(file instanceof File)) {
    return refuse(400, 'one_file', 'Send exactly one file, in a field named file.')
  }
  if (file.size > MAX_UPLOAD_BYTES) return tooLarge()

  return createUpload(Buffer.from(await file.arrayBuffer()))
}

// Tells the page how to send a file: straight to the inquiry Blob store, with a client token for
// one new pending pathname, or, with no store set, multipart to acceptUpload. The multipart answer
// spends neither the Turnstile token nor a try, so the page sends the same token there.
export async function issueUploadToken(request: Request): Promise<Response> {
  if (readBlobToken('inquiry-uploads') === undefined) return Response.json({ way: 'multipart' } satisfies UploadWay)

  const refused = await guardUpload(request)
  if (refused) return refused

  const pathname = `${PENDING_PREFIX}${randomBytes(16).toString('hex')}`
  const clientToken = await generateClientTokenFromReadWriteToken({
    token: requireBlobToken('inquiry-uploads'),
    pathname,
    allowedContentTypes: [...UPLOAD_CONTENT_TYPES],
    maximumSizeInBytes: MAX_UPLOAD_BYTES,
    validUntil: Date.now() + CLIENT_TOKEN_MS,
    addRandomSuffix: false,
    allowOverwrite: false,
  })
  return Response.json({ way: 'direct', pathname, clientToken } satisfies UploadWay)
}

const confirmBody = z.object({ pathname: z.string() })

function unknownUpload(): Response {
  return refuse(404, 'unknown_upload', 'We have no file waiting under that name. Add the file again.')
}

// Makes the inquiry-uploads doc for a file the page sent to a pending pathname. It takes no
// Turnstile token: only issueUploadToken, which checks one, hands out a pathname, and it has 128
// random bits. Only a private blob counts: a client token can also put a public one, which this
// deletes. Only the first confirm of a pathname gets past the once-only limit, across instances,
// and it deletes the pending blob once read, whatever it answers.
export async function confirmUpload(request: Request): Promise<Response> {
  if (readBlobToken('inquiry-uploads') === undefined) return unknownUpload()
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return refuse(400, 'bad_request', 'Send JSON: { "pathname": "<the pathname the token route gave>" }.')
  }
  const parsed = confirmBody.safeParse(body)
  if (!parsed.success) {
    return refuse(400, 'bad_request', 'Send JSON: { "pathname": "<the pathname the token route gave>" }.')
  }
  const { pathname } = parsed.data
  if (!PENDING_PATHNAME.test(pathname)) return unknownUpload()
  const limited = await limitUploads(`inquiry-upload-confirm:${clientIp(request)}`)
  if (limited) return limited

  const token = requireBlobToken('inquiry-uploads')
  const blob = await get(pathname, { access: 'private', token, useCache: false })
  if (!blob || blob.statusCode !== 200) {
    await del(pathname, { token })
    return unknownUpload()
  }

  const once = await rateLimit(`inquiry-upload-once:${pathname}`, 1, HOUR_MS)
  if (!once.ok) {
    await blob.stream.cancel()
    if (once.reason === 'unavailable') return rateLimitUnavailable()
    return refuse(409, 'already_confirmed', 'This file was already added. Add it again to send another copy.')
  }

  let bytes: Buffer | 'too-large'
  try {
    bytes = await readCapped(blob.stream, MAX_UPLOAD_BYTES)
  } finally {
    await del(pathname, { token })
  }
  if (bytes === 'too-large') return tooLarge()
  return createUpload(bytes)
}
