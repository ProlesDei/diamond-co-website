'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'

import { Button } from '@/components/site/Button'
import type { StudioContact } from '@/components/site/studio'

import styles from './calendly.module.css'
import { frameUrl, isScheduled } from './prefill'
import type { CalendlyPrefill } from './prefill'

type CalendlyStepProps = {
  link: string
  heading: 'h2' | 'h3'
  prefill: CalendlyPrefill
  contact: StudioContact
  onBack: () => void
}

// Stable, so React calls it only when a heading mounts: the step's heading takes focus as the step opens.
const focusOnMount = (node: HTMLHeadingElement | null) => node?.focus()

export function CalendlyStep({ link, heading: Heading, prefill, contact, onBack }: CalendlyStepProps) {
  const [scheduled, setScheduled] = useState(false)
  const { phone, email } = contact

  // Listens only while the iframe is on the page; React runs the returned cleanup when it leaves.
  const listen = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) return
    const onMessage = (event: MessageEvent) => {
      if (isScheduled(event)) setScheduled(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (scheduled) {
    return (
      <div className={styles.step}>
        <p className={styles.eyebrow}>Consultation booked</p>
        <Heading className={styles.heading} tabIndex={-1} ref={focusOnMount}>
          Your time is booked
        </Heading>
        <p>Calendly has emailed you the time and the details.</p>
        <p>
          Your answers are saved with the studio under <strong>{prefill.reference}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.step}>
      <Heading className={styles.heading} tabIndex={-1} ref={focusOnMount}>
        Choose a time
      </Heading>
      <p>Pick a time for your free consultation. Your answers are already filled in.</p>
      <iframe
        className={styles.frame}
        ref={listen}
        src={frameUrl(link, prefill, window.location.host)}
        title="Choose a consultation time"
      />
      <p className={styles.call}>
        Times not loading?{' '}
        {phone ? (
          <>Call <a href={phone.href}>{phone.text}</a>.</>
        ) : email ? (
          <>Email <a href={email.href}>{email.text}</a>.</>
        ) : (
          <Link href="/contact">See how to contact us.</Link>
        )}
      </p>
      <Button variant="secondary" type="button" onClick={onBack}>
        Back to your answers
      </Button>
    </div>
  )
}
