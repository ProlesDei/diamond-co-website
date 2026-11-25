import { Button } from '@/components/site/Button'

import styles from './FinalConsultation.module.css'

export function FinalConsultation() {
  return (
    <section className={styles.section} aria-labelledby="final-consultation-heading">
      <div className={styles.inner}>
        <h2 className={styles.heading} id="final-consultation-heading">
          Ready to start <em>your piece?</em>
        </h2>
        <p className={styles.lede}>
          Bring a photo, a sketch or just an idea. In a free 15–30 minute online consultation, you get
          a direction for your sketch, a price range and a timeline. Decide later whether to go ahead.
        </p>
        <Button variant="inverse" href="#book" className={styles.button}>
          Book a free consultation
        </Button>
      </div>
    </section>
  )
}
