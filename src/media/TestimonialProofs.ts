import type { Access, CollectionConfig } from 'payload'

import { giveNewUploadAFreeName } from './fileName'

export const TESTIMONIAL_PROOFS_PREFIX = 'testimonial-proofs'

// Visitors see a screenshot only while a published testimonial with consent on file shows it,
// so a proof attached to a draft, or to a testimonial taken down, stays private.
export const shownProofsOrStaff: Access = async ({ req }) => {
  if (req.user) return true
  const { docs } = await req.payload.find({
    collection: 'testimonials',
    where: { _status: { equals: 'published' }, consentOnFile: { equals: true }, proof: { exists: true } },
    draft: false,
    depth: 0,
    pagination: false,
    select: { proof: true },
    overrideAccess: true,
    req,
  })
  const ids = docs.flatMap(({ proof }) => (proof ? [typeof proof === 'string' ? proof : proof.id] : []))
  return { id: { in: ids } }
}

// Screenshots that back a testimonial, such as the Google review itself. Any size, unlike Media.
export const TestimonialProofs: CollectionConfig = {
  slug: 'testimonial-proofs',
  labels: { singular: 'Testimonial proof', plural: 'Testimonial proofs' },
  access: {
    read: shownProofsOrStaff,
  },
  hooks: {
    beforeOperation: [giveNewUploadAFreeName],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'What the screenshot shows, read out in its place. For example, Google review from Sam, 5 stars.' },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}
