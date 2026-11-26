import type { ReactNode } from 'react'

import { FaqAnswer } from '@/components/home/questions/FaqAnswer'
import { getFaqPage } from '@/lib/content'

import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import { faqPageDefaults, faqTopicDefaults } from './defaults'
import styles from './Faq.module.css'

export function generateMetadata() {
  return pageMetadata('Questions')
}

type Topic = {
  id: string
  title: string
  questions: { key: string; question: string; answer: ReactNode }[]
}

// A topic titled like a built-in topic keeps that topic's anchor, so earlier links still work.
const builtInAnchors = new Map<string, string>(faqTopicDefaults.map(({ id, title }) => [title.toLowerCase(), id]))

const anchorsFor = (titles: string[]): string[] => {
  const used = new Set<string>()
  return titles.map((title) => {
    const base = builtInAnchors.get(title.toLowerCase())
      ?? `q-${title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'topic'}`
    let anchor = base
    for (let n = 2; used.has(anchor); n += 1) anchor = `${base}-${n}`
    used.add(anchor)
    return anchor
  })
}

const defaultTopics = (): Topic[] =>
  faqTopicDefaults.map(({ id, title, questions }) => ({
    id,
    title,
    questions: questions.map(({ key, question, answer }) => ({ key, question, answer: <p>{answer}</p> })),
  }))

export default async function FaqPage() {
  const page = await getFaqPage()
  const anchors = anchorsFor(page.topics.map(({ title }) => title))
  const topics: Topic[] = page.topics.length === 0
    ? defaultTopics()
    : page.topics.map(({ title, questions }, index) => ({
        id: anchors[index],
        title,
        questions: questions.map(({ key, question, answer }) => ({
          key,
          question,
          answer: <FaqAnswer answer={answer} />,
        })),
      }))
  const heading = page.heading || page.headingItalic
    ? { plain: page.heading, italic: page.headingItalic }
    : { plain: faqPageDefaults.heading, italic: faqPageDefaults.headingItalic }

  return (
    <>
      <PageHead
        eyebrow="Questions"
        title={
          <>
            {heading.plain}
            {heading.plain && heading.italic && ' '}
            {heading.italic && <em>{heading.italic}</em>}
          </>
        }
        lede={page.lede ?? faqPageDefaults.lede}
      />
      <div className={styles.layout}>
        <nav className={styles.topics} aria-label="Topics">
          {topics.map(({ id, title }) => (
            <a href={`#${id}`} key={id}>
              {title}
            </a>
          ))}
        </nav>
        <div>
          {topics.map(({ id, title, questions }, topicIndex) => (
            <section className={styles.group} key={id} aria-labelledby={id}>
              <h2 className={styles.heading} id={id}>
                {title}
              </h2>
              <div className={styles.list}>
                {questions.map(({ key, question, answer }, questionIndex) => (
                  <details className={styles.item} key={key} open={topicIndex === 0 && questionIndex === 0}>
                    <summary className={styles.summary}>{question}</summary>
                    <div className={styles.answer}>{answer}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <ConsultationBand
        heading={
          <>
            Still <em>wondering?</em>
          </>
        }
      >
        Ask us during a free online consultation. It takes 15–30 minutes.
      </ConsultationBand>
    </>
  )
}
