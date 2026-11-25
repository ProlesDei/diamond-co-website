import { FaqAnswer, FaqConfirmText } from '@/components/home/questions/FaqAnswer'
import { getFaqPageQuestions } from '@/lib/content'

import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import { faqTopicDefaults } from './defaults'
import styles from './Faq.module.css'

export function generateMetadata() {
  return pageMetadata('Questions')
}

export default async function FaqPage() {
  const selection = await getFaqPageQuestions()
  const topics = faqTopicDefaults.map(({ id, title, questions }) => ({
    id,
    title,
    questions: selection === null
      ? questions.map(({ key, question, answer }) => ({
          key,
          question,
          answer: <FaqConfirmText text={answer} />,
        }))
      : selection.filter((row) => row.topic === id).map(({ answer, ...row }) => ({
          ...row,
          answer: <FaqAnswer answer={answer} showConfirmMarkers />,
        })),
  }))

  return (
    <>
      <PageHead
        eyebrow="Questions"
        title={
          <>
            Fair questions, <em>plain answers.</em>
          </>
        }
        lede="If yours isn't here, ask it in the form or call us. We'd rather you asked."
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
        Ask the goldsmith who would make your piece during a free online consultation. It takes
        15–30 minutes.
      </ConsultationBand>
    </>
  )
}
