import { useSyncExternalStore } from 'react'

import styles from './turnstile.module.css'

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type RenderOptions = {
  sitekey: string
  appearance: 'interaction-only'
  retry: 'never'
  callback: (token: string) => void
  'error-callback': (code: string) => void
  'timeout-callback': () => void
  'before-interactive-callback': () => void
  'after-interactive-callback': () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: RenderOptions) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type Waiting = { resolve: (token: string) => void; reject: (error: Error) => void }

// One widget per page: the slot above the submit button. The upload and the request each ask it for a token.
let slot: HTMLElement | null = null
let widgetId: string | null = null
let waiting: Waiting | null = null
let script: Promise<TurnstileApi> | null = null
let turn: Promise<unknown> = Promise.resolve()
let asked = false
const listeners = new Set<() => void>()

function setAsked(next: boolean) {
  asked = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function settle(outcome: { token: string } | { error: Error }) {
  const current = waiting
  waiting = null
  if (!current) return
  if ('token' in outcome) current.resolve(outcome.token)
  else current.reject(outcome.error)
}

function loadScript(): Promise<TurnstileApi> {
  script ??= new Promise<TurnstileApi>((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = SCRIPT_URL
    tag.async = true
    tag.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile loaded without its API.'))
    tag.onerror = () => {
      tag.remove()
      reject(new Error('Turnstile did not load. Check the connection and try again.'))
    }
    document.head.append(tag)
  }).catch((error: unknown) => {
    script = null
    throw error
  })
  return script
}

async function nextToken(): Promise<string> {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  // PARKED (owner, Nov 20, 2026): with no site key the server skips the check (src/inquiry/turnstileParked.ts),
  // so there is no token to get. Set both Turnstile keys and redeploy to turn the check back on.
  if (!sitekey) return ''
  const turnstile = await loadScript()
  if (!slot) throw new Error('The Turnstile slot is not on the page.')

  const token = new Promise<string>((resolve, reject) => {
    waiting = { resolve, reject }
  })
  try {
    if (widgetId === null) {
      widgetId = turnstile.render(slot, {
        sitekey,
        appearance: 'interaction-only',
        retry: 'never',
        callback: (value) => settle({ token: value }),
        'error-callback': (code) => settle({ error: new Error(`Turnstile failed (${code}).`) }),
        'timeout-callback': () => settle({ error: new Error('Turnstile timed out.') }),
        'before-interactive-callback': () => setAsked(true),
        'after-interactive-callback': () => setAsked(false),
      })
    } else {
      turnstile.reset(widgetId)
    }
  } catch (error) {
    waiting = null
    throw error
  }
  return token
}

// Each token is good for one post, so every call resets the widget, one call at a time.
function getToken(): Promise<string> {
  const token = turn.then(nextToken)
  turn = token.catch(() => undefined)
  return token
}

function attach(element: HTMLDivElement) {
  slot = element
  return () => {
    if (widgetId !== null) window.turnstile?.remove(widgetId)
    widgetId = null
    slot = null
    settle({ error: new Error('The Turnstile slot left the page.') })
    setAsked(false)
  }
}

export function Turnstile() {
  const isAsked = useSyncExternalStore(
    subscribe,
    () => asked,
    () => false,
  )
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null
  return <div ref={attach} className={isAsked ? styles.asked : styles.unasked} />
}

export function useTurnstile() {
  return { getToken }
}
