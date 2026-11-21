import type { Media } from '@/payload-types'

export type Stone = { x: number; y: number }

export const stoneOf = (media: Pick<Media, 'focalX' | 'focalY'>): Stone => ({
  x: (media.focalX ?? 50) / 100,
  y: (media.focalY ?? 50) / 100,
})
