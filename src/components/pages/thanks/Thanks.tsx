'use client'

import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useSyncExternalStore } from 'react'

import { studio } from '@/components/site/studio'

import { Confirm } from '../Confirm'
import { readSent } from './sent'
import styles from './Thanks.module.css'

const subscribe = () => () => {}
const notReadYet = () => undefined

export function Thanks({ goldsmithName }: { goldsmithName: string | null }) {
  // The server can't see sessionStorage, so it renders nothing and the browser decides.
  const sent = useSyncExternalStore(subscribe, readSent, notReadYet)

  if (sent === undefined) return null
  if (sent === null) redirect('/book')

  const { reference, piece } = sent

  return (
    <div className={styles.page}>
      <div>
        <p className={styles.eyebrow}>Request sent</p>
        <h1 className={styles.title}>Thank you.</h1>
        <p className={styles.reference}>
          <span>Your reference</span>
          <b>{reference}</b>
        </p>
        <p className={styles.lede}>Quote it when you call or email us to set a time.</p>
        <ol className={styles.steps}>
          <li>
            <div>
              <h2>We read it today</h2>
              <p>
                {goldsmithName ?? 'Your goldsmith'} reads every request themselves
                <Confirm />.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h2>You call or email us</h2>
              <p>
                Call <a href={studio.phone.href}>{studio.phone.text}</a>
                <Confirm note={studio.phone.marker} /> or email{' '}
                <a href={studio.email.href}>{studio.email.text}</a>
                <Confirm note={studio.email.marker} /> with your reference to set a time for your free
                consultation.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h2>We talk online</h2>
              <p>
                A free online consultation, 15 to 30 minutes
                <Confirm />. You come away with a sketch, a price range and a timeline.
              </p>
            </div>
          </li>
        </ol>
        <p className={styles.after}>
          Nothing is booked or charged until you agree. Rather talk? Call{' '}
          <span className={styles.phone}>[PHONE]</span>
          <Confirm note="client supplies" />
        </p>
      </div>
      <aside className={styles.side} aria-label="While you wait">
        <h2>While you wait</h2>
        {piece && (
          <div className={styles.piece}>
            <div className={styles.photo}>
              <Image src={piece.photoUrl} alt="" fill sizes="64px" />
            </div>
            <p>
              You asked about<b>{piece.name}</b>
            </p>
          </div>
        )}
        <p>
          <Link className={styles.link} href="/catalog">
            See the catalog
          </Link>
        </p>
        <p>
          <Link className={styles.link} href="/the-bench">
            See how a piece is made
          </Link>
        </p>
        <p>
          <Link className={styles.link} href="/contact">
            Contact us
          </Link>
        </p>
      </aside>
    </div>
  )
}
