import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { connection } from 'next/server'
import { getPayload } from 'payload'
import { cache } from 'react'

import { faqTopicDefaults } from '@/components/pages/faq/defaults'
import type { Faq, Media, SiteSetting } from '@/payload-types'

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
  },
  // Bump the version when the stored shape changes, so entries cached before a deploy are not read.
  ['site-settings', 'v2'],
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

const findSettingsMedia = unstable_cache(
  async (ids: string[]) => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'media',
      where: { id: { in: ids } },
      depth: 0,
      overrideAccess: false,
      pagination: false,
    })
    return docs
  },
  ['site-settings-media'],
  { tags: ['site-settings'], revalidate: 30 },
)

const findShownMedia = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, Media>()

  const docs = await findSettingsMedia(ids)
  return new Map(docs.filter(canShow).map((media) => [media.id, media]))
}

const imageOf = (media: Media | undefined, size: 'card' | 'detail') => {
  const src = media?.sizes?.[size]?.url || media?.url
  return media && src ? { src, alt: media.alt } : null
}

const idOf = (value: string | Media | null | undefined) => (typeof value === 'string' ? value : null)

export const getGoldsmithProfile = cache(async () => {
  const { name, credential, portraitId, team } = await getGoldsmithSettings()
  const ids = [portraitId, ...team.map(({ portrait }) => portrait)].map(idOf).filter((id) => id !== null)
  const portraits = await findShownMedia([...new Set(ids)])
  const portraitFor = (value: string | Media | null | undefined) => imageOf(portraits.get(idOf(value) ?? ''), 'card')

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

export const getSiteLogo = cache(async () => {
  const id = idOf((await getSiteSettings()).logo)
  if (id === null) return null
  return imageOf((await findShownMedia([id])).get(id), 'detail')
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

type FaqPageSettings = NonNullable<SiteSetting['faqPage']>
type FaqTopicSource = { title: string; questions: { id?: string | null; faq: string | Faq; questionLabel?: string | null }[] }

// Before topics existed, a checkbox switched the page to rows that each named a built-in topic.
const earlierTopics = ({ usePublishedQuestions, questions }: FaqPageSettings): FaqTopicSource[] => {
  if (!usePublishedQuestions) return []
  return faqTopicDefaults.map(({ id, title }) => ({
    title,
    questions: (questions ?? []).filter(({ topic }) => topic === id),
  }))
}

export const getFaqPage = async () => {
  // Linked FAQs can be published or unpublished without a Site Settings save.
  await connection()
  const faqPage = (await getSiteSettings()).faqPage ?? {}
  const saved = (faqPage.topics ?? []).map(({ title, questions }) => ({ title, questions: questions ?? [] }))
  const earlier = earlierTopics(faqPage)
  const ids = [...saved, ...earlier].flatMap(({ questions }) => questions.map(({ faq }) => faq))
    .filter((id) => typeof id === 'string')
  const byId = await findPublishedFaqs([...new Set(ids)])

  const shown = (sources: FaqTopicSource[]) => sources.flatMap(({ title, questions }, topicIndex) => {
    const rows = questions.flatMap(({ id: rowId, faq, questionLabel }, index) => {
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
  // Saved topics win once one of them has a published question; until then the earlier selection shows.
  const savedTopics = shown(saved)

  return {
    heading: faqPage.heading?.trim() || null,
    headingItalic: faqPage.headingItalic?.trim() || null,
    lede: faqPage.lede?.trim() || null,
    topics: savedTopics.length > 0 ? savedTopics : shown(earlier),
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
