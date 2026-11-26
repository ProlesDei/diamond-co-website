'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { Piece } from '@/payload-types'

import styles from './piece.module.css'

export type BookPiece = {
  slug: string
  name: string
  category: Piece['category']
  photo: string | null
}

type PieceCardProps = {
  piece: BookPiece | null
  onRemove: () => void
}

export function PieceCard({ piece, onRemove }: PieceCardProps) {
  const [removed, setRemoved] = useState(false)
  if (!piece || removed) return null

  function remove() {
    document.getElementById('book-name')?.focus()
    setRemoved(true)
    onRemove()
  }

  return (
    <div className={styles.card}>
      <div className={styles.photo}>
        {piece.photo && <Image src={piece.photo} alt="" fill sizes="64px" />}
      </div>
      <p>
        You&rsquo;re asking about<b>{piece.name}</b>
      </p>
      <button type="button" onClick={remove} aria-label={`Remove ${piece.name} from this request`}>
        Remove
      </button>
      <input type="hidden" name="piece" value={piece.slug} />
    </div>
  )
}
