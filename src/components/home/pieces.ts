import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import { mediaSrc } from '@/media/loader'
import type { Media, Piece } from '@/payload-types'

export type HomeImage = {
  src: string
  alt: string
  width: number
  height: number
  shot: Media['shot']
}

export type HomePiece = Pick<Piece, 'title' | 'slug' | 'metals' | 'stones' | 'setting'> & {
  image: HomeImage | null
}

const firstImage = (gallery: Piece['gallery']): HomeImage | null => {
  const media = gallery[0]
  if (typeof media !== 'object' || !media.width || !media.height) return null
  return {
    src: mediaSrc(media),
    alt: media.alt,
    width: media.width,
    height: media.height,
    shot: media.shot,
  }
}

export const getHomePieces = cache(async (): Promise<HomePiece[]> => {
  await connection()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pieces',
    overrideAccess: false,
    sort: ['-featured', '-createdAt'],
    limit: 4,
    depth: 1,
  })
  return docs.map((piece) => ({
    title: piece.title,
    slug: piece.slug,
    metals: piece.metals,
    stones: piece.stones,
    setting: piece.setting,
    image: firstImage(piece.gallery),
  }))
})
