import { put } from '@vercel/blob/client'
import { z } from 'zod'

export const PENDING_PREFIX = 'inquiry-uploads/pending/'
export const UPLOAD_CONTENT_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/heic']
export const CLIENT_TOKEN_MS = 5 * 60 * 1000

const TOKEN_URL = '/api/inquiry/upload/token'
const CONFIRM_URL = '/api/inquiry/upload/confirm'
const TIMEOUT_MS = 5 * 60 * 1000
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heic',
}

const uploadWay = z.discriminatedUnion('way', [
  z.object({ way: z.literal('multipart') }),
  z.object({ way: z.literal('direct'), pathname: z.string().min(1), clientToken: z.string().min(1) }),
])
const uploadAnswer = z.object({ uploadId: z.string().min(1) })

export type UploadWay = z.infer<typeof uploadWay>

export type SendResult =
  | { outcome: 'added'; uploadId: string }
  | { outcome: 'refused' }
  | { outcome: 'dropped' }
  | { outcome: 'cancelled' }

type SendFile = {
  file: Blob
  filename: string
  turnstileToken: string
  signal?: AbortSignal
  onProgress?: (percent: number) => void
  multipart: () => Promise<SendResult>
}

// The server checks the bytes; this only names the type the store's token allows, so a HEIC a
// browser reports with no type still goes, and anything else is refused by the store.
function contentTypeOf(file: Blob, filename: string): string {
  if (UPLOAD_CONTENT_TYPES.includes(file.type)) return file.type
  const extension = filename.split('.').pop()?.toLowerCase() ?? ''
  return CONTENT_TYPE_BY_EXTENSION[extension] ?? (file.type || 'application/octet-stream')
}

async function post(url: string, init: RequestInit): Promise<Response | 'dropped'> {
  try {
    return await fetch(url, { method: 'POST', ...init })
  } catch {
    return 'dropped'
  }
}

async function sendDirect(
  way: Extract<UploadWay, { way: 'direct' }>,
  { file, filename, signal, onProgress }: SendFile,
): Promise<SendResult> {
  const transfer = new AbortController()
  const timer = setTimeout(() => transfer.abort(), TIMEOUT_MS)
  const cancel = () => transfer.abort()
  signal?.addEventListener('abort', cancel, { once: true })
  try {
    await put(way.pathname, file, {
      access: 'private',
      token: way.clientToken,
      contentType: contentTypeOf(file, filename),
      abortSignal: transfer.signal,
      onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
    })
  } catch (error) {
    if (signal?.aborted) return { outcome: 'cancelled' }
    if (transfer.signal.aborted || error instanceof TypeError) return { outcome: 'dropped' }
    return { outcome: 'refused' }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }

  if (signal?.aborted) return { outcome: 'cancelled' }
  const response = await post(CONFIRM_URL, {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pathname: way.pathname }),
  })
  if (response === 'dropped') return { outcome: 'dropped' }
  const answer = uploadAnswer.safeParse(await response.json().catch(() => undefined))
  return response.status === 201 && answer.success ? { outcome: 'added', uploadId: answer.data.uploadId } : { outcome: 'refused' }
}

// Sends one file the way the server says: straight to the inquiry Blob store when it is set, past
// the host's request size cap, else by the form's own multipart post to the upload route.
export async function sendFile(send: SendFile): Promise<SendResult> {
  if (send.signal?.aborted) return { outcome: 'cancelled' }
  const response = await post(TOKEN_URL, { headers: { 'x-turnstile-token': send.turnstileToken }, signal: send.signal })
  if (response === 'dropped') return send.signal?.aborted ? { outcome: 'cancelled' } : { outcome: 'dropped' }
  if (!response.ok) return { outcome: 'refused' }
  const way = uploadWay.safeParse(await response.json().catch(() => undefined))
  if (!way.success) return { outcome: 'refused' }
  if (way.data.way === 'multipart') return send.multipart()
  return sendDirect(way.data, send)
}
