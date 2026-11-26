import { useSyncExternalStore } from 'react'

const HERO_BUTTON_ID = 'hero-book'
const FORM_ID = 'book'
const MENU_OPEN_ATTRIBUTE = 'data-menu-open'
const WHOLLY_ABOVE_VIEWPORT = { rootMargin: '100000px 0px -100% 0px', threshold: 1 }
const ON_SCREEN_OR_ABOVE = { rootMargin: '100000px 0px 0px 0px' }

type Sightings = { heroButtonAbove: boolean; formReached: boolean; menuOpen: boolean }

const hidden: Sightings = { heroButtonAbove: false, formReached: false, menuOpen: false }
let sightings = hidden

function isShown({ heroButtonAbove, formReached, menuOpen }: Sightings) {
  return heroButtonAbove && !formReached && !menuOpen
}

function subscribe(onChange: () => void) {
  const heroButton = document.getElementById(HERO_BUTTON_ID)
  const form = document.getElementById(FORM_ID)
  if (!heroButton || !form) return () => {}

  const root = document.documentElement

  function update(next: Partial<Sightings>) {
    const wasShown = isShown(sightings)
    sightings = { ...sightings, ...next }
    if (isShown(sightings) !== wasShown) onChange()
  }

  const heroObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) update({ heroButtonAbove: entry.intersectionRatio >= 1 })
  }, WHOLLY_ABOVE_VIEWPORT)
  // On or past the form, the sections below carry their own booking button.
  const formObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) update({ formReached: entry.isIntersecting })
  }, ON_SCREEN_OR_ABOVE)
  heroObserver.observe(heroButton)
  formObserver.observe(form)

  const menu = new MutationObserver(() => {
    update({ menuOpen: root.hasAttribute(MENU_OPEN_ATTRIBUTE) })
  })
  menu.observe(root, { attributes: true, attributeFilter: [MENU_OPEN_ATTRIBUTE] })
  update({ menuOpen: root.hasAttribute(MENU_OPEN_ATTRIBUTE) })

  return () => {
    heroObserver.disconnect()
    formObserver.disconnect()
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
