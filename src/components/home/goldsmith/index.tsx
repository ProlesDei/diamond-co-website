import { Confirm } from '@/components/pages/Confirm'

import styles from './Goldsmith.module.css'

const quoteSlots = [
  "Slot for a real Google review, quoted word for word with the client's permission.",
  'Slot for a second real review, ideally an heirloom redesign.',
]

export function Goldsmith() {
  return (
    <section id="goldsmith" className={styles.section} aria-labelledby="goldsmith-heading">
      <div className={styles.inner}>
        <figure className={styles.portrait}>
          <div className={styles.frame}>
            <p className={styles.placeholder}>
              Placeholder: portrait of [NAME] at the bench, from the client
            </p>
          </div>
        </figure>
        <div>
          <p className={styles.eyebrow}>Meet your goldsmith</p>
          <h2 className={styles.heading} id="goldsmith-heading">
            [NAME]
            <Confirm note="client supplies" />
          </h2>
          <p className={styles.credential}>
            [Credential: training, guild or years at the bench]
            <Confirm note="client supplies" />
          </p>
          <p className={styles.lede}>
            Made in-house at our White Rock bench
            <Confirm />. The person you sit down with is the one who makes your piece
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
