import { Button } from '@/components/site/Button'
import { getStudioContact, studio } from '@/components/site/studio'

import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Contact.module.css'

const { hours, appointment } = studio

export function generateMetadata() {
  return pageMetadata('Contact')
}

export default async function ContactPage() {
  const { phone, email } = await getStudioContact()

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title={
          <>
            Talk to <em>us.</em>
          </>
        }
        lede="Consultations are free and online, 15 to 30 minutes. Book a time to talk about your piece."
      />
      <div className={styles.layout}>
        <dl className={styles.facts}>
          {phone && (
            <div>
              <dt>Phone</dt>
              <dd><a href={phone.href}>{phone.text}</a></dd>
            </div>
          )}
          {email && (
            <div>
              <dt>Email</dt>
              <dd><a href={email.href}>{email.text}</a></dd>
            </div>
          )}
          <div>
            <dt>Hours</dt>
            <dd>
              <ul className={styles.hours}>
                {hours.map(({ days, time }) => (
                  <li key={days}>
                    <span>{days}</span>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
              <span className={styles.appointment}>{appointment.text}</span>
            </dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Button variant="primary" href="/book">
            Book a free consultation
          </Button>
        </div>
      </div>
    </>
  )
}
