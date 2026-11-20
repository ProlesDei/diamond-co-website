import type { ReactNode } from 'react'

import styles from './Button.module.css'
import { PageLink } from './PageLink'

type Variant = 'primary' | 'secondary' | 'inverse'

type ButtonProps = {
  variant: Variant
  children: ReactNode
  id?: string
  className?: string
  onClick?: () => void
} & ({ href: string } | { type: 'button' | 'submit' })

export function Button(props: ButtonProps) {
  const className = [styles.button, styles[props.variant], props.className]
    .filter(Boolean)
    .join(' ')

  if ('href' in props) {
    return (
      <PageLink id={props.id} className={className} href={props.href} onClick={props.onClick}>
        {props.children}
      </PageLink>
    )
  }

  return (
    <button id={props.id} className={className} type={props.type} onClick={props.onClick}>
      {props.children}
    </button>
  )
}
