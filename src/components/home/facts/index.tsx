import styles from './Facts.module.css'

export function Facts() {
  return (
    <section id="facts" className={styles.facts} aria-label="At a glance">
      <ul className={styles.list}>
        <li>More than 35 years at the bench</li>
        <li>
          <b>The Render-First Promise:</b> approve the render before any metal is cut
        </li>
        <li>Designed with you online</li>
      </ul>
    </section>
  )
}
