import { Button } from '@/components/site/Button'
import { studio } from '@/components/site/studio'

import { Confirm } from '../Confirm'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Contact.module.css'

const { hours, appointment, phone, email } = studio

export function generateMetadata() {
  return pageMetadata('Contact')
}

export default function ContactPage() {
  return (
    <>
      <PageHead
        eyebrow="Contact"
        title={
          <>
            Talk to <em>us.</em>
          </>
        }
        lede="Consultations are free and online, 15 to 30 minutes. Book a time, or call or email us."
      />
      <div className={styles.layout}>
        <dl className={styles.facts}>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={phone.href}>{phone.text}</a>
              <Confirm note={phone.marker} />
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={email.href}>{email.text}</a>
              <Confirm note={email.marker} />
            </dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>
              <ul className={styles.hours}>
                {hours.map(({ days, time, marker }) => (
                  <li key={days}>
                    <span>{days}</span>
                    <span>
                      {time}
                      <Confirm note={marker} />
                    </span>
                  </li>
                ))}
              </ul>
              <span className={styles.appointment}>
                {appointment.text}
                <Confirm note={appointment.marker} />
              </span>
            </dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Button variant="primary" href="/book">
            Book a free consultation
          </Button>
          <Button variant="secondary" href={phone.href}>
            Call {phone.text}
          </Button>
        </div>
      </div>
    </>
  )
}
