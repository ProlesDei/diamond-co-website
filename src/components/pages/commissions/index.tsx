import { PieceCard } from '@/components/home/commissions/PieceCard'
import { Button } from '@/components/site/Button'

import { Confirm } from '../Confirm'
import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Commissions.module.css'
import { getCommissionPieces } from './pieces'

export function generateMetadata() {
  return pageMetadata('Commissions')
}

const title = (
  <>
    Made for <em>one person each.</em>
  </>
)

export default async function CommissionsPage() {
  const pieces = await getCommissionPieces()

  if (pieces.length === 0) {
    return (
      <>
        <PageHead eyebrow="Commissions" title={title} />
        <div className={styles.empty}>
          <div className={styles.frame} aria-hidden="true">
            <span className={styles.ampersand}>&amp;</span>
          </div>
          <div>
            <h2 className={styles.heading}>The first pieces go up soon.</h2>
            <p className={styles.text}>
              We’re photographing recent commissions now. Until they’re here, the quickest way to see
              our work is across the table: bring an idea and we’ll show you pieces in person
              <Confirm />.
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
        eyebrow="Commissions"
        title={title}
        lede="Every piece here was drawn with the person who wears it and made by hand at our bench in White Rock. None of it is for sale: it shows what we can make with you."
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
        Bring the piece you liked to a free consultation and we will draw your own version with you, in
        White Rock.
        <Confirm />
      </ConsultationBand>
    </>
  )
}
