import { z } from 'zod'

import { sendFile } from '@/inquiry/directUpload'
import type { SendResult } from '@/inquiry/directUpload'

const UPLOAD_URL = '/api/inquiry/upload'
const TIMEOUT_MS = 5 * 60 * 1000

const uploadAnswer = z.object({ uploadId: z.string().min(1) })

// XMLHttpRequest, not fetch, since only it reports upload progress.
function sendMultipart(
  photo: Blob,
  filename: string,
  token: string,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<SendResult> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve({ outcome: 'cancelled' })

    const request = new XMLHttpRequest()
    request.open('POST', UPLOAD_URL)
    request.setRequestHeader('x-turnstile-token', token)
    request.responseType = 'json'
    request.timeout = TIMEOUT_MS
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      const answer = uploadAnswer.safeParse(request.response)
      resolve(request.status === 201 && answer.success ? { outcome: 'added', uploadId: answer.data.uploadId } : { outcome: 'refused' })
    }
    request.onerror = () => resolve({ outcome: 'dropped' })
    request.ontimeout = () => resolve({ outcome: 'dropped' })
    request.onabort = () => resolve({ outcome: 'cancelled' })
    signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', photo, filename)
    request.send(body)
  })
}

export function sendPhoto(
  photo: Blob,
  filename: string,
  token: string,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<SendResult> {
  return sendFile({
    file: photo,
    filename,
    turnstileToken: token,
    signal,
    onProgress,
    multipart: () => sendMultipart(photo, filename, token, signal, onProgress),
  })
}
