import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'

import { studio } from '@/components/site/studio'
import { getBookOptions } from '@/inquiry/options'
import { calendlyUrl } from '@/lib/calendly'

import { pageMetadata } from '../metadata'
import styles from './book.module.css'
import { Form } from './Form'
import { Mark } from './Mark'
import { findAskedPiece } from './piece/lookup'

const { address, hours, appointment } = studio
const [openHours] = hours

const STEPS = [
  { title: 'You send this form', text: "Two minutes. Photos help but aren't needed." },
  calendlyUrl
    ? {
        title: 'You pick a time on this page',
        mark: 'confirm',
        text: 'Right after the form, from our open consultation times.',
      }
    : {
        title: 'We reply within one business day',
        mark: 'confirm',
        text: 'By the way you choose, to set a time.',
      },
  { title: 'You sit down with us', text: 'Bring the stone or piece if you have one.' },
]

export function generateMetadata() {
  return pageMetadata('Book a free consultation')
}

export default async function BookPage({ searchParams }: PageProps<'/book'>) {
  // The labels come from the CMS and an admin's edit shows on the next load, so never prerender.
  await connection()
  const { piece: pieceParam } = await searchParams
  const options = await getBookOptions(await getPayload({ config }))
  const { piece, initialPieceType } = await findAskedPiece(
    typeof pieceParam === 'string' ? pieceParam : undefined,
    options,
  )

  return (
    <section className={styles.book} aria-label="Book a free consultation">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            Your free consultation
            <Mark note="confirm" />
          </p>
          <h1 className={styles.heading}>
            Sit down with <em>[GOLDSMITH].</em>
          </h1>
          <p className={styles.lead}>
            Thirty minutes across the table in White Rock
            <Mark note="confirm" />. You leave with a sketch, a price range and a timeline, whether
            or not you go ahead.
          </p>
          <ol className={styles.steps}>
            {STEPS.map((step) => (
              <li key={step.title}>
                <span>
                  <b>
                    {step.title}
                    {step.mark && <Mark note={step.mark} />}
                  </b>
                  {step.text}
                </span>
              </li>
            ))}
          </ol>
          <dl className={styles.visit}>
            <dt>Where</dt>
            <dd>
              {address.street.text}
              <Mark note={address.street.marker} />
              <br />
              {address.city}
            </dd>
            <dt>When</dt>
            <dd>
              {openHours.days}, {openHours.time}
              <Mark note={openHours.marker} />
              <br />
              {appointment.text}
              <Mark note={appointment.marker} />
            </dd>
          </dl>
        </div>
        <div className={styles.panel}>
          <Form heading="h2" options={options} piece={piece} initialPieceType={initialPieceType} />
        </div>
      </div>
    </section>
  )
}
