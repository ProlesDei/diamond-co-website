import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Client photo', value: 'client-photo' },
        { label: "Atmosphere (generated, never the client's work)", value: 'atmosphere' },
        { label: 'Placeholder (sample only)', value: 'placeholder' },
      ],
    },
  ],
  upload: true,
}
