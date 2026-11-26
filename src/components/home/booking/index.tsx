import config from '@payload-config'
import { connection } from 'next/server'
import { getPayload } from 'payload'

import { Form } from '@/components/pages/book/Form'
import { getCalendlyLink } from '@/inquiry/options'
import { getGoldsmithName } from '@/lib/content'

import styles from './booking.module.css'

export async function Booking() {
  await connection()
  const [calendlyLink, goldsmithName] = await Promise.all([
    getCalendlyLink(await getPayload({ config })),
    getGoldsmithName(),
  ])

  return (
    <section className={styles.book} id="book" aria-labelledby="book-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Your free consultation</p>
          <h2 className={styles.heading} id="book-heading">
            Talk with <em>{goldsmithName ?? 'us'}.</em>
          </h2>
          <p className={styles.lead}>
            Meet online for a free 15–30 minute consultation. You leave with a direction for your
            sketch, a price range and a timeline, whether or not you go ahead.
          </p>
          <dl className={styles.visit}>
            <dt>When</dt>
            <dd>
              Tuesday to Saturday, 10 am to 5 pm
              <br />
              By appointment
            </dd>
            <dt>Lead time</dt>
            <dd>About 2-4 weeks to your hand</dd>
          </dl>
        </div>
        <div className={styles.panel}>
          <Form heading="h3" calendlyLink={calendlyLink} piece={null} />
        </div>
      </div>
    </section>
  )
}
