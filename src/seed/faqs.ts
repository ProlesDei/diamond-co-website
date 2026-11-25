import type { Payload } from 'payload'

import type { SiteSetting } from '../payload-types'

import { homeQuestionDefaults } from '../components/home/questions/defaults'
import { faqPageDefaults, faqTopicDefaults } from '../components/pages/faq/defaults'
import { seedContext } from './context'
import { paragraphs } from './richText'

type FaqSample = { key: string; question: string; answer: string }

const pageSamples = faqTopicDefaults.flatMap(({ questions }): FaqSample[] => [...questions])
const pageAnswers = new Map(pageSamples.map(({ key, answer }) => [key, answer]))
// A key on both pages gets one FAQ: the home page's question, with the FAQ page's answer,
// which carries no [confirm] marker.
const samplesByKey = new Map<string, FaqSample>(
  [...pageSamples, ...homeQuestionDefaults].map((sample) => [
    sample.key,
    { ...sample, answer: pageAnswers.get(sample.key) ?? sample.answer },
  ]),
)
const sampleFaqs = [...samplesByKey.values()]

export const hasNonSampleFaqs = async (payload: Payload): Promise<boolean> => {
  const { totalDocs } = await payload.count({
    collection: 'faqs',
    where: { sampleKey: { not_in: sampleFaqs.map(({ key }) => key) } },
    overrideAccess: true,
  })
  return totalDocs > 0
}

const findSampleFaq = async (payload: Payload, key: string) => {
  const { docs } = await payload.find({
    collection: 'faqs',
    where: { sampleKey: { equals: key } },
    depth: 0,
    limit: 1,
    select: {},
    overrideAccess: true,
  })
  return docs[0]
}

const requireSampleFaqId = async (payload: Payload, sample: { key: string; question: string }) => {
  const faq = await findSampleFaq(payload, sample.key)
  if (!faq) throw new Error(`Missing sample FAQ: ${sample.question}`)
  return faq.id
}

export const homeFaqSeedIds = (payload: Payload) =>
  Promise.all(homeQuestionDefaults.map((sample) => requireSampleFaqId(payload, sample)))

export const faqPageSeedSettings = async (payload: Payload): Promise<SiteSetting['faqPage']> => ({
  ...faqPageDefaults,
  topics: await Promise.all(faqTopicDefaults.map(async ({ title, questions }) => ({
    title,
    questions: await Promise.all(questions.map(async (sample) => ({
      faq: await requireSampleFaqId(payload, sample),
      questionLabel: sample.question === samplesByKey.get(sample.key)?.question ? undefined : sample.question,
    }))),
  }))),
})

export const seedFaqs = async (payload: Payload): Promise<string[]> => {
  const added: string[] = []
  for (const [index, faq] of sampleFaqs.entries()) {
    if (await findSampleFaq(payload, faq.key)) continue

    await payload.create({
      collection: 'faqs',
      data: {
        sampleKey: faq.key,
        question: faq.question,
        answer: paragraphs(faq.answer),
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
