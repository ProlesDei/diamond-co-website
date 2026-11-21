import { z } from 'zod'

const storageKey = 'dc-inquiry-sent'

const sentSchema = z.object({
  firstName: z.string().min(1),
  reference: z.string().min(1),
  piece: z
    .object({
      slug: z.string().min(1),
      name: z.string().min(1),
      photoUrl: z.string().startsWith('/api/media/file/'),
    })
    .nullable(),
})

export type Sent = z.infer<typeof sentSchema>

export function saveSent(sent: Sent): void {
  window.sessionStorage.setItem(storageKey, JSON.stringify(sent))
}

let cached: { raw: string; sent: Sent | null } | undefined

function parseSent(raw: string): Sent | null {
  try {
    const parsed = sentSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

// Returns null when nothing valid was sent from this tab. The same stored text
// gives the same object, so React can call it as a store snapshot.
export function readSent(): Sent | null {
  const raw = window.sessionStorage.getItem(storageKey)
  if (raw === null) return null
  if (cached?.raw !== raw) cached = { raw, sent: parseSent(raw) }
  return cached.sent
}
