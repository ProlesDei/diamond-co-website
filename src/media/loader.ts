import type { ImageLoaderProps } from 'next/image'
import { z } from 'zod'

import type { Media } from '@/payload-types'

const storedSize = z.object({
  url: z.string().min(1),
  width: z.number().int().positive(),
})

const storedSizes = z.object({
  thumb: storedSize,
  card: storedSize,
  detail: storedSize,
  zoom: storedSize,
})

type StoredSizes = z.infer<typeof storedSizes>

export const mediaSrc = (media: Pick<Media, 'sizes'>): string =>
  JSON.stringify(storedSizes.parse(media.sizes))

const parseSrc = (src: string): StoredSizes => {
  try {
    return storedSizes.parse(JSON.parse(src))
  } catch (cause) {
    throw new Error('mediaLoader needs the src that mediaSrc(media) returns.', { cause })
  }
}

export const mediaLoader = ({ src, width }: ImageLoaderProps): string => {
  const sizes = parseSrc(src)
  const wideEnough = Object.values(sizes)
    .filter((size) => size.width >= width)
    .sort((a, b) => a.width - b.width)

  return (wideEnough[0] ?? sizes.zoom).url
}
