import { z } from 'zod'

import { sendFile } from '@/inquiry/directUpload'
import type { SendResult } from '@/inquiry/directUpload'

import { shrink } from './shrink'

const UPLOAD_URL = '/api/inquiry/upload'

// The upload route's limit too (src/inquiry/collections/InquiryUploads.ts), which is server code.
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,.heic,.heif'

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const HEIC_TYPES = new Set(['image/heic', 'image/heif'])
const HEIC_NAME = /\.(heic|heif)$/i

const uploadAnswer = z.object({ uploadId: z.string().min(1) })

type PhotoFile = Pick<File, 'name' | 'size' | 'type'>

const isHeic = (file: PhotoFile) => HEIC_TYPES.has(file.type) || HEIC_NAME.test(file.name)

export const NOT_A_PHOTO = 'Not a photo. Choose a JPG, PNG, HEIC or WebP.'

// The check before any upload starts: undefined when the file can go.
export function photoError(file: PhotoFile): string | undefined {
  if (!PHOTO_TYPES.has(file.type) && !isHeic(file)) return NOT_A_PHOTO
  if (file.size > MAX_PHOTO_BYTES) return 'That photo is over our 10 MB limit. Choose a smaller one.'
  return undefined
}

async function sendMultipart(photo: Blob, filename: string, token: string): Promise<SendResult> {
  const body = new FormData()
  body.append('file', photo, filename)
  let response: Response
  try {
    response = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'x-turnstile-token': token }, body })
  } catch {
    return { outcome: 'dropped' }
  }
  const answer = uploadAnswer.safeParse(await response.json().catch(() => undefined))
  return response.status === 201 && answer.success ? { outcome: 'added', uploadId: answer.data.uploadId } : { outcome: 'refused' }
}

// Redraws the photo as a JPEG first, which drops its location and camera data. A HEIC the browser
// can't draw goes as it is; the server checks every file's type from its bytes.
export async function sendPhoto(file: File, token: string): Promise<SendResult | 'not-a-photo'> {
  const shrunk = await shrink(file)
  if (shrunk === 'undecodable' && !isHeic(file)) return 'not-a-photo'
  const photo = shrunk === 'undecodable' ? file : shrunk.blob
  const filename = photo === file ? file.name : 'photo.jpg'
  return sendFile({
    file: photo,
    filename,
    turnstileToken: token,
    multipart: () => sendMultipart(photo, filename, token),
  })
}
