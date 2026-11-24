'use client'

import { useReducedMotion } from '@/components/site/useReducedMotion'

import styles from './HomeLoader.module.css'

// Run during HTML parsing so the loader can appear before the app hydrates.
const startLoader = `
(() => {
  const loader = document.getElementById('home-loader')
  loader.setAttribute('data-loading', '')
  const reveal = () => {
    loader.removeAttribute('data-loading')
    clearTimeout(deadline)
    document.removeEventListener('DOMContentLoaded', waitForPhotos)
  }
  const waitForPhotos = () => {
    const { clientWidth, clientHeight } = document.documentElement
    const photos = Array.from(document.images).filter((photo) => {
      if (photo.id === 'home-hero-image') return true
      const { top, right, bottom, left, width, height } = photo.getBoundingClientRect()
      return width > 0 && height > 0 && right > 0 && bottom > 0 && left < clientWidth && top < clientHeight
    })
    Promise.allSettled(photos.map((photo) => photo.decode())).then(reveal)
  }
  const deadline = setTimeout(reveal, 5000)
  document.addEventListener('DOMContentLoaded', waitForPhotos)
})()
`

export function HomeLoader({ reduceMotion }: { reduceMotion: boolean }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      id="home-loader"
      className={styles.loader}
      role="status"
      data-motion={reduceMotion || prefersReducedMotion ? 'reduce' : undefined}
      suppressHydrationWarning
    >
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.name}>Diamond &amp; Co.</span>
      <span className={styles.label}>Loading</span>
      <span hidden dangerouslySetInnerHTML={{ __html: `<script>${startLoader}</script>` }} />
    </div>
  )
}
