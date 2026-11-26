import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from './access'

export const TESTIMONIAL_SOURCES = ['google', 'personal'] as const

export type TestimonialSource = (typeof TESTIMONIAL_SOURCES)[number]

export const TESTIMONIAL_SOURCE_LABELS: Record<TestimonialSource, string> = {
  google: 'Google review',
  personal: 'Personal testimonial',
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'source', 'piece', 'consentOnFile', '_status'],
  },
  access: {
    read: publishedOrStaff,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'personal',
      options: TESTIMONIAL_SOURCES.map((value) => ({ label: TESTIMONIAL_SOURCE_LABELS[value], value })),
      admin: { description: 'Shown with the quote, so visitors know where it comes from.' },
    },
    { name: 'firstName', label: 'Name', type: 'text', required: true },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'proof',
      label: 'Proof screenshot',
      type: 'upload',
      relationTo: 'testimonial-proofs',
      admin: { description: 'Optional. A screenshot of the review or message, shown beside the quote.' },
    },
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
