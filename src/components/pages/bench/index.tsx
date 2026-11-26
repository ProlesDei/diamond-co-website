import Image from 'next/image'

import { Hinge } from '@/components/home/bench/Hinge'
import { type Metal, metalLooks } from '@/components/home/commissions/metals'
import { MetalSwatch } from '@/components/home/commissions/MetalSwatch'
import { ProcessSteps, type Step } from '@/components/home/process/ProcessSteps'
import { getGoldsmithProfile } from '@/lib/content'

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
    text: 'Share a sketch or a photo, or tell us about a stone you want to reuse. You leave with a sketch, a firm quote and a timeline.',
  },
  {
    name: 'Design',
    time: 'Render in 1–4 days',
    text: 'We draw it by hand, then render it so you can see it from every side. The timing depends on how complex the piece is. You can ask for changes, and you approve the render before any metal is cut.',
  },
  {
    name: 'Craft',
    time: 'About 1–2 weeks',
    text: 'Made in 14k to 24k gold. We photograph and measure your stone with you before work starts.',
  },
  {
    name: 'Delivered',
    time: 'Three ways to get your ring',
    text: 'Choose insured shipping, studio pickup by appointment, or a private handover appointment. We share the studio address after you book your pickup. We include care advice for your piece. Contact us to arrange a cleaning.',
  },
]

export default async function BenchPage() {
  const { name, credential, portrait, team } = await getGoldsmithProfile()
  const goldsmiths = [{ key: 'primary', name: name ?? 'Designer', role: credential, portrait }, ...team]

  return (
    <>
      <section className={styles.hero} aria-labelledby="bench-title">
        <div className={styles.hinge}>
          <div>
            <p className={styles.eyebrow}>The Bench</p>
            <h1 className={styles.title} id="bench-title">
              Start with <em>your idea.</em>
            </h1>
            <p className={styles.lede}>
              Share a sketch or a photo, or tell us about a stone you want to reuse. We draw the
              piece with you online, in the metal you choose.
            </p>
          </div>
          <Hinge large />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="goldsmiths-heading">
        <div className={styles.goldsmiths}>
          <div>
            <p className={styles.eyebrow}>The team</p>
            <h2 className={styles.heading} id="goldsmiths-heading">
              Who you <em>work with.</em>
            </h2>
          </div>
          <ul className={styles.smiths} role="list">
            {goldsmiths.map(({ key, name: smithName, role, portrait: photo }) => (
              <li key={key}>
                {photo && (
                  <div className={styles.frame}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 899px) 45vw, 25vw"
                      className={styles.photo}
                    />
                  </div>
                )}
                <h3 className={styles.smithName}>{smithName}</h3>
                {role && <p className={styles.role}>{role}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="made-heading">
        <p className={styles.eyebrow}>How a piece is made</p>
        <h2 className={styles.heading} id="made-heading">
          From a conversation <em>to your hand.</em>
        </h2>
        <p className={styles.lede}>
          About 2–4 weeks in all.
        </p>
        <ProcessSteps steps={steps} layout="rows" />
        <ul className={styles.metals} aria-label="Metals we work in">
          {metals.map((metal) => (
            <li key={metal}>
              <MetalSwatch metal={metal} />
              {metalLooks[metal].label}
            </li>
          ))}
        </ul>
      </section>

      <ConsultationBand
        heading={
          <>
            Talk with <em>us.</em>
          </>
        }
      >
        Book a free online consultation. It takes 15–30 minutes. Share a sketch or photo, or tell
        us about a stone you want to reuse. You leave with a sketch, a firm quote and a timeline.
      </ConsultationBand>
    </>
  )
}
