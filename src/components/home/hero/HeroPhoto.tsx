'use client'

import Image from 'next/image'
import { useCallback, useRef } from 'react'

import type { HomeImage } from '@/components/home/pieces'
import { useReducedMotion } from '@/components/site/useReducedMotion'
import { mediaLoader } from '@/media/loader'

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
      <Image
        ref={img}
        loader={mediaLoader}
        src={image.src}
        alt={image.alt}
        width={width}
        height={height}
        sizes="(max-width: 759px) 100vw, max(45vw, 828px)"
        preload
        className={styles[image.shot]}
      />
      <div ref={glow} className={styles.glow} aria-hidden="true" />
    </div>
  )
}
