import type { Payload } from 'payload'

export type BookOption = { label: string; value: string }

export type BookOptions = { pieceTypes: BookOption[]; budgetRanges: BookOption[] }

const toOptions = (rows: BookOption[] | null | undefined): BookOption[] =>
  (rows ?? []).map(({ label, value }) => ({ label, value }))

export async function getBookOptions(payload: Payload): Promise<BookOptions> {
  const settings = await payload.findGlobal({
    slug: 'inquiry-settings',
    select: { pieceTypes: true, budgetRanges: true },
    depth: 0,
  })
  return { pieceTypes: toOptions(settings.pieceTypes), budgetRanges: toOptions(settings.budgetRanges) }
}
