'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { PieceCard } from '@/components/home/commissions/PieceCard'
import type { HomePiece } from '@/components/home/pieces'
import { links } from '@/components/site/nav'

import styles from './More.module.css'

export function MoreCommissions({ pieces }: { pieces: HomePiece[] }) {
  const { slug } = useParams<{ slug: string }>()
  const others = pieces.filter((piece) => piece.slug !== slug).slice(0, 3)
  if (others.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="more-commissions-heading">
      <div className={styles.head}>
        <h2 id="more-commissions-heading" className={styles.heading}>
          More <em>commissions</em>
        </h2>
        <Link href={links.commissions} className={styles.all}>
          See all commissions
        </Link>
      </div>
      <ul className={styles.pieces}>
        {others.map((piece) => (
          <li key={piece.slug}>
            <PieceCard piece={piece} grid />
          </li>
        ))}
      </ul>
    </section>
  )
}
