import { useId, type ReactNode } from 'react'

import { Button } from '@/components/site/Button'

import { Confirm } from './Confirm'
import styles from './ConsultationBand.module.css'

type ConsultationBandProps = {
  heading: ReactNode
  children: ReactNode
}

export function ConsultationBand({ heading, children }: ConsultationBandProps) {
  const headingId = useId()

  return (
    <section className={styles.band} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <div>
          <h2 className={styles.heading} id={headingId}>
            {heading}
          </h2>
          <p className={styles.text}>{children}</p>
        </div>
        <div>
          <Button className={styles.button} variant="inverse" href="/book">
            Book a free consultation
          </Button>
          <p className={styles.micro}>
            Reply within one business day
            <Confirm />
          </p>
        </div>
      </div>
    </section>
  )
}
