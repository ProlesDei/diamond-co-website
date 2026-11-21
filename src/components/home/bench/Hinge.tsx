import { getHomeImages } from '@/components/home/homeImages'
import type { HomeImage } from '@/components/home/pieces'

import { BenchPhoto } from './BenchPhoto'
import styles from './Hinge.module.css'

type PlateProps = {
  image: HomeImage | null
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
  const { benchDaylight, benchStudio } = await getHomeImages()

  return (
    <div className={styles.plates}>
      <Plate
        image={benchDaylight}
        caption="Your idea, in daylight"
        placeholder="Placeholder: daylight photo, chosen in Site settings → Home page images"
      />
      <div className={large ? `${styles.ampersand} ${styles.large}` : styles.ampersand} aria-hidden="true">
        &amp;
      </div>
      <Plate
        image={benchStudio}
        caption="Made at our bench in White Rock"
        placeholder="Placeholder: studio photo, chosen in Site settings → Home page images"
      />
    </div>
  )
}
