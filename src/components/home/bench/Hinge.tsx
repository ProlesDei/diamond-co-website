import type { HomeImage } from '@/components/home/pieces'
import { getHomePieces } from '@/components/home/pieces'

import { BenchPhoto } from './BenchPhoto'
import styles from './Hinge.module.css'

type PlateProps = {
  image: HomeImage | undefined
  caption: string
  placeholder: string
}

function Plate({ image, caption, placeholder }: PlateProps) {
  return (
    <figure className={styles.figure}>
      <div className={styles.plate}>
        {image ? (
          <BenchPhoto image={image} className={styles[image.shot]} />
        ) : (
          <p className={styles.placeholder}>{placeholder}</p>
        )}
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}

export async function Hinge({ large = false }: { large?: boolean }) {
  const pieces = await getHomePieces()
  const images = pieces.flatMap((piece) => (piece.image ? [piece.image] : []))
  const daylight = images.find((image) => image.shot === 'daylight')
  const studio = images.find((image) => image.shot === 'studio')

  return (
    <div className={styles.plates}>
      <Plate
        image={daylight}
        caption="Your idea, in daylight"
        placeholder="Placeholder: daylight photo of a finished piece, from the client"
      />
      <div className={large ? `${styles.ampersand} ${styles.large}` : styles.ampersand} aria-hidden="true">
        &amp;
      </div>
      <Plate
        image={studio}
        caption="Made at our bench in White Rock"
        placeholder="Placeholder: studio photo of a finished piece, from the client"
      />
    </div>
  )
}
