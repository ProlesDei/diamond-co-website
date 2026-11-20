import styles from './Commissions.module.css'
import { type Metal, metalLooks } from './metals'

export function MetalSwatch({ metal }: { metal: Metal }) {
  return (
    <span
      className={styles.dot}
      style={{ background: metalLooks[metal].colour }}
      aria-hidden="true"
    />
  )
}
