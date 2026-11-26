import { PieceCard } from '@/components/home/commissions/PieceCard'
import { Button } from '@/components/site/Button'

import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Catalog.module.css'
import { getCatalogPieces } from './pieces'

export function generateMetadata() {
  return pageMetadata('Catalog')
}

const title = (
  <>
    Made for <em>one person each.</em>
  </>
)

export default async function CatalogPage() {
  const pieces = await getCatalogPieces()

  if (pieces.length === 0) {
    return (
      <>
        <PageHead eyebrow="Catalog" title={title} />
        <div className={styles.empty}>
          <div className={styles.frame} aria-hidden="true">
            <span className={styles.ampersand}>&amp;</span>
          </div>
          <div>
            <h2 className={styles.heading}>The first pieces go up soon.</h2>
            <p className={styles.text}>
              We’re photographing recent pieces now. Until they’re here, book a free online
              consultation: tell us your idea and we’ll show you what we’ve made.
            </p>
            <div className={styles.buttons}>
              <Button className={styles.button} variant="primary" href="/book">
                Book a free consultation
              </Button>
              <Button className={styles.button} variant="secondary" href="/the-bench">
                See how a piece is made
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHead
        eyebrow="Catalog"
        title={title}
        lede="Every piece here was drawn with the person who wears it. Browse them, see where each one starts, and book a free consultation about the one you like."
        aside={`${pieces.length} ${pieces.length === 1 ? 'piece' : 'pieces'}`}
      />
      <ul className={styles.pieces}>
        {pieces.map((piece) => (
          <li key={piece.slug}>
            <PieceCard piece={piece} grid />
          </li>
        ))}
      </ul>
      <ConsultationBand
        heading={
          <>
            Seen something <em>close?</em>
          </>
        }
      >
        Book a free online consultation about the piece you liked and we will draw your own version
        with you.
      </ConsultationBand>
    </>
  )
}
