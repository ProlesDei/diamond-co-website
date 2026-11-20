'use client'

import { useCallback, type ReactNode } from 'react'

import { useReducedMotion } from '@/components/site/useReducedMotion'

import styles from './Hero.module.css'

const DRIFT_PER_PX = 0.3
const MAX_DRIFT = 96

type HeroSectionProps = {
  reduceMotion: boolean
  children: ReactNode
}

export function HeroSection({ reduceMotion, children }: HeroSectionProps) {
  const reduce = useReducedMotion() || reduceMotion

  const drift = useCallback(
    (section: HTMLElement | null) => {
      if (!section || reduce) return
      let frame = 0
      const move = () => {
        frame = 0
        const y = Math.min(Math.max(window.scrollY * DRIFT_PER_PX, 0), MAX_DRIFT)
        section.style.setProperty('--py', `${y.toFixed(1)}px`)
      }
      const onScroll = () => {
        frame ||= requestAnimationFrame(move)
      }
      move()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        cancelAnimationFrame(frame)
        section.style.removeProperty('--py')
      }
    },
    [reduce],
  )

  return (
    <section
      ref={drift}
      id="hero"
      className={styles.hero}
      aria-label="Introduction"
      data-motion={reduceMotion ? 'reduce' : undefined}
    >
      {children}
    </section>
  )
}
