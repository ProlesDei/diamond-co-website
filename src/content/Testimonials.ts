import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from './access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'piece', 'consentOnFile', '_status'],
  },
  access: {
    read: publishedOrStaff,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'piece', type: 'relationship', relationTo: 'pieces' },
    {
      name: 'consentOnFile',
      label: 'Consent on file',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick only once the client has agreed, in writing, to show these words.' },
      // Drafts skip validation, so this refuses a publish and never a draft.
      validate: (value: boolean | null | undefined) =>
        value === true || 'Tick "Consent on file" before publishing this testimonial.',
    },
  ],
}
