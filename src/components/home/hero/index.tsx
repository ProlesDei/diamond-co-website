import { getHomePieces } from '@/components/home/pieces'
import { Confirm } from '@/components/pages/Confirm'
import { Button } from '@/components/site/Button'

import styles from './Hero.module.css'
import { HeroPhoto } from './HeroPhoto'
import { HeroSection } from './HeroSection'
import { getStone } from './stone'

function Headline() {
  return (
    <>
      Made for
      <br />
      <em>one hand.</em>
    </>
  )
}

type HeroProps = {
  reduceMotion: boolean
}

export async function Hero({ reduceMotion }: HeroProps) {
  const [piece] = await getHomePieces()
  const image = piece?.image

  return (
    <HeroSection reduceMotion={reduceMotion}>
      <h1 className={styles.headline}>
        <Headline />
      </h1>
      {piece && image ? (
        <HeroPhoto image={image} stone={await getStone(piece.slug)} />
      ) : (
        <div className={styles.photo}>
          <p className={styles.placeholder}>Placeholder: studio photo of the newest featured piece</p>
        </div>
      )}
      <p className={`${styles.headline} ${styles.copy}`} aria-hidden="true">
        <Headline />
      </p>
      <div className={styles.intro}>
        <p className={styles.lede}>
          Custom engagement rings and heirloom redesigns, drawn with you and made by hand at our bench in
          White Rock. Bring a sketch, a photo, or a stone of your own.
        </p>
        <div className={styles.buttons}>
          <Button variant="primary" href="#book" id="hero-book" className={styles.button}>
            Book a free design consultation
          </Button>
          <Button variant="secondary" href="#commissions" className={styles.button}>
            See the commissions
          </Button>
        </div>
        <p className={styles.micro}>
          30 minutes · No obligation · Reply within one business day
          <Confirm />
        </p>
      </div>
    </HeroSection>
  )
}
