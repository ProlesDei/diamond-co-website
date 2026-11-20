import styles from './book.module.css'

type MarkProps = {
  note: string
}

export function Mark({ note }: MarkProps) {
  return <span className={styles.confirm}>[{note}]</span>
}
