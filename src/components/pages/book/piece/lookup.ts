import config from '@payload-config'
import { getPayload } from 'payload'

import type { BookOptions } from '@/inquiry/options'

import type { BookPiece } from './index'
import { pieceTypeFor } from './pieceTypes'

export type AskedPiece = { piece: BookPiece | null; initialPieceType: string | null }

const NONE: AskedPiece = { piece: null, initialPieceType: null }

// Only a published piece counts: overrideAccess false applies the collection's read rule with no user.
export async function findAskedPiece(
  slug: string | undefined,
  options: BookOptions,
): Promise<AskedPiece> {
  if (!slug) return NONE

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pieces',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
    select: { title: true, slug: true, category: true, gallery: true },
  })
  const [doc] = docs
  if (!doc) return NONE

  const [first] = doc.gallery ?? []
  const photo = typeof first === 'object' ? (first.sizes?.thumb?.url ?? first.url ?? null) : null

  const pieceType = pieceTypeFor(doc.category)
  const chosen = options.pieceTypes.some((option) => option.value === pieceType) ? pieceType : null

  return {
    piece: { slug: doc.slug, name: doc.title, category: doc.category, photo },
    initialPieceType: chosen,
  }
}
