import type { Payload } from 'payload'

import { readCalendlyLink } from '@/lib/calendly'

export type BookOption = { label: string; value: string }

export type BookOptions = { pieceTypes: BookOption[]; budgetRanges: BookOption[] }

// A stored link that fails the Calendly check counts as empty, so the forms keep their call-or-email ending.
export type BookSettings = BookOptions & { calendlyLink: string | null }

const toOptions = (rows: BookOption[] | null | undefined): BookOption[] =>
  (rows ?? []).map(({ label, value }) => ({ label, value }))

export async function getBookOptions(payload: Payload): Promise<BookSettings> {
  const settings = await payload.findGlobal({
    slug: 'inquiry-settings',
    select: { pieceTypes: true, budgetRanges: true, calendlyLink: true },
    depth: 0,
  })
  return {
    pieceTypes: toOptions(settings.pieceTypes),
    budgetRanges: toOptions(settings.budgetRanges),
    calendlyLink: readCalendlyLink(settings.calendlyLink),
  }
}
