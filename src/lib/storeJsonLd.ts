import type { SiteSetting } from '@/payload-types'

import { siteUrl } from './site'

export const storeJsonLd = (settings: SiteSetting): string => {
  const store = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: settings.storeName,
    telephone: settings.phone || undefined,
    openingHours: settings.hours?.map(({ days, hours }) => `${days} ${hours}`),
    url: siteUrl,
  }
  return JSON.stringify(store).replace(/</g, '\\u003c')
}
