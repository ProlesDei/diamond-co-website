import { getHomeImages } from '@/components/home/homeImages'
import type { HomeImage } from '@/components/home/pieces'

import { BenchPhoto } from './BenchPhoto'
import styles from './Hinge.module.css'

type PlateProps = {
  image: HomeImage | null
  placeholder: string
}

function Plate({ image, placeholder }: PlateProps) {
  return (
    <figure className={styles.figure}>
      <div className={styles.plate}>
        {image ? (
          <BenchPhoto image={image} className={styles[image.shot]} />
        ) : (
          <p className={styles.placeholder}>{placeholder}</p>
        )}
      </div>
    </figure>
  )
}

export async function Hinge({ large = false }: { large?: boolean }) {
  const { benchDaylight, benchStudio } = await getHomeImages()

  return (
    <div className={styles.plates}>
      <Plate
        image={benchDaylight}
        placeholder="Placeholder: daylight photo, chosen in Site settings → Home page images"
      />
      <div className={large ? `${styles.ampersand} ${styles.large}` : styles.ampersand} aria-hidden="true">
        &amp;
      </div>
      <Plate
        image={benchStudio}
        placeholder="Placeholder: studio photo, chosen in Site settings → Home page images"
      />
    </div>
  )
}
