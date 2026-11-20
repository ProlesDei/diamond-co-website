import Link from 'next/link'

import { links } from '@/components/site/nav'

import { pageMetadata } from '../metadata'
import styles from './NotFound.module.css'

const ways = [
  { href: links.commissions, label: 'See the commissions' },
  { href: links.bench, label: 'See how a piece is made' },
  { href: links.visit, label: 'Find the studio' },
  { href: '/book', label: 'Book a free consultation' },
]

export function generateMetadata() {
  return pageMetadata('Page not found')
}

export default function NotFoundPage() {
  return (
    <div className={styles.layout}>
      <div>
        <p className={styles.eyebrow}>Page not found</p>
        <h1 className={styles.title}>
          This page <em>isn&apos;t here.</em>
        </h1>
        <p className={styles.lede}>
          The link may be old, or a piece may have moved. These will get you back:
        </p>
        <ul className={styles.ways}>
          {ways.map(({ href, label }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.numerals} aria-hidden="true">
        404
      </div>
    </div>
  )
}
