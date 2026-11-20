import type { ReactNode } from 'react'

import styles from './PageHead.module.css'

type PageHeadProps = {
  eyebrow: ReactNode
  title: ReactNode
  lede?: ReactNode
  aside?: ReactNode
}

export function PageHead({ eyebrow, title, lede, aside }: PageHeadProps) {
  const text = (
    <div>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {lede && <p className={styles.lede}>{lede}</p>}
    </div>
  )

  return (
    <div className={styles.head}>
      {aside ? (
        <div className={styles.row}>
          {text}
          <div className={styles.aside}>{aside}</div>
        </div>
      ) : (
        text
      )}
    </div>
  )
}
