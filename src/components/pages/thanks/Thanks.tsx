'use client'

import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useSyncExternalStore } from 'react'

import type { StudioContact } from '@/components/site/studio'

import { readSent } from './sent'
import styles from './Thanks.module.css'

const subscribe = () => () => {}
const notReadYet = () => undefined

export function Thanks({ goldsmithName, contact }: { goldsmithName: string | null; contact: StudioContact }) {
  // The server can't see sessionStorage, so it renders nothing and the browser decides.
  const sent = useSyncExternalStore(subscribe, readSent, notReadYet)

  if (sent === undefined) return null
  if (sent === null) redirect('/book')

  const { reference, piece } = sent
  const { phone, email } = contact

  return (
    <div className={styles.page}>
      <div>
        <p className={styles.eyebrow}>Request sent</p>
        <h1 className={styles.title}>Thank you.</h1>
        <p className={styles.reference}>
          <span>Your reference</span>
          <b>{reference}</b>
        </p>
        <p className={styles.lede}>Quote it when you contact us to set a time.</p>
        <ol className={styles.steps}>
          <li>
            <div>
              <h2>We read it today</h2>
              <p>
                {goldsmithName ?? 'Your goldsmith'} reads every request themselves.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h2>Contact us to set a time</h2>
              <p>
                {phone && <>Call <a href={phone.href}>{phone.text}</a></>}
                {email && <>{phone ? ' or email ' : 'Email '}<a href={email.href}>{email.text}</a></>}
                {!phone && !email && <Link href="/contact">Contact the studio</Link>}
                {' '}with your reference to set a time for your free consultation.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h2>We talk online</h2>
              <p>
                A free online consultation, 15 to 30 minutes. You come away with a sketch, a
                price range and a timeline.
              </p>
            </div>
          </li>
        </ol>
        <p className={styles.after}>Nothing is booked or charged until you agree.</p>
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
