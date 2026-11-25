import type { FieldHook, GroupField } from 'payload'

import { faqPageDefaults, faqTopicDefaults } from '../components/pages/faq/defaults'

type LegacyRow = { id?: string | null; topic?: string | null; faq?: unknown; questionLabel?: string | null }
type TopicRow = { id?: string | null; title?: string | null; questions?: unknown[] | null }

// Before topics existed, a checkbox switched the page to rows that each named a fixed topic.
// Show that selection as topics until an editor saves topics of their own.
const topicsFromEarlierSelection: FieldHook = ({ value, siblingData }) => {
  if (Array.isArray(value) && value.length > 0) return value
  if (!siblingData?.usePublishedQuestions) return value

  const rows: LegacyRow[] = Array.isArray(siblingData.questions) ? siblingData.questions : []
  return faqTopicDefaults.flatMap(({ id, title }): TopicRow[] => {
    const questions = rows
      .filter((row) => row.topic === id)
      .map(({ id: rowId, faq, questionLabel }) => ({ id: rowId, faq, questionLabel }))
    return questions.length > 0 ? [{ id: `earlier-${id}`, title, questions }] : []
  })
}

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
        description: 'Drag topics and questions into display order. Only published questions show, and a topic with none is hidden. With no published questions at all, the page shows its built-in questions.',
      },
      hooks: { afterRead: [topicsFromEarlierSelection] },
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
    // The earlier selection. Kept so saved data survives; the topics hook above reads it.
    {
      name: 'usePublishedQuestions',
      type: 'checkbox',
      admin: { hidden: true },
    },
    {
      name: 'questions',
      type: 'array',
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
