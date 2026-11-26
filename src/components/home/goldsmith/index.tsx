import Image from 'next/image'

import { getGoldsmithProfile } from '@/lib/content'

import styles from './Goldsmith.module.css'

export async function Goldsmith() {
  const { name, credential, portrait } = await getGoldsmithProfile()

  return (
    <section id="goldsmith" className={styles.section} aria-labelledby="goldsmith-heading">
      <div className={portrait ? `${styles.inner} ${styles.withPortrait}` : styles.inner}>
        {portrait && (
          <figure className={styles.portrait}>
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 899px) 280px, 460px"
              className={styles.photo}
            />
          </figure>
        )}
        <div>
          {name && <p className={styles.eyebrow}>Meet your goldsmith</p>}
          <h2 className={styles.heading} id="goldsmith-heading">
            {name ?? 'Meet your goldsmith'}
          </h2>
          {credential && <p className={styles.credential}>{credential}</p>}
          <p className={styles.lede}>
            We make each piece at our bench. The goldsmith you meet online makes your piece.
          </p>
        </div>
      </div>
    </section>
  )
}
