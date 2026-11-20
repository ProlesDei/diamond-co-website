import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from './access'
import { revalidateAfterChange, revalidateAfterDelete } from './revalidate'

const faqTags = (): string[] => ['faqs']

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
    afterChange: [revalidateAfterChange(faqTags)],
    afterDelete: [revalidateAfterDelete(faqTags)],
  },
  fields: [
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
