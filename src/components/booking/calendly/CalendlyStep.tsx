'use client'

import { useCallback, useState } from 'react'

import { Confirm } from '@/components/pages/Confirm'
import { Button } from '@/components/site/Button'
import { studio } from '@/components/site/studio'

import styles from './calendly.module.css'
import { frameUrl, isScheduled } from './prefill'
import type { CalendlyPrefill } from './prefill'

type CalendlyStepProps = {
  link: string
  heading: 'h2' | 'h3'
  prefill: CalendlyPrefill
  onBack: () => void
}

// Stable, so React calls it only when a heading mounts: the step's heading takes focus as the step opens.
const focusOnMount = (node: HTMLHeadingElement | null) => node?.focus()

function StudioPhone() {
  return (
    <>
      <a href={studio.phone.href}>{studio.phone.text}</a>
      <Confirm note={studio.phone.marker} />
    </>
  )
}

export function CalendlyStep({ link, heading: Heading, prefill, onBack }: CalendlyStepProps) {
  const [scheduled, setScheduled] = useState(false)

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
          Your answers and any photos are saved with the studio under <strong>{prefill.reference}</strong>.
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
        Times not loading? Call <StudioPhone /> and we&apos;ll set one with you.
      </p>
      <Button variant="secondary" type="button" onClick={onBack}>
        Back to your answers
      </Button>
    </div>
  )
}
