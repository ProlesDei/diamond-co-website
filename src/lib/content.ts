import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
  },
  ['site-settings'],
  { tags: ['site-settings'] },
)

export const getPublishedPieces = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pieces',
      depth: 0,
      overrideAccess: false,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })
    return docs
  },
  ['pieces'],
  { tags: ['pieces'] },
)
