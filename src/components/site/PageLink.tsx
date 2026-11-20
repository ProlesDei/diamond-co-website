import Link from 'next/link'
import type { ReactNode } from 'react'

type PageLinkProps = {
  href: string
  children: ReactNode
  id?: string
  className?: string
  onClick?: () => void
}

// Next's Link skips the scroll when the URL already ends in the same #hash, so a second
// press of an in-page link did nothing. A plain anchor scrolls on every press.
export function PageLink({ href, ...props }: PageLinkProps) {
  return href.startsWith('#') ? <a href={href} {...props} /> : <Link href={href} {...props} />
}
