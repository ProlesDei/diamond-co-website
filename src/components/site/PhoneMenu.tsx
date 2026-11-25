import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from './Button'
import { bookHref, currentPage, links } from './nav'
import styles from './PhoneMenu.module.css'
import { useReducedMotion } from './useReducedMotion'

type PhoneMenuProps = {
  id: string
  open: boolean
  onNavigate: () => void
}

export function PhoneMenu({ id, open, onNavigate }: PhoneMenuProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const className = [styles.menu, open && styles.open, reduceMotion && styles.instant]
    .filter(Boolean)
    .join(' ')

  return (
    <div id={id} className={className}>
      <Link
        className={styles.link}
        href={links.catalog}
        aria-current={currentPage(pathname, links.catalog)}
        onClick={onNavigate}
      >
        Catalog
      </Link>
      <Link
        className={styles.link}
        href={links.bench}
        aria-current={currentPage(pathname, links.bench)}
        onClick={onNavigate}
      >
        The Bench
      </Link>
      <div className={styles.small}>
        <Link
          href={links.contact}
          aria-current={currentPage(pathname, links.contact)}
          onClick={onNavigate}
        >
          Contact
        </Link>
        <Link
          href={links.questions}
          aria-current={currentPage(pathname, links.questions)}
          onClick={onNavigate}
        >
          Questions
        </Link>
      </div>
      <Button variant="primary" href={bookHref(pathname)} className={styles.book} onClick={onNavigate}>
        Book a free consultation
      </Button>
      <p className={styles.micro}>Pick a time online</p>
    </div>
  )
}
