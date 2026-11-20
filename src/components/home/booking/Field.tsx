import type { ReactNode } from 'react'

import styles from './booking.module.css'

type ControlProps = {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': true | undefined
}

type FieldProps = {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  control: (props: ControlProps) => ReactNode
}

export function Field({ id, label, optional, hint, error, control }: FieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className={error ? `${styles.field} ${styles.fieldError}` : styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {hint && (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      )}
      {control({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {error && (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      )}
    </div>
  )
}
