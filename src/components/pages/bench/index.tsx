import Image from 'next/image'

import { Hinge } from '@/components/home/bench/Hinge'
import { type Metal, metalLooks } from '@/components/home/commissions/metals'
import { MetalSwatch } from '@/components/home/commissions/MetalSwatch'
import {
  Confirm as StepConfirm,
  ProcessSteps,
  type Step,
} from '@/components/home/process/ProcessSteps'
import { getGoldsmithProfile } from '@/lib/content'

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
    time: '15–30 minutes online, free',
    text: 'Share a sketch or a photo, or tell the goldsmith about a stone you want to reuse. You leave with a sketch, a firm quote and a timeline.',
  },
  {
    name: 'Design',
    time: 'Render in 1–4 days',
    text: (
      <>
        We draw it by hand, then render it so you can see it from every side. The timing depends
        on how complex the piece is. You approve the render before we cut any metal. We include
        [N] rounds of changes <StepConfirm />.
      </>
    ),
  },
  {
    name: 'Craft',
    time: 'About 1–2 weeks at the bench',
    text: (
      <>
        We make your piece by hand at our bench, in 14k to 24k gold <StepConfirm />. Your stone
        stays at the bench. We photograph and measure it with you before work starts{' '}
        <StepConfirm />.
      </>
    ),
  },
  {
    name: 'Delivered',
    time: 'Three ways to get your ring',
    text: (
      <>
        Choose insured shipping, studio pickup by appointment, or a private handover appointment.
        We share the studio address after you book your pickup. We include care advice for your
        piece. Contact us to arrange a cleaning <StepConfirm />.
      </>
    ),
  },
]

export default async function BenchPage() {
  const { name, credential, portrait } = await getGoldsmithProfile()

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
              Share a sketch or a photo, or tell us about a stone you want to reuse. We draw the
              piece with you online, then make it by hand in the metal you choose.
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
              <Confirm />. The goldsmith you meet online makes your piece
              <Confirm />.
            </p>
          </div>
          <ul className={styles.smiths} role="list">
            <li>
              {portrait && (
                <div className={styles.frame}>
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    fill
                    sizes="(max-width: 899px) 45vw, 25vw"
                    className={styles.photo}
                  />
                </div>
              )}
              <h3 className={styles.smithName}>{name ?? 'Goldsmith'}</h3>
              {credential && <p className={styles.role}>{credential}</p>}
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
          About 2–4 weeks in all. Planning a proposal? Put the date in the form.
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
            Talk with <em>a goldsmith.</em>
          </>
        }
      >
        Book a free online consultation. It takes 15–30 minutes. Share a sketch or photo, or tell
        us about a stone you want to reuse. You leave with a sketch, a firm quote and a timeline.
      </ConsultationBand>
    </>
  )
}
