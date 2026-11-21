import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media } from '@/payload-types'

import { stoneOf, type Stone } from './hero/stone'
import { type HomeImage, toHomeImage } from './pieces'

export type HomeImages = {
  hero: { image: HomeImage; stone: Stone } | null
  benchDaylight: HomeImage | null
  benchStudio: HomeImage | null
}

const toHero = (media: string | Media | null | undefined): HomeImages['hero'] => {
  const image = toHomeImage(media)
  if (!image || !media || typeof media !== 'object') return null
  return { image, stone: stoneOf(media) }
}

export const getHomeImages = cache(async (): Promise<HomeImages> => {
  await connection()
  const payload = await getPayload({ config })
  const { home } = await payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: false,
    select: { home: true },
    depth: 1,
  })
  return {
    hero: toHero(home?.heroImage),
    benchDaylight: toHomeImage(home?.benchDaylightImage),
    benchStudio: toHomeImage(home?.benchStudioImage),
  }
})
