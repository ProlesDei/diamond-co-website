'use client'

import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useSyncExternalStore } from 'react'

import { Confirm } from '../Confirm'
import { readSent } from './sent'
import styles from './Thanks.module.css'

const subscribe = () => () => {}
const notReadYet = () => undefined

export function Thanks() {
  // The server can't see sessionStorage, so it renders nothing and the browser decides.
  const sent = useSyncExternalStore(subscribe, readSent, notReadYet)

  if (sent === undefined) return null
  if (sent === null) redirect('/book')

  const { firstName, reference, piece } = sent

  return (
    <div className={styles.page}>
      <div>
        <p className={styles.eyebrow}>Request sent</p>
        <h1 className={styles.title}>
          Thank you, <em>{firstName}.</em>
        </h1>
        <p className={styles.reference}>
          <span>Your reference</span>
          <b>{reference}</b>
        </p>
        <p className={styles.lede}>
          Quote the reference if you call.
        </p>
        <ol className={styles.steps}>
          <li>
            <div>
              <h2>We read it today</h2>
              <p>
                [GOLDSMITH] reads every request themselves
                <Confirm />, photos and all.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h2>
                We reply within one business day
                <Confirm />
              </h2>
              <p>By email, as you asked, to set a time for your free consultation.</p>
            </div>
          </li>
          <li>
            <div>
              <h2>You sit down with us</h2>
              <p>
                Thirty minutes in White Rock
                <Confirm />. Bring the stone or piece if you have one. You leave with a sketch, a
                price range and a timeline.
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
          <Link className={styles.link} href="/commissions">
            See the commissions
          </Link>
        </p>
        <p>
          <Link className={styles.link} href="/the-bench">
            See how a piece is made
          </Link>
        </p>
        <p>
          <Link className={styles.link} href="/visit">
            Find the studio
          </Link>
        </p>
      </aside>
    </div>
  )
}
