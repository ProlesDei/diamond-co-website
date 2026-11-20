import type { MouseEvent, RefObject } from 'react'

import styles from './book.module.css'

export type SummaryItem = { id: string; label: string }

type ErrorSummaryProps = {
  items: readonly SummaryItem[]
  ref: RefObject<HTMLDivElement | null>
}

const COUNT_WORDS = ['', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things', 'Six things']

function focusField(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const field = document.getElementById(id)
  if (!field) return
  event.preventDefault()
  field.focus()
  field.scrollIntoView({ block: 'center' })
}

export function ErrorSummary({ items, ref }: ErrorSummaryProps) {
  return (
    <div className={styles.summary} role="alert" tabIndex={-1} ref={ref}>
      <p className={styles.summaryHeading}>{COUNT_WORDS[items.length]} to fix before we can send this</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} onClick={(event) => focusField(event, item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
