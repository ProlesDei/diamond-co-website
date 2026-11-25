'use client'

import { usePathname } from 'next/navigation'

import { bookHref } from './nav'
import { PageLink } from './PageLink'

export function FooterBookLink() {
  return <PageLink href={bookHref(usePathname())}>Book a free consultation</PageLink>
}
