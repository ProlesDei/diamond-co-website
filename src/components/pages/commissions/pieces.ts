import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'

import type { HomeImage, HomePiece } from '@/components/home/pieces'
import { mediaSrc } from '@/media/loader'
import type { Piece } from '@/payload-types'

import { photoLead } from '../piece/materials'

export const firstImage = (piece: Piece): HomeImage | null => {
  const media = piece.gallery[0]
  if (typeof media !== 'object' || !media.width || !media.height) return null
  return {
    src: mediaSrc(media),
    alt: `${photoLead(piece)}. ${media.alt}`,
    width: media.width,
    height: media.height,
    shot: media.shot,
  }
}

export async function getCommissionPieces(): Promise<HomePiece[]> {
  await connection()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pieces',
    overrideAccess: false,
    sort: '-createdAt',
    pagination: false,
    depth: 1,
  })
  return docs.map((piece) => ({
    title: piece.title,
    slug: piece.slug,
    metals: piece.metals,
    stones: piece.stones,
    setting: piece.setting,
    image: firstImage(piece),
  }))
}
