import type { Piece } from '@/payload-types'

const dollars = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

export const startingPrice = (startingFrom: Piece['startingFrom']): string | null =>
  startingFrom == null ? null : `from ${dollars.format(startingFrom)}`
