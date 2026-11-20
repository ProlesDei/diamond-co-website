import type { CollectionBeforeChangeHook, CollectionConfig, FieldHook } from 'payload'
import { ValidationError } from 'payload'

import type { Media } from '../payload-types'
import { publishedOrStaff } from './access'
import { revalidateAfterChange, revalidateAfterDelete } from './revalidate'

const slugify = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const slugFromTitle: FieldHook = ({ data, value }) =>
  value || (typeof data?.title === 'string' ? slugify(data.title) : value)

const pieceTags = ({ slug }: { slug?: string | null }): string[] =>
  slug ? ['pieces', `piece:${slug}`] : ['pieces']

const checkGallery: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const gallery: (string | Pick<Media, 'id'>)[] = data.gallery ?? originalDoc?.gallery ?? []
  const ids = gallery.map((item) => (typeof item === 'object' ? item.id : item))
  if (ids.length === 0) return data

  const { docs } = await req.payload.find({
    collection: 'media',
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length,
    pagination: false,
    req,
  })
  const sources = new Set(docs.map((media) => media.source))

  const refuse = (message: string): never => {
    throw new ValidationError({
      collection: 'pieces',
      errors: [{ path: 'gallery', message }],
      req,
    })
  }

  if (sources.has('atmosphere')) {
    refuse('The gallery can only hold the client’s own work. Remove the atmosphere (generated) images.')
  }
  const status = data._status ?? originalDoc?._status
  if (process.env.SITE_ENV === 'production' && status === 'published' && sources.has('placeholder')) {
    refuse('The gallery holds placeholder (sample) images. Replace them with client photos before publishing.')
  }
  return data
}

export const Pieces: CollectionConfig = {
  slug: 'pieces',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', '_status'],
  },
  access: {
    read: publishedOrStaff,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [checkGallery],
    afterChange: [revalidateAfterChange(pieceTags)],
    afterDelete: [revalidateAfterDelete(pieceTags)],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Made from the title. It is the web address of the piece.' },
      hooks: { beforeValidate: [slugFromTitle] },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Engagement rings', value: 'engagement-rings' },
        { label: 'Wedding bands', value: 'wedding-bands' },
        { label: 'Necklaces', value: 'necklaces' },
        { label: 'Earrings', value: 'earrings' },
        { label: 'Heirloom redesign', value: 'heirloom-redesign' },
      ],
    },
    {
      name: 'metals',
      type: 'select',
      hasMany: true,
      options: [
        { label: '14k yellow gold', value: '14k-yellow-gold' },
        { label: '18k yellow gold', value: '18k-yellow-gold' },
        { label: '22k yellow gold', value: '22k-yellow-gold' },
        { label: '24k yellow gold', value: '24k-yellow-gold' },
        { label: 'Rose gold', value: 'rose-gold' },
        { label: 'White gold', value: 'white-gold' },
        { label: 'Platinum', value: 'platinum' },
      ],
    },
    {
      name: 'stones',
      type: 'array',
      fields: [
        { name: 'type', type: 'text', required: true },
        {
          name: 'origin',
          type: 'select',
          required: true,
          options: [
            { label: 'Natural', value: 'natural' },
            { label: 'Lab-grown', value: 'lab' },
          ],
        },
        { name: 'carat', type: 'number', min: 0 },
        { name: 'cut', type: 'text' },
        { name: 'colour', type: 'text' },
      ],
    },
    { name: 'setting', type: 'text' },
    { name: 'story', type: 'richText' },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 1,
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'startingFrom',
      label: 'Starting from (CAD)',
      type: 'number',
      min: 0,
    },
  ],
}
