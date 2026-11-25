import type { GroupField } from 'payload'

import { faqPageDefaults, faqTopicDefaults } from '../components/pages/faq/defaults'

export const faqPage: GroupField = {
  name: 'faqPage',
  label: 'FAQ page',
  type: 'group',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { placeholder: faqPageDefaults.heading, description: 'Leave both heading parts blank to use the placeholder text.' },
    },
    {
      name: 'headingItalic',
      label: 'Heading, italic part',
      type: 'text',
      admin: { placeholder: faqPageDefaults.headingItalic, description: 'Shown in italics after the heading.' },
    },
    {
      name: 'lede',
      label: 'Introduction',
      type: 'textarea',
      admin: { placeholder: faqPageDefaults.lede, description: 'Leave blank to use the placeholder text.' },
    },
    {
      name: 'topics',
      type: 'array',
      labels: { singular: 'Topic', plural: 'Topics' },
      admin: {
        description: 'Drag topics and questions into display order. Only published questions show, and a topic with none is hidden. Until you add topics, the FAQ page keeps showing the earlier selection (or the built-in questions if there is none).',
        components: { RowLabel: '/components/admin/TopicRowLabel#TopicRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'questions',
          type: 'array',
          labels: { singular: 'Question', plural: 'Questions' },
          fields: [
            { name: 'faq', label: 'FAQ', type: 'relationship', relationTo: 'faqs', required: true },
            {
              name: 'questionLabel',
              type: 'text',
              admin: { description: 'Optional. Leave blank to use the question from the FAQ record.' },
            },
          ],
        },
      ],
    },
    // The earlier selection, hidden and read-only, so no save (a stale form included) can change it.
    // The FAQ page shows it until topics hold a published question, and an earlier build still
    // reads it after a rollback.
    {
      name: 'usePublishedQuestions',
      type: 'checkbox',
      access: { update: () => false },
      admin: { hidden: true },
    },
    {
      name: 'questions',
      type: 'array',
      access: { update: () => false },
      admin: { hidden: true },
      fields: [
        {
          name: 'topic',
          type: 'select',
          required: true,
          options: faqTopicDefaults.map(({ id, title }) => ({ label: title, value: id })),
        },
        { name: 'faq', label: 'FAQ', type: 'relationship', relationTo: 'faqs', required: true },
        { name: 'questionLabel', type: 'text' },
      ],
    },
  ],
}
