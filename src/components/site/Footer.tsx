'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Confirm } from '../pages/Confirm'
import styles from './Footer.module.css'
import { bookHref, links } from './nav'
import { PageLink } from './PageLink'
import { studio } from './studio'

export function Footer() {
  const pathname = usePathname()

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div>
          <p className={styles.mark}>Diamond &amp; Co.</p>
          <p>{studio.tagline}</p>
        </div>
        <nav aria-label="Pages">
          <h2 className={styles.heading}>Pages</h2>
          <ul className={styles.list}>
            <li>
              <Link href={links.catalog}>Catalog</Link>
            </li>
            <li>
              <Link href={links.bench}>The Bench</Link>
            </li>
            <li>
              <Link href={links.contact}>Contact</Link>
            </li>
            <li>
              <Link href={links.questions}>Questions</Link>
            </li>
            <li>
              <PageLink href={bookHref(pathname)}>Book a free consultation</PageLink>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.heading}>The studio</h2>
          <p>
            {studio.hours[0].days}, {studio.hours[0].time}
            <Confirm note={studio.hours[0].marker} />
            <br />
            {studio.appointment.text}
            <Confirm note={studio.appointment.marker} />
          </p>
          <p className={styles.fact}>
            <a className={styles.phone} href={studio.phone.href}>
              {studio.phone.text}
            </a>
            <Confirm note={studio.phone.marker} />
          </p>
        </div>
      </div>
      <div className={styles.base}>
        <span>© 2026 Diamond &amp; Co.</span>
        <Link className={styles.privacy} href={links.privacy}>
          Privacy
        </Link>
      </div>
    </footer>
  )
}
