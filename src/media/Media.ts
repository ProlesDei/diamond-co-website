import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const MINIMUM_LONG_EDGE = 2400

const requireMinimumSize: CollectionBeforeValidateHook = ({ data }) => {
  if (typeof data?.width !== 'number' || typeof data.height !== 'number') return data

  const longEdge = Math.max(data.width, data.height)
  if (longEdge < MINIMUM_LONG_EDGE) {
    throw new APIError(
      `The image is ${data.width}×${data.height}px. Its long edge must be at least ${MINIMUM_LONG_EDGE}px. Upload the original photo.`,
      400,
      null,
      true,
    )
  }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [requireMinimumSize],
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
    {
      name: 'shot',
      type: 'select',
      required: true,
      defaultValue: 'daylight',
      options: [
        { label: 'Studio (shot on black, shown on Deep green)', value: 'studio' },
        { label: 'Daylight', value: 'daylight' },
      ],
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg'],
    formatOptions: { format: 'jpeg', options: { quality: 95 } },
    imageSizes: [
      { name: 'thumb', width: 400, height: 500, fit: 'cover' },
      { name: 'card', width: 800, height: 1000, fit: 'cover' },
      { name: 'detail', width: 1600, height: 1600, fit: 'inside' },
      { name: 'zoom', width: 2400, height: 2400, fit: 'inside' },
    ],
  },
}
