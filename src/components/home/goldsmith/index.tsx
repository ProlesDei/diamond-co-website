import Image from 'next/image'

import { Confirm } from '@/components/pages/Confirm'
import { getGoldsmithProfile } from '@/lib/content'

import styles from './Goldsmith.module.css'

const quoteSlots = [
  "Slot for a real Google review, quoted word for word with the client's permission.",
  'Slot for a second real review, ideally an heirloom redesign.',
]

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
            We make each piece at our bench
            <Confirm />. The goldsmith you meet online makes your piece
            <Confirm />.
          </p>
          <div className={styles.proof}>
            <p className={styles.rating}>
              <span className={styles.star} aria-hidden="true">
                ★
              </span>{' '}
              [X.X] from [N] Google reviews
              <Confirm note="client supplies" />
            </p>
            <ul className={styles.quotes} role="list">
              {quoteSlots.map((slot) => (
                <li className={styles.slot} key={slot}>
                  <p>{slot}</p>
                  <p className={styles.by}>
                    [First name], [piece]
                    <Confirm note="client supplies" />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
