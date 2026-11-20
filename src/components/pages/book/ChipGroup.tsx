import type { ReactNode } from 'react'

import styles from './book.module.css'

type ChipOption = { label: string; value: string }

type ChipGroupProps = {
  id: string
  name: string
  legend: ReactNode
  hint?: string
  error?: string
  options: readonly ChipOption[]
  value: string
  onChange: (value: string) => void
}

export function ChipGroup({ id, name, legend, hint, error, options, value, onChange }: ChipGroupProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <fieldset
      className={error ? `${styles.field} ${styles.fieldError}` : styles.field}
      aria-describedby={describedBy || undefined}
    >
      <legend className={styles.label}>{legend}</legend>
      {hint && (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      )}
      <div className={styles.chipRow}>
        {options.map((option, index) => (
          <label className={styles.chip} key={option.value}>
            <input
              type="radio"
              id={index === 0 ? id : undefined}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      )}
    </fieldset>
  )
}
