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
          {name && <p className={styles.eyebrow}>Meet your designer</p>}
          <h2 className={styles.heading} id="goldsmith-heading">
            {name ?? 'Meet your designer'}
          </h2>
          {credential && <p className={styles.credential}>{credential}</p>}
        </div>
      </div>
    </section>
  )
}
