import styles from './Process.module.css'
import { ProcessSteps, type Step } from './ProcessSteps'

const steps: Step[] = [
  {
    name: 'Consult',
    time: '15–30 minutes online, free',
    text: 'You leave with a sketch, a firm quote and a timeline.',
  },
  {
    name: 'Design',
    time: 'Render in 1–4 days',
    text: 'The timing depends on how complex the piece is. You approve the sketches and render before we cut any metal.',
  },
  {
    name: 'Craft',
    time: 'About 1–2 weeks',
    text: 'Made in 14k to 24k gold.',
  },
  {
    name: 'Delivered',
    time: 'Three ways to get your ring',
    text: 'Choose insured shipping, studio pickup by appointment, or a private handover appointment. We share the studio address after you book your pickup. We include care advice for your piece.',
  },
]

export function Process() {
  return (
    <section id="process" className={styles.section} aria-labelledby="process-heading">
      <p className={styles.eyebrow}>How a commission works</p>
      <h2 className={styles.heading} id="process-heading">
        From a conversation <em>to your hand.</em>
      </h2>
      <p className={styles.lede}>
        About 2–4 weeks in all.
      </p>
      <ProcessSteps steps={steps} />
      <div className={styles.worries}>
        <div className={styles.worry}>
          <h3 className={styles.worryName}>What it costs</h3>
          <p className={styles.worryText}>
            Engagement rings from $2,000, with a firm quote at your consultation, before you commit.
          </p>
        </div>
        <div className={styles.worry}>
          <h3 className={styles.worryName}>Their ring size</h3>
          <p className={styles.worryText}>
            Don&rsquo;t know it? Most people don&rsquo;t. We&rsquo;ll help you find it without
            spoiling the surprise.
          </p>
        </div>
      </div>
    </section>
  )
}
