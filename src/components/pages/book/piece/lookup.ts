import config from '@payload-config'
import { getPayload } from 'payload'

import type { BookPiece } from './index'

// Only a published piece counts: overrideAccess false applies the collection's read rule with no user.
export async function findAskedPiece(slug: string | undefined): Promise<BookPiece | null> {
  if (!slug) return null

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
  if (!doc) return null

  const [first] = doc.gallery ?? []
  const photo = typeof first === 'object' ? (first.sizes?.thumb?.url ?? first.url ?? null) : null

  return { slug: doc.slug, name: doc.title, category: doc.category, photo }
}
