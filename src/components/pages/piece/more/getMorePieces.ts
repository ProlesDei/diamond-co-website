import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { HomePiece } from '@/components/home/pieces'

import { firstImage } from '../../catalog/pieces'

// The page shows three, and the piece being read may be among the newest ones, so read four.
// The 'pieces' tag is revalidated when a published piece is saved or deleted.
export const getMorePieces = unstable_cache(
  async (): Promise<HomePiece[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pieces',
      overrideAccess: false,
      sort: '-createdAt',
      limit: 4,
      depth: 1,
    })
    return docs.map((piece) => ({
      title: piece.title,
      slug: piece.slug,
      metals: piece.metals,
      stones: piece.stones,
      setting: piece.setting,
      startingFrom: piece.startingFrom,
      image: firstImage(piece),
    }))
  },
  // v2: image src strings changed shape; skip entries cached before this deploy.
  ['more-pieces', 'v2'],
  { tags: ['pieces'] },
)
