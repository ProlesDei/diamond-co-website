'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { bookHref, currentPage, links } from './nav'
import { PageLink } from './PageLink'
import { PhoneMenu } from './PhoneMenu'
import styles from './SiteHeader.module.css'

const MENU_ID = 'menu'
const DESKTOP_QUERY = '(min-width: 760px)'

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.setAttribute('data-menu-open', '')
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuButton.current?.focus()
    }
    const desktop = window.matchMedia(DESKTOP_QUERY)
    function onWidthChange(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onWidthChange)
    return () => {
      root.removeAttribute('data-menu-open')
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onWidthChange)
    }
  }, [open])

  function closeMenu() {
    setOpen(false)
  }

  function toggleMenu() {
    setOpen(!open)
    menuButton.current?.focus()
  }

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main">
          <Link
            className={styles.link}
            href={links.commissions}
            aria-current={currentPage(pathname, links.commissions)}
          >
            Commissions
          </Link>
          <Link
            className={styles.link}
            href={links.bench}
            aria-current={currentPage(pathname, links.bench)}
          >
            The Bench
          </Link>
        </nav>
        <Link className={styles.mark} href="/" onClick={closeMenu}>
          Diamond &amp; Co.
        </Link>
        <PageLink className={`${styles.link} ${styles.book}`} href={bookHref(pathname)}>
          Book a free consultation
        </PageLink>
        <button
          ref={menuButton}
          className={styles.menuButton}
          type="button"
          aria-expanded={open}
          aria-controls={MENU_ID}
          onClick={toggleMenu}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      <PhoneMenu id={MENU_ID} open={open} onNavigate={closeMenu} />
    </>
  )
}
