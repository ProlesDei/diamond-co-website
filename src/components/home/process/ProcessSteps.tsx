import type { ReactNode } from 'react'

import styles from './Process.module.css'

export function Confirm() {
  return <span className={styles.confirm}>[confirm]</span>
}

export type Step = {
  name: string
  time: ReactNode
  text: ReactNode
}

type ProcessStepsProps = {
  steps: Step[]
  layout?: 'columns' | 'rows'
}

export function ProcessSteps({ steps, layout = 'columns' }: ProcessStepsProps) {
  return (
    <ol className={layout === 'rows' ? `${styles.steps} ${styles.rows}` : styles.steps} role="list">
      {steps.map((step) => (
        <li className={styles.step} key={step.name}>
          <h3 className={styles.stepName}>{step.name}</h3>
          <p className={styles.time}>{step.time}</p>
          <p className={styles.stepText}>{step.text}</p>
        </li>
      ))}
    </ol>
  )
}
