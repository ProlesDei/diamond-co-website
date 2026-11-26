export const links = {
  catalog: '/catalog',
  studio: '/studio',
  contact: '/contact',
  questions: '/faq',
  privacy: '/privacy',
} as const

export function currentPage(pathname: string, href: string): 'page' | undefined {
  return pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined
}

export function bookHref(pathname: string): string {
  return pathname === '/' ? '#book' : '/book'
}
