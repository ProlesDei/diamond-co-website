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
            Share a sketch or a photo, or tell us about a stone you want to reuse. We draw the
            piece with you online, then make it by hand in the metal you choose.
          </p>
        </div>
        <Hinge />
      </div>
    </section>
  )
}
