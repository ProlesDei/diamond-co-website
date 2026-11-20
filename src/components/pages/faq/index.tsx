import type { ReactNode } from 'react'

import { Confirm } from '../Confirm'
import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import { PageHead } from '../PageHead'
import styles from './Faq.module.css'

type Question = {
  question: string
  answer: ReactNode
}

type Topic = {
  id: string
  title: string
  questions: Question[]
}

const topics: Topic[] = [
  {
    id: 'q-consult',
    title: 'The consultation',
    questions: [
      {
        question: 'Is the consultation really free?',
        answer: (
          <>
            Yes. Thirty minutes, no charge and no obligation
            <Confirm />. Nothing is booked or charged until you agree.
          </>
        ),
      },
      {
        question: 'What should I bring?',
        answer:
          'Anything that helps: a sketch, screenshots, a ring you like the feel of, or the stone you want to reuse. If you have nothing yet, come anyway.',
      },
      {
        question: 'Can I come without an appointment?',
        answer: (
          <>
            We work by appointment so the goldsmith can sit down with you
            <Confirm />. Send the form or call and we&rsquo;ll find a time that week.
          </>
        ),
      },
    ],
  },
  {
    id: 'q-price',
    title: 'Design and price',
    questions: [
      {
        question: 'What does a custom ring cost?',
        answer: (
          <>
            Engagement rings start from $[X]
            <Confirm />. The price depends mostly on the stone and the metal. You get a firm quote
            at your consultation, before you commit.
          </>
        ),
      },
      {
        question: 'How do I know it will be what I asked for?',
        answer: (
          <>
            The Render-First Promise: you approve a drawing and a render before any metal is cut.
            [N] rounds of changes are included
            <Confirm />.
          </>
        ),
      },
      {
        question: 'What if I don’t like the design?',
        answer: (
          <>
            We redraw it. If it still isn&rsquo;t right, you can walk away owing [nothing / only the
            $[X] design deposit]
            <Confirm />.
          </>
        ),
      },
      {
        question: 'Do you take a deposit?',
        answer: (
          <>
            [Yes, [X]% when you approve the render / No deposit until ...]
            <Confirm />.
          </>
        ),
      },
    ],
  },
  {
    id: 'q-making',
    title: 'Making and timing',
    questions: [
      {
        question: 'How long does it take?',
        answer: (
          <>
            About [X] weeks from first sit-down to your hand
            <Confirm />. Planning a proposal? Tell us the date in the form and we&rsquo;ll say
            honestly whether we can make it.
          </>
        ),
      },
      {
        question: 'Who makes it?',
        answer: (
          <>
            The goldsmith you sit down with, at our bench in White Rock
            <Confirm />. Nothing is sent away to be made.
          </>
        ),
      },
    ],
  },
  {
    id: 'q-stones',
    title: 'Stones and metals',
    questions: [
      {
        question: 'Will it still be my stone?',
        answer: (
          <>
            Yes. Your stone never leaves our bench. We photograph and measure it with you before
            work starts, and you keep the record
            <Confirm />.
          </>
        ),
      },
      {
        question: 'Natural or lab-grown diamonds?',
        answer: (
          <>
            Both
            <Confirm />. We&rsquo;ll show you each side by side and explain the difference in price
            plainly.
          </>
        ),
      },
      {
        question: 'Which metals do you work in?',
        answer: (
          <>
            14k to 24k gold in yellow, white and rose, and platinum
            <Confirm />.
          </>
        ),
      },
    ],
  },
  {
    id: 'q-after',
    title: 'After you collect it',
    questions: [
      {
        question: 'What if it doesn’t fit?',
        answer: (
          <>
            We resize your piece free in the first [X] months
            <Confirm />.
          </>
        ),
      },
      {
        question: 'Do you clean and check pieces?',
        answer: (
          <>
            Yes. Bring it in whenever you&rsquo;re passing and we&rsquo;ll clean it and check the
            setting
            <Confirm />.
          </>
        ),
      },
    ],
  },
]

const openQuestion = topics[0].questions[0].question

export function generateMetadata() {
  return pageMetadata('Questions')
}

export default function FaqPage() {
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
          {topics.map(({ id, title, questions }) => (
            <section className={styles.group} key={id} aria-labelledby={id}>
              <h2 className={styles.heading} id={id}>
                {title}
              </h2>
              <div className={styles.list}>
                {questions.map(({ question, answer }) => (
                  <details className={styles.item} key={question} open={question === openQuestion}>
                    <summary className={styles.summary}>{question}</summary>
                    <p className={styles.answer}>{answer}</p>
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
        Ask it across the table. Thirty minutes in White Rock, free, with the goldsmith who would
        make your piece.
        <Confirm />
      </ConsultationBand>
    </>
  )
}
