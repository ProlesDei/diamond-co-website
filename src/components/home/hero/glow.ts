import type { Stone } from './stone'

type Point = { x: number; y: number }
type Size = { width: number; height: number }

type LightTheStone = {
  box: HTMLElement
  img: HTMLImageElement
  glow: HTMLElement
  original: Size
  stone: Stone
  reduce: boolean
}

const LERP = 0.16
const REACH = 260
const FADE_OUT = 'opacity 400ms ease'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const inCrop = (focus: number, scaled: number, shown: number) =>
  focus * scaled - clamp(focus * scaled - shown / 2, 0, scaled - shown)

function stoneOnScreen(box: HTMLElement, img: HTMLImageElement, original: Size, stone: Stone): Point {
  const shown = { width: img.naturalWidth || original.width, height: img.naturalHeight || original.height }
  const scale = Math.max(shown.width / original.width, shown.height / original.height)
  const inFile = {
    x: inCrop(stone.x, original.width * scale, shown.width),
    y: inCrop(stone.y, original.height * scale, shown.height),
  }

  const boxRect = box.getBoundingClientRect()
  const imgRect = img.getBoundingClientRect()
  const style = getComputedStyle(img)
  const fit = style.objectFit === 'contain' ? Math.min : Math.max
  const k = fit(imgRect.width / shown.width, imgRect.height / shown.height)
  const [posX = 50, posY = 50] = style.objectPosition.split(' ').map(parseFloat)
  return {
    x: imgRect.left - boxRect.left + ((imgRect.width - shown.width * k) * posX) / 100 + inFile.x * k,
    y: imgRect.top - boxRect.top + ((imgRect.height - shown.height * k) * posY) / 100 + inFile.y * k,
  }
}

export function lightTheStone({ box, img, glow, original, stone, reduce }: LightTheStone): () => void {
  let current: Point | null = null
  let target: Point = { x: 0, y: 0 }
  let lit = false
  let frame = 0

  const draw = () => {
    frame = 0
    if (!current) return
    const step = reduce ? 1 : LERP
    current = { x: current.x + (target.x - current.x) * step, y: current.y + (target.y - current.y) * step }
    const centre = stoneOnScreen(box, img, original, stone)
    const near = clamp(1 - Math.hypot(current.x - centre.x, current.y - centre.y) / REACH, 0, 1)
    glow.style.transform = `translate(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px) scale(${(0.7 + 0.45 * near).toFixed(3)})`
    glow.style.opacity = lit ? (0.32 + 0.68 * near).toFixed(3) : '0'
    if (Math.abs(target.x - current.x) > 0.3 || Math.abs(target.y - current.y) > 0.3) {
      frame = requestAnimationFrame(draw)
    }
  }

  const aim = (clientX: number, clientY: number) => {
    const boxRect = box.getBoundingClientRect()
    target = reduce
      ? stoneOnScreen(box, img, original, stone)
      : { x: clientX - boxRect.left, y: clientY - boxRect.top }
    current ??= target
    lit = true
    glow.style.transition = 'none'
    frame ||= requestAnimationFrame(draw)
  }

  const leave = () => {
    lit = false
    glow.style.transition = reduce ? 'none' : FADE_OUT
    glow.style.opacity = '0'
  }

  const onPointerMove = (event: PointerEvent) => aim(event.clientX, event.clientY)
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (touch) aim(touch.clientX, touch.clientY)
  }

  box.addEventListener('pointermove', onPointerMove)
  box.addEventListener('pointerleave', leave)
  box.addEventListener('touchmove', onTouchMove, { passive: true })
  box.addEventListener('touchend', leave, { passive: true })

  return () => {
    box.removeEventListener('pointermove', onPointerMove)
    box.removeEventListener('pointerleave', leave)
    box.removeEventListener('touchmove', onTouchMove)
    box.removeEventListener('touchend', leave)
    cancelAnimationFrame(frame)
    glow.style.removeProperty('transform')
    glow.style.removeProperty('opacity')
    glow.style.removeProperty('transition')
  }
}
