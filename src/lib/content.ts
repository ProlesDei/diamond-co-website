import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Faq, Media } from '@/payload-types'

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
    team: goldsmith?.team ?? [],
  }
}

export const getGoldsmithName = async () => (await getGoldsmithSettings()).name

const canShow = ({ source }: Pick<Media, 'source'>) =>
  source === 'client-photo' || (source === 'placeholder' && process.env.SITE_ENV !== 'production')

const findPortraits = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, { src: string; alt: string }>()

  // Media can change independently of Site Settings.
  await connection()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'media',
    where: { id: { in: ids } },
    depth: 0,
    overrideAccess: false,
    pagination: false,
  })
  return new Map(docs.filter(canShow).flatMap((media) => {
    const src = media.sizes?.card?.url || media.url
    return src ? [[media.id, { src, alt: media.alt }] as const] : []
  }))
}

const idOf = (value: string | Media | null | undefined) => (typeof value === 'string' ? value : null)

export const getGoldsmithProfile = cache(async () => {
  const { name, credential, portraitId, team } = await getGoldsmithSettings()
  const ids = [portraitId, ...team.map(({ portrait }) => portrait)].map(idOf).filter((id) => id !== null)
  const portraits = await findPortraits([...new Set(ids)])
  const portraitFor = (value: string | Media | null | undefined) => portraits.get(idOf(value) ?? '') ?? null

  return {
    name,
    credential,
    portrait: portraitFor(portraitId),
    team: team.flatMap(({ id, name: memberName, role, portrait }, index) => {
      const trimmed = memberName.trim()
      if (!trimmed) return []
      return [{ key: id ?? String(index), name: trimmed, role: role?.trim() || null, portrait: portraitFor(portrait) }]
    }),
  }
})

export const getSiteLogo = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const { logo } = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      overrideAccess: false,
      select: { logo: true },
    })
    if (!logo || typeof logo !== 'object' || !canShow(logo)) return null
    const src = logo.sizes?.detail?.url || logo.url
    return src ? { src, alt: logo.alt } : null
  },
  ['site-logo'],
  { tags: ['site-settings'] },
)

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

export const getFaqPage = async () => {
  // Linked FAQs can be published or unpublished without a Site Settings save.
  await connection()
  const { faqPage } = await getSiteSettings()
  const topicRows = faqPage?.topics ?? []
  const ids = topicRows.flatMap(({ questions }) => (questions ?? []).map(({ faq }) => faq))
    .filter((id) => typeof id === 'string')
  const byId = await findPublishedFaqs([...new Set(ids)])

  const topics = topicRows.flatMap(({ title, questions }, topicIndex) => {
    const rows = (questions ?? []).flatMap(({ id: rowId, faq, questionLabel }, index) => {
      const record = typeof faq === 'string' ? byId.get(faq) : undefined
      if (!record) return []
      return [{
        key: rowId ?? `${topicIndex}-${index}`,
        question: questionLabel?.trim() || record.question,
        answer: record.answer,
      }]
    })
    return rows.length > 0 ? [{ title: title.trim(), questions: rows }] : []
  })

  return {
    heading: faqPage?.heading?.trim() || null,
    headingItalic: faqPage?.headingItalic?.trim() || null,
    lede: faqPage?.lede?.trim() || null,
    topics,
  }
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
