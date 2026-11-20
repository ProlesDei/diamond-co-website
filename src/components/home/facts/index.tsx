import { Confirm } from '@/components/pages/Confirm'

import styles from './Facts.module.css'

export function Facts() {
  return (
    <section id="facts" className={styles.facts} aria-label="At a glance">
      <ul className={styles.list}>
        <li>
          More than 35 years at the bench
          <Confirm />
        </li>
        <li>
          <b>The Render-First Promise:</b> approve the render before any metal is cut
          <Confirm />
        </li>
        <li>Designed with you, in White Rock</li>
      </ul>
    </section>
  )
}
