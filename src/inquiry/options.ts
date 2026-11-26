import type { Payload } from 'payload'

import { bookingLink } from '@/lib/calendly'

export async function getCalendlyLink(payload: Payload): Promise<string> {
  const settings = await payload.findGlobal({
    slug: 'inquiry-settings',
    select: { calendlyLink: true },
    depth: 0,
  })
  return bookingLink(settings.calendlyLink)
}
