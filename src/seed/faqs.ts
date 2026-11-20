import type { Payload } from 'payload'

import { seedContext } from './context'
import { paragraphs } from './richText'

// The same questions as the FAQ page; each fact the client must give is marked [confirm].
const sampleFaqs: { question: string; answer: string[] }[] = [
  {
    question: 'Is the consultation really free?',
    answer: [
      'Yes. Thirty minutes, no charge and no obligation [confirm]. Nothing is booked or charged until you agree.',
    ],
  },
  {
    question: 'What should I bring?',
    answer: [
      'Anything that helps: a sketch, screenshots, a ring you like the feel of, or the stone you want to reuse. If you have nothing yet, come anyway.',
    ],
  },
  {
    question: 'What does a custom ring cost?',
    answer: [
      'Engagement rings start from $[X] [confirm]. The price depends mostly on the stone and the metal. You get a firm quote at your consultation, before you commit.',
    ],
  },
  {
    question: 'How long does it take?',
    answer: [
      'About [X] weeks from first sit-down to your hand [confirm].',
      'Planning a proposal? Tell us the date in the form and we’ll say honestly whether we can make it.',
    ],
  },
  {
    question: 'Natural or lab-grown diamonds?',
    answer: [
      'Both [confirm]. We’ll show you each side by side and explain the difference in price plainly.',
    ],
  },
  {
    question: 'What if it doesn’t fit?',
    answer: ['We resize your piece free in the first [X] months [confirm].'],
  },
]

export const seedFaqs = async (payload: Payload): Promise<string[]> => {
  const added: string[] = []
  for (const [index, faq] of sampleFaqs.entries()) {
    const { totalDocs } = await payload.count({
      collection: 'faqs',
      where: { question: { equals: faq.question } },
      overrideAccess: true,
    })
    if (totalDocs > 0) continue

    await payload.create({
      collection: 'faqs',
      data: {
        question: faq.question,
        answer: paragraphs(...faq.answer),
        order: (index + 1) * 10,
        _status: 'published',
      },
      overrideAccess: true,
      context: seedContext,
    })
    added.push(faq.question)
  }
  return added
}
