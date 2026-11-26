import type { CSSProperties } from 'react'

import styles from './HomeLoader.module.css'

// The intro plays in full, then holds the finished mark, for this long before the loader may leave.
const INTRO_MS = 1600
// Longest exit; the loader closes after it even if no animation event fires.
const EXIT_MS = 800
// Photos get this long to decode before the loader leaves anyway.
const DEADLINE_MS = 5000
// Whatever fails in the script, the page shows by this time.
const FAILSAFE_MS = DEADLINE_MS + INTRO_MS + EXIT_MS + 400

// Run during HTML parsing so the loader can appear before the app hydrates.
const startLoader = `
(() => {
  const loader = document.getElementById('home-loader')
  let closed = false
  let revealed = false
  let failsafe = 0
  const close = () => {
    closed = true
    loader.removeAttribute('data-loading')
    loader.removeAttribute('data-leaving')
    clearTimeout(failsafe)
  }
  // Armed before the page hides, so no later error can keep it hidden.
  failsafe = setTimeout(close, ${FAILSAFE_MS})
  // A page restored from the back/forward cache must not come back hidden.
  addEventListener('pageshow', (event) => event.persisted && close())
  const started = performance.now()
  let seen = false
  try {
    seen = sessionStorage.getItem('home-intro') === 'seen'
    sessionStorage.setItem('home-intro', 'seen')
  } catch {}
  const still =
    loader.getAttribute('data-motion') === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
  loader.setAttribute('data-intro', still ? 'still' : seen ? 'short' : 'full')
  loader.setAttribute('data-loading', '')
  const leave = () => {
    if (closed) return
    loader.setAttribute('data-leaving', '')
    loader.addEventListener('animationend', (event) => event.target === loader && close())
    setTimeout(close, ${EXIT_MS + 100})
  }
  const reveal = () => {
    if (revealed || closed) return
    revealed = true
    clearTimeout(deadline)
    document.removeEventListener('DOMContentLoaded', waitForPhotos)
    const intro = still || seen ? 0 : ${INTRO_MS} - (performance.now() - started)
    setTimeout(leave, Math.max(intro, 0))
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
  const deadline = setTimeout(reveal, ${DEADLINE_MS})
  document.addEventListener('DOMContentLoaded', waitForPhotos)
})()
`

const NAME = 'Diamond & Co.'

// Outline halves start at the culet and meet at the middle of the table.
const OUTLINE_LEFT = 'M60 92 L8 40 L38 20 H60'
const OUTLINE_RIGHT = 'M60 92 L112 40 L82 20 H60'
const STONE = 'M38 20 H82 L112 40 L60 92 L8 40 Z'
const CROWN = 'M38 20 L23 40 M38 20 L47 40 M60 20 L47 40 M60 20 L73 40 M82 20 L73 40 M82 20 L97 40'
const PAVILION = 'M23 40 L60 92 M47 40 L60 92 M73 40 L60 92 M97 40 L60 92'

function Letters() {
  return Array.from(NAME, (letter, index) =>
    letter === ' ' ? (
      ' '
    ) : (
      <span key={index} className={styles.letter} style={{ '--i': index } as CSSProperties}>
        {letter}
      </span>
    ),
  )
}

export function HomeLoader({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      id="home-loader"
      className={styles.loader}
      role="status"
      data-motion={reduceMotion ? 'reduce' : undefined}
      suppressHydrationWarning
    >
      <div className={styles.stage}>
        <svg className={styles.mark} viewBox="0 12 120 88" aria-hidden="true">
          <defs>
            <clipPath id="home-loader-stone">
              <path d={STONE} />
            </clipPath>
            <linearGradient id="home-loader-light" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#FFF6DE" stopOpacity="0" />
              <stop offset=".5" stopColor="#FFF6DE" stopOpacity=".5" />
              <stop offset="1" stopColor="#FFF6DE" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath="url(#home-loader-stone)">
            <rect className={styles.glint} x="-40" y="0" width="40" height="100" fill="url(#home-loader-light)" />
          </g>
          <g className={styles.lines}>
            <path className={styles.outline} d={OUTLINE_LEFT} pathLength={1} />
            <path className={styles.outline} d={OUTLINE_RIGHT} pathLength={1} />
            <path className={styles.girdle} d="M8 40 H112" />
            <path className={`${styles.facets} ${styles.crown}`} d={CROWN} pathLength={1} />
            <path className={`${styles.facets} ${styles.pavilion}`} d={PAVILION} pathLength={1} />
          </g>
        </svg>
        <div className={styles.words}>
          <span className={styles.name} aria-hidden="true">
            <Letters />
          </span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.label}>
            <span className={styles.hidden}>{NAME} </span>
            Loading
          </span>
        </div>
      </div>
      <span hidden dangerouslySetInnerHTML={{ __html: `<script>${startLoader}</script>` }} />
    </div>
  )
}
