import styles from './Process.module.css'
import { Confirm, ProcessSteps, type Step } from './ProcessSteps'

const steps: Step[] = [
  {
    name: 'Consult',
    time: (
      <>
        30 minutes <Confirm />
      </>
    ),
    text: 'A free consultation with the goldsmith who will make your piece. You leave with a sketch, a price range and a timeline.',
  },
  {
    name: 'Design',
    time: (
      <>
        Render in [X] days <Confirm />
      </>
    ),
    text: 'Sketches and a render for you to approve before any metal is cut.',
  },
  {
    name: 'Craft',
    time: (
      <>
        [X] weeks at the bench <Confirm />
      </>
    ),
    text: (
      <>
        Made by hand at our bench, in 14k to 24k gold <Confirm />.
      </>
    ),
  },
  {
    name: 'Collect',
    time: 'In White Rock',
    text: 'Fitted in person, with care advice for the life of the piece.',
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
        About [X] weeks from first sit-down to your hand <Confirm />. One bench, so we take [N]
        commissions a month <Confirm />. Planning a proposal? Put the date in the form.
      </p>
      <ProcessSteps steps={steps} />
      <div className={styles.worries}>
        <div className={styles.worry}>
          <h3 className={styles.worryName}>What it costs</h3>
          <p className={styles.worryText}>
            Engagement rings from $[X], with a firm quote at your consultation, before you commit{' '}
            <Confirm />.
          </p>
        </div>
        <div className={styles.worry}>
          <h3 className={styles.worryName}>Their ring size</h3>
          <p className={styles.worryText}>
            Don&rsquo;t know it? Most people don&rsquo;t. We&rsquo;ll help you find it without
            spoiling the surprise <Confirm />.
          </p>
        </div>
      </div>
    </section>
  )
}
