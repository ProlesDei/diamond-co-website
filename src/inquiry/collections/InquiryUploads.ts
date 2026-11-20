import path from 'path'
import { APIError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { adminOnly, nobody, signedIn } from './access'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const staticDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.data/inquiry-uploads')

const limitSize: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation !== 'create' || !req.file) return data
  const bytes = req.file.data.length > 0 ? req.file.data.length : req.file.size
  if (bytes > MAX_UPLOAD_BYTES) {
    throw new APIError(
      `The file is ${bytes} bytes, over the ${MAX_UPLOAD_BYTES}-byte (10 MB) limit. Send a smaller file.`,
      413,
      null,
      true,
    )
  }
  return data
}

export const InquiryUploads: CollectionConfig = {
  slug: 'inquiry-uploads',
  labels: { singular: 'Inquiry upload', plural: 'Inquiry uploads' },
  access: {
    create: nobody,
    read: signedIn,
    update: nobody,
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [limitSize],
  },
  fields: [{ name: 'id', type: 'text', required: true }],
  upload: {
    staticDir,
    mimeTypes: ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'],
    crop: false,
    focalPoint: false,
  },
}
