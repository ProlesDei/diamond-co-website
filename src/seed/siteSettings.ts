import type { Payload } from 'payload'

import type { SiteSetting } from '../payload-types'
import { seedContext } from './context'
import { faqPageSeedSettings, homeFaqSeedIds } from './faqs'

// Sample facts only, each marked [confirm] until the client answers. Email and social links
// are left empty: their fields check the format, so they can't carry the marker.
const sampleSettings = {
  storeName: 'Diamond & Co [confirm]',
  address: '',
  phone: '604-555-0123 [confirm]',
  hours: [
    { days: 'Tuesday to Saturday', hours: '10 am to 5 pm [confirm]' },
    { days: 'Sunday and Monday', hours: 'Closed [confirm]' },
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
  return ['sample store name, phone and hours, each marked [confirm]. Address left blank.']
}
