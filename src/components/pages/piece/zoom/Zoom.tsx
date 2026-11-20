'use client'

import Image from 'next/image'
import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react'

import { useReducedMotion } from '@/components/site/useReducedMotion'
import { mediaLoader } from '@/media/loader'

import type { PiecePhoto } from '../photos'
import styles from './Zoom.module.css'

const MIN_SCALE = 1
const MAX_SCALE = 3
const EASE = 'cubic-bezier(.2,.7,.1,1)'
// At 3x the box shows the photo far wider than the screen, so always ask for the largest stored size.
const LARGEST = '2400px'

type ZoomProps = {
  photos: PiecePhoto[]
  start: number
  opener: HTMLElement
  onClose: () => void
}

type Point = { x: number; y: number }

const join = (...names: (string | false)[]) => names.filter(Boolean).join(' ')
const clamp = (scale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

function spread(points: Map<number, Point>): number {
  const [a, b] = [...points.values()]
  return Math.max(1, Math.hypot(a.x - b.x, a.y - b.y))
}

export function Zoom({ photos, start, opener, onClose }: ZoomProps) {
  const [index, setIndex] = useState(start)
  const [scale, setScale] = useState(MIN_SCALE)
  const [pinching, setPinching] = useState(false)
  const reduceMotion = useReducedMotion()
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const foot = useRef<HTMLDivElement>(null)
  const touches = useRef(new Map<number, Point>())
  const pinch = useRef<{ spread: number; scale: number } | null>(null)

  const total = photos.length
  const many = total > 1
  const photo = photos[index]

  // Runs once the dialog is in the page, before it paints: open it, then grow the box from the photo.
  function open(node: HTMLDialogElement | null) {
    dialog.current = node
    if (!node || node.open) return
    const from = opener.getBoundingClientRect()
    node.showModal()
    closeButton.current?.focus()
    if (reduceMotion || !box.current) return

    const to = box.current.getBoundingClientRect()
    if (!from.width || !to.width) return
    const dx = from.left + from.width / 2 - (to.left + to.width / 2)
    const dy = from.top + from.height / 2 - (to.top + to.height / 2)
    const k = Math.min(from.width / to.width, from.height / to.height)
    box.current.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: 'none' }],
      { duration: 320, easing: EASE },
    )
    node.animate(
      [{ backgroundColor: 'rgba(12, 54, 42, 0)' }, { backgroundColor: 'rgba(12, 54, 42, 1)' }],
      { duration: 200, easing: 'ease-out' },
    )
    for (const part of [bar.current, foot.current]) {
      part?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 120, fill: 'backwards' })
    }
  }

  function show(next: number) {
    setIndex((next + total) % total)
    setScale(MIN_SCALE)
  }

  const zoomIn = () => setScale((now) => clamp(Math.floor(now) + 1))
  const zoomOut = () => setScale((now) => clamp(Math.ceil(now) - 1))

  // Tab and Shift+Tab wrap round the dialog's buttons, from wherever focus is inside it.
  function keepFocusInside(event: KeyboardEvent<HTMLDialogElement>) {
    const buttons = [...event.currentTarget.querySelectorAll('button')]
    const at = buttons.findIndex((button) => button === document.activeElement)
    if (event.shiftKey && at <= 0) {
      event.preventDefault()
      buttons[buttons.length - 1].focus()
    } else if (!event.shiftKey && (at === -1 || at === buttons.length - 1)) {
      event.preventDefault()
      buttons[0].focus()
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Tab') return keepFocusInside(event)
    if (event.key === 'ArrowRight' && many) show(index + 1)
    else if (event.key === 'ArrowLeft' && many) show(index - 1)
    else if (event.key === '+' || event.key === '=') zoomIn()
    else if (event.key === '-') zoomOut()
    else return
    event.preventDefault()
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') return
    touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touches.current.size !== 2) return
    pinch.current = { spread: spread(touches.current), scale }
    setPinching(true)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!touches.current.has(event.pointerId)) return
    touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const start = pinch.current
    if (start && touches.current.size === 2) {
      setScale(clamp((start.scale * spread(touches.current)) / start.spread))
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    touches.current.delete(event.pointerId)
    if (!pinch.current || touches.current.size === 2) return
    pinch.current = null
    setPinching(false)
  }

  return (
    <dialog
      ref={open}
      className={styles.zoom}
      aria-modal="true"
      aria-label="Photo, zoomed"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClose={onClose}
    >
      <div ref={bar} className={styles.bar}>
        {many && (
          <p className={styles.count}>
            {index + 1} of {total}
          </p>
        )}
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.button}
            aria-label="Zoom out"
            aria-disabled={scale <= MIN_SCALE}
            onClick={zoomOut}
          >
            &minus;
          </button>
          <button
            type="button"
            className={styles.button}
            aria-label="Zoom in"
            aria-disabled={scale >= MAX_SCALE}
            onClick={zoomIn}
          >
            +
          </button>
          <button
            ref={closeButton}
            type="button"
            className={styles.button}
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
      </div>
      <div
        className={styles.stage}
        onDoubleClick={() => setScale((now) => (now > MIN_SCALE ? MIN_SCALE : 2))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div ref={box} className={join(styles.box, photo.shot === 'daylight' && styles.day)}>
          <Image
            key={photo.src}
            loader={mediaLoader}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes={LARGEST}
            loading="eager"
            className={join(styles.photo, (reduceMotion || pinching) && styles.still)}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <div ref={foot} className={styles.foot}>
        {many && (
          <button type="button" className={styles.button} onClick={() => show(index - 1)}>
            Previous
          </button>
        )}
        <span>{photo.caption}</span>
        {many && (
          <button type="button" className={styles.button} onClick={() => show(index + 1)}>
            Next
          </button>
        )}
      </div>
    </dialog>
  )
}
