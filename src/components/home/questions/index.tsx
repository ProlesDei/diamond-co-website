import type { ReactNode } from 'react'

import styles from './Questions.module.css'

function Confirm() {
  return <span className={styles.confirm}>[confirm]</span>
}

type Question = {
  question: string
  answer: ReactNode
}

const questions: Question[] = [
  {
    question: 'Will it still be my stone?',
    answer: (
      <>
        Yes. Your stone never leaves our bench. We photograph and measure it with you before work
        starts, and you keep the record <Confirm />.
      </>
    ),
  },
  {
    question: 'How do I know it will be what I asked for?',
    answer: (
      <>
        The Render-First Promise: you approve a drawing and a render before any metal is cut. [N]
        rounds of changes are included <Confirm />.
      </>
    ),
  },
  {
    question: 'What if I don’t like the design?',
    answer: (
      <>
        We redraw it. If it still isn&rsquo;t right, you can walk away owing [nothing / only the
        $[X] design deposit] <Confirm />.
      </>
    ),
  },
  {
    question: 'How long will it take?',
    answer: (
      <>
        About [X] weeks from first sit-down to your hand <Confirm />. Planning a proposal? Tell us
        the date and we&rsquo;ll say honestly whether we can make it.
      </>
    ),
  },
  {
    question: 'Will I be pushed to go ahead?',
    answer: (
      <>
        No. The consultation is free and there&rsquo;s no obligation <Confirm />. Nothing is
        booked or charged until you agree.
      </>
    ),
  },
]

export function Questions() {
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
          {questions.map(({ question, answer }, index) => (
            <details className={styles.item} key={question} open={index === 0}>
              <summary className={styles.summary}>{question}</summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
