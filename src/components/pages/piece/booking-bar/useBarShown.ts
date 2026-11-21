import { useSyncExternalStore } from 'react'

const BUTTON_ID = 'piece-book'
const FOOTER_SELECTOR = 'footer'
const MENU_OPEN_ATTRIBUTE = 'data-menu-open'
const WHOLLY_ABOVE_VIEWPORT = { rootMargin: '100000px 0px -100% 0px', threshold: 1 }

type Sightings = { buttonAbove: boolean; footerOnScreen: boolean; menuOpen: boolean }

const hidden: Sightings = { buttonAbove: false, footerOnScreen: false, menuOpen: false }
let sightings = hidden

function isShown({ buttonAbove, footerOnScreen, menuOpen }: Sightings) {
  return buttonAbove && !footerOnScreen && !menuOpen
}

function subscribe(onChange: () => void) {
  const button = document.getElementById(BUTTON_ID)
  const footer = document.querySelector(FOOTER_SELECTOR)
  if (!button || !footer) return () => {}

  const root = document.documentElement

  function update(next: Partial<Sightings>) {
    const wasShown = isShown(sightings)
    sightings = { ...sightings, ...next }
    if (isShown(sightings) !== wasShown) onChange()
  }

  const buttonObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) update({ buttonAbove: entry.intersectionRatio >= 1 })
  }, WHOLLY_ABOVE_VIEWPORT)
  const footerObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) update({ footerOnScreen: entry.isIntersecting })
  })
  buttonObserver.observe(button)
  footerObserver.observe(footer)

  const menu = new MutationObserver(() => {
    update({ menuOpen: root.hasAttribute(MENU_OPEN_ATTRIBUTE) })
  })
  menu.observe(root, { attributes: true, attributeFilter: [MENU_OPEN_ATTRIBUTE] })
  update({ menuOpen: root.hasAttribute(MENU_OPEN_ATTRIBUTE) })

  return () => {
    buttonObserver.disconnect()
    footerObserver.disconnect()
    menu.disconnect()
    sightings = hidden
  }
}

function getSnapshot() {
  return isShown(sightings)
}

function getServerSnapshot() {
  return false
}

export function useBarShown(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
