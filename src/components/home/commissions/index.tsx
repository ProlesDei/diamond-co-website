import Link from 'next/link'

import { getHomePieces } from '@/components/home/pieces'

import styles from './Commissions.module.css'
import { PieceCard } from './PieceCard'

export async function Commissions() {
  const pieces = await getHomePieces()
  if (pieces.length === 0) return null

  return (
    <section id="commissions" className={styles.section} aria-labelledby="commissions-heading">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>From the catalog</p>
          <h2 id="commissions-heading" className={styles.heading}>
            Made for one person each
          </h2>
        </div>
        <Link href="/catalog" className={styles.all}>
          See the whole catalog
        </Link>
      </div>
      <ul className={styles.pieces}>
        {pieces.map((piece) => (
          <li key={piece.slug}>
            <PieceCard piece={piece} />
          </li>
        ))}
      </ul>
    </section>
  )
}
