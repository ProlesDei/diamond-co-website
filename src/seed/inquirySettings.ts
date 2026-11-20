import type { Payload } from 'payload'

import type { InquirySetting } from '../payload-types'
import { seedContext } from './context'

// Sample settings only. The email field checks the format, so it can't carry the [confirm]
// marker; it uses a reserved test domain instead. Piece types and budget ranges keep their
// field defaults.
const sampleSettings = {
  alertRecipients: [{ email: 'staff@example.test' }],
  autoReply:
    'Thank you for your consultation request. We have it and will be in touch to book a time. [confirm]',
  responseTime: 'Within 1 business day [confirm]',
} satisfies Partial<InquirySetting>

export const seedInquirySettings = async (payload: Payload): Promise<string[]> => {
  const current = await payload.findGlobal({ slug: 'inquiry-settings', depth: 0, overrideAccess: true })
  if (current.alertRecipients?.length || current.autoReply || current.responseTime) return []

  await payload.updateGlobal({
    slug: 'inquiry-settings',
    data: sampleSettings,
    overrideAccess: true,
    context: seedContext,
  })
  return ['staff recipient staff@example.test, sample auto-reply and response time, marked [confirm]']
}
