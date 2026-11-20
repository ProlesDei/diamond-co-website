import { z } from 'zod'

import type { BookInquiryInput } from '@/inquiry/schema'

const INQUIRY_URL = '/api/inquiry'

const sentAnswer = z.object({ reference: z.string().min(1) })

export type BookSendResult =
  | { outcome: 'sent'; reference: string }
  | { outcome: 'rate-limited' }
  | { outcome: 'failed' }

// No timeout: the route takes no idempotency key, so a retry after a late answer could save the request twice.
export async function sendBook(input: BookInquiryInput, token: string): Promise<BookSendResult> {
  let response: Response
  try {
    response = await fetch(INQUIRY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...input, turnstileToken: token }),
    })
  } catch {
    return { outcome: 'failed' }
  }
  if (response.status === 429) return { outcome: 'rate-limited' }
  if (response.status !== 201) return { outcome: 'failed' }

  const answer = sentAnswer.safeParse(await response.json().catch(() => null))
  return answer.success ? { outcome: 'sent', reference: answer.data.reference } : { outcome: 'failed' }
}
