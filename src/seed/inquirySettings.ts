import type { Payload } from 'payload'

import { seedContext } from './context'

// A sample only. The studio pastes its own Calendly event link in the admin.
const sampleCalendlyLink = 'https://calendly.com/diamond-co-sample/consultation'

export const seedInquirySettings = async (payload: Payload): Promise<string[]> => {
  const current = await payload.findGlobal({ slug: 'inquiry-settings', depth: 0, overrideAccess: true })
  if (current.calendlyLink) return []

  await payload.updateGlobal({
    slug: 'inquiry-settings',
    data: { calendlyLink: sampleCalendlyLink },
    overrideAccess: true,
    context: seedContext,
  })
  return [`sample Calendly link ${sampleCalendlyLink}`]
}
