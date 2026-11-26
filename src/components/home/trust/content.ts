import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

import { toHomeImage, type HomeImage } from '../pieces'
import { toShownTestimonial } from './testimonials'

const proofImage = (media: string | Media | null | undefined): HomeImage | null => {
  if (!media || typeof media !== 'object') return null
  const allowed = media.source === 'client-photo'
    || (media.source === 'placeholder' && process.env.SITE_ENV !== 'production')
  return allowed ? toHomeImage(media) : null
}

export async function getTrustContent() {
  await connection()
  const payload = await getPayload({ config })
  const [settings, pieces, testimonials] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: false,
      depth: 1,
      select: { home: true, goldsmith: true },
    }),
    payload.find({
      collection: 'pieces',
      overrideAccess: false,
      draft: false,
      where: { _status: { equals: 'published' } },
      sort: ['-featured', '-createdAt'],
      depth: 1,
      limit: 4,
      select: { gallery: true },
    }),
    payload.find({
      collection: 'testimonials',
      overrideAccess: false,
      draft: false,
      where: { _status: { equals: 'published' }, consentOnFile: { equals: true } },
      sort: '-createdAt',
      depth: 1,
      limit: 3,
      select: { quote: true, firstName: true, source: true, proof: true },
    }),
  ])

  const pieceImages = pieces.docs.map(({ gallery }) =>
    gallery.map(proofImage).find((image) => image !== null),
  )
  const candidates = [
    proofImage(settings.goldsmith?.portrait),
    proofImage(settings.home?.benchStudioImage),
    proofImage(settings.home?.benchDaylightImage),
  ]
  const [studioImage, ...otherStudioImages] = candidates.filter((image) => image !== null)
  const images = new Map<string, HomeImage>()
  for (const image of [studioImage, ...pieceImages, ...otherStudioImages]) {
    if (image) images.set(image.src, image)
    if (images.size === 2) break
  }

  return { images: [...images.values()], testimonials: testimonials.docs.map(toShownTestimonial) }
}
