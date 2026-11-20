'use client'

import { Confirm } from '@/components/pages/Confirm'
import { Button } from '@/components/site/Button'
import { useReducedMotion } from '@/components/site/useReducedMotion'

import styles from './BookingBar.module.css'
import { useBarShown } from './useBarShown'

export function BookingBar() {
  const shown = useBarShown()
  const reduceMotion = useReducedMotion()
  const className = [styles.bar, shown && styles.shown, reduceMotion && styles.instant]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <Button variant="primary" href="#book" className={styles.button}>
        Book a free consultation
      </Button>
      <p className={styles.micro}>
        Reply within one business day
        <Confirm />
      </p>
    </div>
  )
}
