import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { getPublishedPieces } from '@/lib/content'
import type { Piece } from '@/payload-types'

// The piece's collection hook revalidates the 'pieces' and `piece:<slug>` tags when a published
// piece is saved or deleted, so an edit shows on the next load.
const readPiece = (slug: string) =>
  unstable_cache(
    async (): Promise<Piece | null> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'pieces',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
        overrideAccess: false,
      })
      return docs[0] ?? null
    },
    ['piece', slug],
    { tags: ['pieces', `piece:${slug}`] },
  )()

// Only a published piece comes back. An address that is not on the published list costs no
// database read and leaves no cache entry, so a made-up address cannot grow the cache.
export async function getPiece(slug: string): Promise<Piece | null> {
  const published = await getPublishedPieces()
  if (!published.some((piece) => piece.slug === slug)) return null
  return readPiece(slug)
}
