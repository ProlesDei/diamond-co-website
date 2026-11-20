import { Hinge } from '@/components/home/bench/Hinge'
import { type Metal, metalLooks } from '@/components/home/commissions/metals'
import { MetalSwatch } from '@/components/home/commissions/MetalSwatch'
import {
  Confirm as StepConfirm,
  ProcessSteps,
  type Step,
} from '@/components/home/process/ProcessSteps'

import { Confirm } from '../Confirm'
import { ConsultationBand } from '../ConsultationBand'
import { pageMetadata } from '../metadata'
import styles from './Bench.module.css'

export function generateMetadata() {
  return pageMetadata('The Bench')
}

const metals: Metal[] = [
  '14k-yellow-gold',
  '18k-yellow-gold',
  '22k-yellow-gold',
  '24k-yellow-gold',
  'rose-gold',
  'white-gold',
  'platinum',
]

const steps: Step[] = [
  {
    name: 'Consult',
    time: (
      <>
        30 minutes <StepConfirm />
      </>
    ),
    text: 'A free consultation with the goldsmith who will make your piece. Bring a sketch, a photo, or the stone you want to reuse. You leave with a sketch, a price range and a timeline.',
  },
  {
    name: 'Design',
    time: (
      <>
        Render in [X] days <StepConfirm />
      </>
    ),
    text: (
      <>
        We draw it by hand, then render it so you can see it from every side. You approve the render
        before any metal is cut, and [N] rounds of changes are included <StepConfirm />.
      </>
    ),
  },
  {
    name: 'Craft',
    time: (
      <>
        [X] weeks at the bench <StepConfirm />
      </>
    ),
    text: (
      <>
        Made by hand at our bench in White Rock, in 14k to 24k gold <StepConfirm />. Your stone
        never leaves the bench; we photograph and measure it with you before work starts{' '}
        <StepConfirm />.
      </>
    ),
  },
  {
    name: 'Collect',
    time: 'In White Rock',
    text: (
      <>
        Fitted in person, with care advice for the life of the piece and a cleaning whenever
        you&rsquo;re passing <StepConfirm />.
      </>
    ),
  },
]

export default function BenchPage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="bench-title">
        <div className={styles.hinge}>
          <div>
            <p className={styles.eyebrow}>The Bench</p>
            <h1 className={styles.title} id="bench-title">
              Your idea, <em>our bench.</em>
            </h1>
            <p className={styles.lede}>
              Bring a sketch, a photo or a stone of your own. We draw it with you across the table,
              then make it here, by hand, in the metal you choose.
            </p>
          </div>
          <Hinge large />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="goldsmiths-heading">
        <div className={styles.goldsmiths}>
          <div>
            <p className={styles.eyebrow}>The goldsmiths</p>
            <h2 className={styles.heading} id="goldsmiths-heading">
              The hands <em>that make it.</em>
            </h2>
            <p className={styles.lede}>
              More than 35 years at the bench
              <Confirm />. The person you sit down with is the one who makes your piece
              <Confirm />.
            </p>
          </div>
          <ul className={styles.smiths} role="list">
            <li>
              <div className={styles.frame}>
                <p className={styles.placeholder}>
                  Placeholder: portrait of [NAME] at the bench, from the client
                </p>
              </div>
              <h3 className={styles.smithName}>
                [NAME]
                <Confirm note="client supplies" />
              </h3>
              <p className={styles.role}>
                Master goldsmith. [Training, guild or years at the bench]
                <Confirm note="client supplies" />
              </p>
            </li>
            <li>
              <div className={styles.frame}>
                <p className={styles.placeholder}>Placeholder: portrait of [NAME], from the client</p>
              </div>
              <h3 className={styles.smithName}>
                [NAME]
                <Confirm note="client supplies" />
              </h3>
              <p className={styles.role}>
                [Role, for example stone setter]
                <Confirm note="client supplies" />
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="made-heading">
        <p className={styles.eyebrow}>How a piece is made</p>
        <h2 className={styles.heading} id="made-heading">
          From a conversation <em>to your hand.</em>
        </h2>
        <p className={styles.lede}>
          About [X] weeks from first sit-down to your hand <StepConfirm />. One bench, so we take [N]
          commissions a month <StepConfirm />.
        </p>
        <ProcessSteps steps={steps} layout="rows" />
        <ul className={styles.metals} aria-label="Metals we work in">
          {metals.map((metal) => (
            <li key={metal}>
              <MetalSwatch metal={metal} />
              {metalLooks[metal].label}
              {metal === 'platinum' ? <Confirm /> : null}
            </li>
          ))}
        </ul>
      </section>

      <ConsultationBand
        heading={
          <>
            Sit down with <em>a goldsmith.</em>
          </>
        }
      >
        Private consultations in White Rock, by appointment. Bring a sketch, a photo or a stone of
        your own. Thirty minutes, free, and you leave with a sketch, a price range and a timeline.
        <Confirm />
      </ConsultationBand>
    </>
  )
}
