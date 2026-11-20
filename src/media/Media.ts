import { del, list } from '@vercel/blob'
import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig, PayloadRequest } from 'payload'

import { requireBlobToken } from '@/lib/blob'

import { giveNewUploadAFreeName } from './fileName'

const MINIMUM_LONG_EDGE = 2400

const removeRefusedClientUpload = async (
  req: PayloadRequest,
  data: { _objectKey?: unknown; prefix?: unknown },
  originalDoc: { _objectKey?: unknown } | undefined,
) => {
  const objectKey = data._objectKey
  if (typeof objectKey !== 'string' || !objectKey || objectKey === originalDoc?._objectKey) return

  const token = requireBlobToken('media')
  const { totalDocs } = await req.payload.count({
    collection: 'media',
    where: { _objectKey: { equals: objectKey } },
    req,
  })
  if (totalDocs > 0) return

  const folder = [typeof data.prefix === 'string' ? data.prefix : '', objectKey].filter(Boolean).join('/')
  const { blobs } = await list({ prefix: `${folder}/`, token })
  if (blobs.length > 0) await del(blobs.map((blob) => blob.url), { token })
}

const requireMinimumSize: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (typeof data?.width !== 'number' || typeof data.height !== 'number') return data

  const longEdge = Math.max(data.width, data.height)
  if (longEdge < MINIMUM_LONG_EDGE) {
    await removeRefusedClientUpload(req, data, originalDoc)
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
    beforeOperation: [giveNewUploadAFreeName],
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
