import type { Payload } from 'payload'

import type { SiteSetting } from '../payload-types'
import { seedContext } from './context'
import { faqPageSeedSettings, homeFaqSeedIds } from './faqs'

// Sample facts only, for the client to replace. Email and social links are left empty.
const sampleSettings = {
  storeName: 'Diamond & Co',
  address: '',
  phone: '604-555-0123',
  hours: [
    { days: 'Tuesday to Saturday', hours: '10 am to 5 pm' },
    { days: 'Sunday and Monday', hours: 'Closed' },
  ],
} satisfies Partial<SiteSetting>

export const seedSiteSettings = async (payload: Payload): Promise<string[]> => {
  const current = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  if (current.storeName) return []

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      ...sampleSettings,
      homeFaqs: await homeFaqSeedIds(payload),
      faqPage: await faqPageSeedSettings(payload),
    },
    overrideAccess: true,
    context: seedContext,
  })
  return ['sample store name, phone and hours. Address left blank.']
}
