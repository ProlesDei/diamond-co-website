import type { CollectionConfig } from 'payload'

import { giveNewUploadAFreeName } from './fileName'

// Screenshots that back a testimonial, such as the Google review itself. Any size, unlike Media.
export const TestimonialProofs: CollectionConfig = {
  slug: 'testimonial-proofs',
  labels: { singular: 'Testimonial proof', plural: 'Testimonial proofs' },
  access: {
    read: () => true,
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
