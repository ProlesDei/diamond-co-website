import { metalLooks } from '@/components/home/commissions/metals'
import type { Piece } from '@/payload-types'

type Stone = NonNullable<Piece['stones']>[number]

// One piece's category as the page's eyebrow names it: the kind of piece, so singular.
export const categoryName: Record<Piece['category'], string> = {
  'engagement-rings': 'Engagement ring',
  'wedding-bands': 'Wedding band',
  necklaces: 'Necklace',
  earrings: 'Earrings',
  'heirloom-redesign': 'Heirloom redesign',
}

export const metalNames = (piece: Piece): string[] =>
  (piece.metals ?? []).map((metal) => metalLooks[metal].label)

const stoneName = ({ cut, type }: Stone): string =>
  [cut, type.toLowerCase()].filter(Boolean).join(' ')

export const stoneNames = (piece: Piece): string[] => [
  ...new Set((piece.stones ?? []).map(stoneName)),
]

// A photo's alt text opens with this, then the editor's alt text, which describes the view.
export const photoLead = (piece: Piece): string =>
  [piece.title, metalNames(piece).join(' and '), stoneNames(piece).join(' and ')]
    .filter(Boolean)
    .join(', ')

// One line per stone for the Stone row: its name, its carat weight and whether it is lab-grown.
export const stoneLines = (piece: Piece): string[] =>
  (piece.stones ?? []).map((stone) =>
    [
      stoneName(stone),
      stone.carat ? `${stone.carat} ct` : '',
      stone.origin === 'lab' ? 'lab-grown' : '',
    ]
      .filter(Boolean)
      .join(', '),
  )
