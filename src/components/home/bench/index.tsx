import styles from './Bench.module.css'
import { Hinge } from './Hinge'

export function Bench() {
  return (
    <section id="bench" className={styles.section} aria-labelledby="bench-heading">
      <div className={styles.hinge}>
        <div>
          <p className={styles.eyebrow}>The Bench</p>
          <h2 className={styles.heading} id="bench-heading">
            Your idea, <em>our bench.</em>
          </h2>
          <p className={styles.lede}>
            Bring a sketch, a photo or a stone of your own. We draw it with you across the table,
            then make it here, by hand, in the metal you choose.
          </p>
        </div>
        <Hinge />
      </div>
    </section>
  )
}
