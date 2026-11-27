import type { CollectionConfig, SelectFieldSingleValidation } from 'payload'
import { select } from 'payload/shared'

import { giveNewUploadAFreeName } from './fileName'
import { mediaJpegOptions, mediaMimeTypes, prepareMediaImage } from './imageFormats'
import { removeReplacedStagingFile, showMediaSaveError, trackStagedUpload } from './saveHooks'

const validateSource: SelectFieldSingleValidation = (value, options) =>
  value ? select(value, options) : 'Choose a Source.'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [trackStagedUpload, prepareMediaImage, giveNewUploadAFreeName],
    afterOperation: [removeReplacedStagingFile],
    afterError: [showMediaSaveError],
  },
  fields: [
    {
      name: 'mediaSaveError',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: { Field: '/media/MediaSaveError#MediaSaveError' },
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      admin: {
        description: 'Choose a Source before saving.',
        components: {
          Error: { path: '/media/MediaSaveError#MediaSaveError', clientProps: { errorPath: 'source' } },
        },
      },
      validate: validateSource,
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
    // prepareMediaImage converts only files sent with the request. Payload fetches a
    // file from a URL after that hook, so a URL upload would skip the JPEG conversion.
    pasteURL: false,
    mimeTypes: mediaMimeTypes,
    formatOptions: { format: 'jpeg', options: mediaJpegOptions },
    imageSizes: [
      { name: 'thumb', width: 400, height: 500, fit: 'cover', formatOptions: { format: 'jpeg' } },
      { name: 'card', width: 800, height: 1000, fit: 'cover', formatOptions: { format: 'jpeg' } },
      { name: 'detail', width: 1600, height: 1600, fit: 'inside', formatOptions: { format: 'jpeg' } },
      { name: 'zoom', width: 2400, height: 2400, fit: 'inside', formatOptions: { format: 'jpeg' } },
    ],
  },
}
