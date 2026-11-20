import type { Piece } from '@/payload-types'

// Piece category -> the value of the piece type chip it matches. A category with no row chooses nothing.
const PIECE_TYPE_BY_CATEGORY: Record<Piece['category'], string> = {
  'engagement-rings': 'engagement-ring',
  'wedding-bands': 'wedding-band',
  necklaces: 'necklace-or-pendant',
  earrings: 'earrings',
  'heirloom-redesign': 'redesign',
}

export const pieceTypeFor = (category: Piece['category']): string | null =>
  PIECE_TYPE_BY_CATEGORY[category] ?? null
