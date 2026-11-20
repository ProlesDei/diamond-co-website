import { z } from 'zod'

import { calendlyOrigin } from '@/lib/calendly'

export type CalendlyPrefill = {
  reference: string
  name: string
  email?: string
  a1: string
}

const scheduledMessage = z.object({ event: z.literal('calendly.event_scheduled') })

// The short answers go on one line, then each longer answer on its own line; empty ones are left out.
export function joinAnswers(short: readonly (string | undefined)[], ...rest: (string | undefined)[]): string {
  const line = short.filter(Boolean).join(' · ')
  return [line, ...rest].filter(Boolean).join('\n')
}

export function frameUrl(link: string, prefill: CalendlyPrefill, host: string): string {
  const url = new URL(link)
  url.searchParams.set('name', prefill.name)
  if (prefill.email) url.searchParams.set('email', prefill.email)
  url.searchParams.set('a1', joinAnswers([`Request ${prefill.reference}`], prefill.a1))
  url.searchParams.set('embed_domain', host)
  url.searchParams.set('embed_type', 'Inline')
  return url.href
}

export function isScheduled(event: MessageEvent): boolean {
  return event.origin === calendlyOrigin && scheduledMessage.safeParse(event.data).success
}
