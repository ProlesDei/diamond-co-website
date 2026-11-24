import { getHomeQuestions } from '@/lib/content'

import { homeQuestionDefaults } from './defaults'
import { FaqAnswer } from './FaqAnswer'
import styles from './Questions.module.css'

export async function Questions() {
  const selected = await getHomeQuestions()
  const questions = selected?.map(({ id, question, answer }) => ({
    id,
    question,
    answer: <FaqAnswer answer={answer} />,
  })) ?? homeQuestionDefaults.map(({ key, question, answer }) => ({
    id: key,
    question,
    answer: <p>{answer}</p>,
  }))

  if (!questions.length) return null

  return (
    <section id="questions" className={styles.section} aria-labelledby="questions-heading">
      <div className={styles.layout}>
        <div>
          <p className={styles.eyebrow}>Before you trust us with it</p>
          <h2 className={styles.heading} id="questions-heading">
            Fair questions, <em>plain answers.</em>
          </h2>
        </div>
        <div className={styles.list}>
          {questions.map(({ id, question, answer }, index) => (
            <details className={styles.item} key={id} open={index === 0}>
              <summary className={styles.summary}>{question}</summary>
              <div className={styles.answer}>{answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
