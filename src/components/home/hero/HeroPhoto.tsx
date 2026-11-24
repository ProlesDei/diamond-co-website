'use client'

import { useCallback, useRef } from 'react'

import type { HomeImage } from '@/components/home/pieces'
import { useReducedMotion } from '@/components/site/useReducedMotion'
import { responsiveMedia } from '@/media/loader'

import { lightTheStone } from './glow'
import styles from './Hero.module.css'
import type { Stone } from './stone'

type HeroPhotoProps = {
  image: HomeImage
  stone: Stone
}

export function HeroPhoto({ image, stone }: HeroPhotoProps) {
  const reduce = useReducedMotion()
  const img = useRef<HTMLImageElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const { width, height } = image
  const { x, y } = stone

  const light = useCallback(
    (box: HTMLDivElement | null) => {
      if (!box || !img.current || !glow.current) return
      return lightTheStone({
        box,
        img: img.current,
        glow: glow.current,
        original: { width, height },
        stone: { x, y },
        reduce,
      })
    },
    [width, height, x, y, reduce],
  )

  return (
    <div ref={light} className={styles.photo}>
      {/* Use the stored file widths so the preload and image pick the same candidate. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id="home-hero-image"
        ref={img}
        {...responsiveMedia(image.src)}
        alt={image.alt}
        width={width}
        height={height}
        sizes="(max-width: 759px) 100vw, min(calc(60vw - 8px), 856px)"
        fetchPriority="high"
        className={image.shot === 'studio' ? `${styles.image} ${styles.studio}` : styles.image}
      />
      <div ref={glow} className={styles.glow} aria-hidden="true" />
    </div>
  )
}
