import type { ImageLoaderProps } from 'next/image'
import { z } from 'zod'

import type { Media } from '@/payload-types'

const storedSize = z.object({
  url: z.string().min(1),
  width: z.number().int().positive(),
})

const source = z.object({
  sizes: z.array(storedSize).nonempty(),
  preferred: z.string().min(1),
})
type Source = z.infer<typeof source>

export const mediaSrc = (media: Pick<Media, 'sizes' | 'url' | 'width'>): string => {
  const sizes = Object.values(media.sizes ?? {}).flatMap((size) => {
    const parsed = storedSize.safeParse(size)
    return parsed.success ? [parsed.data] : []
  }).sort((a, b) => a.width - b.width)

  // A photo too small for the zoom copy has only cropped or smaller copies, so the
  // original is the widest full-frame file. Offer it for large displays.
  const original = storedSize.safeParse(media)
  const widest = sizes[sizes.length - 1]
  if (original.success && !media.sizes?.zoom?.url && (!widest || original.data.width > widest.width)) {
    sizes.push(original.data)
  }
  if (sizes.length === 0) sizes.push(storedSize.parse(media))

  const card = storedSize.safeParse(media.sizes?.card)
  return JSON.stringify({ sizes, preferred: card.success ? card.data.url : sizes[sizes.length - 1].url })
}

const parseSrc = (src: string): Source => {
  try {
    return source.parse(JSON.parse(src))
  } catch (cause) {
    throw new Error('mediaLoader needs the src that mediaSrc(media) returns.', { cause })
  }
}

export const mediaLoader = ({ src, width }: ImageLoaderProps): string => {
  const { sizes } = parseSrc(src)
  return (sizes.find((size) => size.width >= width) ?? sizes[sizes.length - 1]).url
}

export const responsiveMedia = (src: string): { src: string; srcSet: string } => {
  const { sizes, preferred } = parseSrc(src)
  const byWidth = new Map(sizes.map(({ width, url }) => [width, url]))
  return {
    src: preferred,
    srcSet: Array.from(byWidth, ([width, url]) => `${url} ${width}w`).join(', '),
  }
}
