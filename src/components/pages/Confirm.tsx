import styles from './Confirm.module.css'

type ConfirmProps = {
  note?: 'confirm' | 'client supplies'
}

export function Confirm({ note = 'confirm' }: ConfirmProps) {
  return <span className={styles.confirm}>[{note}]</span>
}
