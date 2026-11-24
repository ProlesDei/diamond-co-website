import type { CollectionConfig, PayloadRequest } from 'payload'

import type { Faq } from '../payload-types'

import { publishedOrStaff } from './access'
import { revalidate } from './revalidate'

const revalidateFaqs = ({ doc, req }: { doc: Faq; req: PayloadRequest }) => {
  // Unpublishing after saving a draft can leave both versions marked as drafts.
  revalidate(req, ['faqs'])
  return doc
}

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'order', '_status'],
  },
  access: {
    read: publishedOrStaff,
  },
  defaultSort: 'order',
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [revalidateFaqs],
    afterDelete: [revalidateFaqs],
  },
  fields: [
    { name: 'sampleKey', type: 'text', hidden: true },
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText', required: true },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Lower numbers come first.' },
    },
  ],
}
