import { mediaSrc } from '@/media/loader'
import type { Media, Piece } from '@/payload-types'

import { photoLead } from './materials'

export type PiecePhoto = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  shot: Media['shot']
}

// One entry per gallery slot, in order. A slot with no usable image file is null: the page shows
// a labelled placeholder frame for it.
export function piecePhotos(piece: Piece): (PiecePhoto | null)[] {
  const lead = photoLead(piece)

  return piece.gallery.map((media) => {
    if (typeof media !== 'object' || !media.width || !media.height) return null
    return {
      src: mediaSrc(media),
      alt: `${lead}. ${media.alt}`,
      caption: media.alt,
      width: media.width,
      height: media.height,
      shot: media.shot,
    }
  })
}
