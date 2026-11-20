'use client'

import Image from 'next/image'
import Link from 'next/link'

import type { HomePiece } from '@/components/home/pieces'
import { Confirm } from '@/components/pages/Confirm'
import { useReducedMotion } from '@/components/site/useReducedMotion'
import { mediaLoader } from '@/media/loader'

import styles from './Commissions.module.css'
import { metalLooks } from './metals'
import { MetalSwatch } from './MetalSwatch'

const stoneName = ({ cut, type }: NonNullable<HomePiece['stones']>[number]) =>
  [cut, type.toLowerCase()].filter(Boolean).join(' ')

export function PieceCard({ piece, grid = false }: { piece: HomePiece; grid?: boolean }) {
  const reduceMotion = useReducedMotion()
  const { image } = piece
  const stones = [...new Set((piece.stones ?? []).map(stoneName))]
  const detail = [...stones, piece.setting].filter(Boolean).join(', ')
  const className = [styles.piece, reduceMotion ? '' : styles.zoom, grid ? styles.grid : '']
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={`/commissions/${piece.slug}`} className={className}>
      <div className={styles.photo}>
        {image ? (
          <Image
            loader={mediaLoader}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={
              grid
                ? '(max-width: 899px) 50vw, 33vw'
                : '(max-width: 759px) 266px, (max-width: 899px) 50vw, 25vw'
            }
            className={styles[image.shot]}
          />
        ) : (
          <span className={styles.placeholder}>Placeholder: photo of {piece.title}</span>
        )}
      </div>
      <h3 className={styles.name}>{piece.title}</h3>
      <ul className={styles.materials}>
        {(piece.metals ?? []).map((metal) => (
          <li key={metal}>
            <MetalSwatch metal={metal} />
            {metalLooks[metal].label}
            {metal === 'platinum' ? <Confirm /> : null}
          </li>
        ))}
        {detail ? <li>{detail}</li> : null}
      </ul>
    </Link>
  )
}
