import Link from 'next/link'

import { FooterBookLink } from './Footer.BookLink'
import styles from './Footer.module.css'
import { links } from './nav'
import { getStudioContact, studio } from './studio'

export async function Footer() {
  const { phone } = await getStudioContact()

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
              <Link href={links.studio}>Studio</Link>
            </li>
            <li>
              <Link href={links.contact}>Contact</Link>
            </li>
            <li>
              <Link href={links.questions}>Questions</Link>
            </li>
            <li>
              <FooterBookLink />
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.heading}>The studio</h2>
          <p>
            {studio.hours[0].days}, {studio.hours[0].time}
            <br />
            {studio.appointment.text}
          </p>
          {phone && (
            <p className={styles.fact}>
              <a className={styles.phone} href={phone.href}>{phone.text}</a>
            </p>
          )}
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
