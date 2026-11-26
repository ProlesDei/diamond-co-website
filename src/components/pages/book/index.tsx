import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'

import { studio } from '@/components/site/studio'
import { getCalendlyLink } from '@/inquiry/options'
import { getGoldsmithName } from '@/lib/content'

import { pageMetadata } from '../metadata'
import styles from './book.module.css'
import { Form } from './Form'
import { findAskedPiece } from './piece/lookup'

const { hours, appointment } = studio
const [openHours] = hours

const steps = [
  { title: 'You send this form', text: 'Your name and email, and a photo if you have one.' },
  { title: 'You pick a time on Calendly', text: 'Right after the form.' },
  { title: 'You meet with us online', text: 'We talk through your design, budget and timing.' },
]

export function generateMetadata() {
  return pageMetadata('Book a free consultation')
}

export default async function BookPage({ searchParams }: PageProps<'/book'>) {
  // The Calendly link comes from the CMS and an edit shows on the next load, so never prerender.
  await connection()
  const { piece: pieceParam } = await searchParams
  const [calendlyLink, goldsmithName, piece] = await Promise.all([
    getCalendlyLink(await getPayload({ config })),
    getGoldsmithName(),
    findAskedPiece(typeof pieceParam === 'string' ? pieceParam : undefined),
  ])

  return (
    <section className={styles.book} aria-label="Book a free consultation">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Your free consultation</p>
          <h1 className={styles.heading}>
            Talk with <em>{goldsmithName ?? 'us'}.</em>
          </h1>
          <p className={styles.lead}>
            Meet online for a free 15–30 minute consultation. You leave with a direction for your
            sketch, a price range and a timeline, whether or not you go ahead.
          </p>
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.title}>
                <span>
                  <b>{step.title}</b>
                  {step.text}
                </span>
              </li>
            ))}
          </ol>
          <dl className={styles.visit}>
            <dt>When</dt>
            <dd>
              {openHours.days}, {openHours.time}
              <br />
              {appointment.text}
            </dd>
          </dl>
        </div>
        <div className={styles.panel}>
          <Form heading="h2" calendlyLink={calendlyLink} piece={piece} />
        </div>
      </div>
    </section>
  )
}
