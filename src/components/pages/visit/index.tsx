import { Button } from '@/components/site/Button'
import { studio } from '@/components/site/studio'

import { Confirm } from '../Confirm'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Visit.module.css'

const { address, hours, appointment, phone, email } = studio

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${address.street.text}, ${address.city} ${address.postalCode.text}`,
)}`

export function generateMetadata() {
  return pageMetadata('Visit')
}

export default function VisitPage() {
  return (
    <>
      <PageHead
        eyebrow="Visit"
        title={
          <>
            Visit <em>the studio.</em>
          </>
        }
        lede={
          <>
            Consultations are by appointment, so the goldsmith is free to sit down with you
            <Confirm />.
          </>
        }
      />
      <div className={styles.layout}>
        <div>
          <dl className={styles.facts}>
            <div>
              <dt>Address</dt>
              <dd>
                {address.street.text}
                <Confirm note={address.street.marker} />
                <br />
                {address.city} {address.postalCode.text}
                <Confirm note={address.postalCode.marker} />
                <br />
                <a href={mapsHref}>Open in Maps</a>
              </dd>
            </div>
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
                <span className={styles.appointment}>
                  {appointment.text}
                  <Confirm note={appointment.marker} />
                </span>
              </dd>
            </div>
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
        <div>
          <div className={styles.frame}>Placeholder: the studio&rsquo;s front door, from the client</div>
          <h2 className={styles.heading}>Finding us</h2>
          <p>
            We&rsquo;re in White Rock, a few minutes up from the pier
            <Confirm />. Parking is [on the street / behind the building]
            <Confirm />.
          </p>
          <p>
            The studio is [step-free / up one flight of stairs]
            <Confirm />. If you need anything to make the visit easier, say so in the form and
            we&rsquo;ll arrange it.
          </p>
        </div>
      </div>
    </>
  )
}
