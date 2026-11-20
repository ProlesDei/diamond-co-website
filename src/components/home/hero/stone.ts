import config from '@payload-config'
import { getPayload } from 'payload'

export type Stone = { x: number; y: number }

const CENTRE: Stone = { x: 0.5, y: 0.5 }

export async function getStone(slug: string): Promise<Stone> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pieces',
    overrideAccess: false,
    where: { slug: { equals: slug } },
    select: { gallery: true },
    limit: 1,
    depth: 1,
  })
  const media = docs[0]?.gallery[0]
  if (typeof media !== 'object') return CENTRE
  return { x: (media.focalX ?? 50) / 100, y: (media.focalY ?? 50) / 100 }
}
