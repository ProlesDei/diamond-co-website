'use client'

import Image from 'next/image'

import type { HomeImage } from '@/components/home/pieces'
import { mediaLoader } from '@/media/loader'

type BenchPhotoProps = {
  image: HomeImage
  className: string
}

export function BenchPhoto({ image, className }: BenchPhotoProps) {
  return (
    <Image
      loader={mediaLoader}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(max-width: 759px) 45vw, 25vw"
      className={className}
    />
  )
}
