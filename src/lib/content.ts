import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Faq } from '@/payload-types'

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
  },
  ['site-settings'],
  { tags: ['site-settings'] },
)

const getGoldsmithSettings = async () => {
  const { goldsmith } = await getSiteSettings()
  return {
    name: goldsmith?.name?.trim() || null,
    credential: goldsmith?.credential?.trim() || null,
    portraitId: goldsmith?.portrait,
  }
}

export const getGoldsmithName = async () => (await getGoldsmithSettings()).name

export const getGoldsmithProfile = cache(async () => {
  const { name, credential, portraitId } = await getGoldsmithSettings()
  if (typeof portraitId !== 'string') return { name, credential, portrait: null }

  // Media can change independently of Site Settings.
  await connection()
  const payload = await getPayload({ config })
  const media = await payload.findByID({
    collection: 'media',
    id: portraitId,
    depth: 0,
    disableErrors: true,
    overrideAccess: false,
  })
  const allowed = media?.source === 'client-photo'
    || (media?.source === 'placeholder' && process.env.SITE_ENV !== 'production')
  const src = media?.sizes?.card?.url || media?.url
  const portrait = allowed && media && src ? { src, alt: media.alt } : null
  return { name, credential, portrait }
})

const findPublishedFaqs = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, Faq>()

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'faqs',
    where: { id: { in: ids }, _status: { equals: 'published' } },
    draft: false,
    depth: 1,
    overrideAccess: false,
    pagination: false,
    select: { question: true, answer: true },
    populate: { pieces: { slug: true, _status: true } },
  })
  return new Map(docs.map((doc) => [doc.id, doc]))
}

export const getHomeQuestions = async () => {
  const { homeFaqs } = await getSiteSettings()
  if (homeFaqs === undefined) return null

  const ids = [...new Set((homeFaqs ?? []).filter((id) => typeof id === 'string'))]
  // Linked pieces and uploads can change without a FAQ save.
  if (ids.length > 0) await connection()
  const byId = await findPublishedFaqs(ids)
  return ids.map((id) => byId.get(id)).filter((doc) => doc !== undefined)
}

export const getFaqPageQuestions = async () => {
  // The page can switch to published questions after a build with no selection.
  await connection()
  const { faqPage } = await getSiteSettings()
  if (!faqPage?.usePublishedQuestions) return null

  const rows = faqPage.questions ?? []
  const ids = [...new Set(rows.map(({ faq }) => faq).filter((id) => typeof id === 'string'))]
  const byId = await findPublishedFaqs(ids)
  return rows.flatMap(({ id, topic, faq, questionLabel }, index) => {
    const record = typeof faq === 'string' ? byId.get(faq) : undefined
    if (!record) return []
    return [{
      key: id ?? index,
      topic,
      question: questionLabel?.trim() || record.question,
      answer: record.answer,
    }]
  })
}

export const getPublishedPieces = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pieces',
      depth: 0,
      overrideAccess: false,
      pagination: false,
      select: { slug: true, updatedAt: true },
    })
    return docs
  },
  ['pieces'],
  { tags: ['pieces'] },
)
