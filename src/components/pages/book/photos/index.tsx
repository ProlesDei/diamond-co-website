import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'

import styles from '../book.module.css'
import { useTurnstile } from '../turnstile'
import own from './photos.module.css'
import { sendPhoto } from './send'
import { shrink } from './shrink'
import type { Shrunk } from './shrink'

export const MAX_PHOTOS = 5

export type PhotosChange = { ids: string[]; busy: boolean }

type PhotosProps = {
  id: string
  describedBy: string | undefined
  onChange: (change: PhotosChange) => void
}

// The route's limit too (src/inquiry/collections/InquiryUploads.ts), which is server code.
const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const HEIC_TYPES = new Set(['image/heic', 'image/heif'])
const HEIC_NAME = /\.(heic|heif)$/i
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,.heic,.heif'

const NOT_A_PHOTO = 'Not a photo. Choose a JPG, PNG, HEIC or WebP.'
const REFUSED = "We couldn't add this photo. Remove it, then add it again."
const DROPPED = 'The connection dropped before this photo was sent. Remove it, then add it again.'
const FULL = "That's 5, our limit. Remove one to add another, or bring the rest to your consultation."

type Row = { key: number; name: string; label: string; thumb: string | null } & (
  | { state: 'uploading'; size: number; sentSize: number | null; progress: number }
  | { state: 'added'; sentSize: number; uploadId: string }
  | { state: 'error'; message: string }
)

const isHeic = (file: File) => HEIC_TYPES.has(file.type) || HEIC_NAME.test(file.name)
const isPhoto = (file: File) => PHOTO_TYPES.has(file.type) || isHeic(file)
const taken = (rows: Row[]) => rows.filter((row) => row.state !== 'error').length

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function status(row: Row): string {
  switch (row.state) {
    case 'error':
      return row.message
    case 'added':
      return `Added · ${formatSize(row.sentSize)}`
    case 'uploading':
      if (row.sentSize === null) return `Uploading ${formatSize(row.size)}…`
      if (row.sentSize >= row.size) return `Uploading ${formatSize(row.sentSize)}… ${row.progress}%`
      return `Uploading ${formatSize(row.size)}, shrunk to ${formatSize(row.sentSize)}… ${row.progress}%`
  }
}

export function Photos({ id, describedBy, onChange }: PhotosProps) {
  const [rows, setRows] = useState<Row[]>([])
  const current = useRef<Row[]>([])
  const reported = useRef<PhotosChange>({ ids: [], busy: false })
  const uploads = useRef(new Map<number, AbortController>())
  const queue = useRef<Promise<void>>(Promise.resolve())
  const nextKey = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  const { getToken } = useTurnstile()

  function commit(next: Row[]) {
    current.current = next
    setRows(next)
    const change: PhotosChange = {
      ids: next.flatMap((row) => (row.state === 'added' ? [row.uploadId] : [])),
      busy: next.some((row) => row.state === 'uploading'),
    }
    if (change.busy !== reported.current.busy || change.ids.join() !== reported.current.ids.join()) {
      reported.current = change
      onChange(change)
    }
  }

  function update(key: number, change: (row: Row) => Row) {
    commit(current.current.map((row) => (row.key === key ? change(row) : row)))
  }

  function whileUploading(key: number, change: (row: Row & { state: 'uploading' }) => Row) {
    update(key, (row) => (row.state === 'uploading' ? change(row) : row))
  }

  const fail = (key: number, message: string) => whileUploading(key, (row) => ({ ...row, state: 'error', message }))

  // One photo at a time: each needs its own Turnstile token, and a phone holds one decoded photo at once.
  async function upload(key: number, file: File, signal: AbortSignal) {
    if (signal.aborted) return
    const shrunk = await shrink(file)
    if (signal.aborted) return
    let photo: Shrunk | { blob: File; thumb: null }
    if (shrunk !== 'undecodable') photo = shrunk
    else if (isHeic(file)) photo = { blob: file, thumb: null }
    else return fail(key, NOT_A_PHOTO)
    whileUploading(key, (row) => ({ ...row, thumb: photo.thumb, sentSize: photo.blob.size }))

    const token = await getToken()
    if (signal.aborted) return
    const filename = photo.blob === file ? file.name : 'photo.jpg'
    const result = await sendPhoto(photo.blob, filename, token, signal, (progress) =>
      whileUploading(key, (row) => ({ ...row, progress })),
    )
    if (result.outcome === 'added') {
      whileUploading(key, (row) => ({ ...row, state: 'added', sentSize: photo.blob.size, uploadId: result.uploadId }))
    } else if (result.outcome === 'refused') {
      fail(key, REFUSED)
    } else if (result.outcome === 'dropped') {
      fail(key, DROPPED)
    }
  }

  function enqueue(key: number, file: File) {
    const controller = new AbortController()
    uploads.current.set(key, controller)
    queue.current = queue.current
      .then(() => upload(key, file, controller.signal))
      .catch((error: unknown) => {
        console.error('photos: an upload failed', error)
        fail(key, REFUSED)
      })
      .finally(() => uploads.current.delete(key))
  }

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    let room = MAX_PHOTOS - taken(current.current)
    if (room <= 0) return
    const added: Row[] = []
    const toSend: [number, File][] = []
    for (const file of files) {
      const key = nextKey.current++
      const base = { key, name: file.name, label: (file.name.split('.').pop() ?? '').toUpperCase(), thumb: null }
      if (!isPhoto(file)) {
        added.push({ ...base, state: 'error', message: NOT_A_PHOTO })
      } else if (file.size > MAX_PHOTO_BYTES) {
        const size = formatSize(file.size)
        added.push({ ...base, state: 'error', message: `That photo is ${size}, over our 10 MB limit. Choose a smaller one.` })
      } else if (room > 0) {
        room -= 1
        added.push({ ...base, state: 'uploading', size: file.size, sentSize: null, progress: 0 })
        toSend.push([key, file])
      }
    }
    commit([...current.current, ...added])
    toSend.forEach(([key, file]) => enqueue(key, file))
  }

  function remove(key: number) {
    uploads.current.get(key)?.abort()
    commit(current.current.filter((row) => row.key !== key))
    input.current?.focus()
  }

  // A full box stays focusable (aria-disabled, not disabled), so Remove can return focus to it.
  function openPicker(event: MouseEvent<HTMLInputElement>) {
    if (taken(current.current) >= MAX_PHOTOS) event.preventDefault()
  }

  const count = taken(rows)
  const full = count >= MAX_PHOTOS
  const limitId = `${id}-limit`

  return (
    <>
      <span className={full ? `${styles.drop} ${own.full}` : styles.drop}>
        <input
          ref={input}
          className={styles.dropInput}
          type="file"
          id={id}
          name="photos"
          multiple
          accept={ACCEPT}
          aria-disabled={full}
          aria-describedby={full ? [describedBy, limitId].filter(Boolean).join(' ') : describedBy}
          onClick={openPicker}
          onChange={choose}
        />
        <span className={styles.dropButton} aria-hidden="true">
          Choose photos
        </span>
        <span className={styles.dropName}>
          {count} of {MAX_PHOTOS} added
        </span>
      </span>
      {full && (
        <span className={own.limit} id={limitId}>
          {FULL}
        </span>
      )}
      <ul className={own.rows} aria-live="polite">
        {rows.map((row) => {
          const action = row.state === 'uploading' ? 'Cancel' : 'Remove'
          return (
            <li key={row.key} className={row.state === 'error' ? `${own.row} ${own.bad}` : own.row}>
              <span className={row.thumb ? own.thumb : `${own.thumb} ${own.thumbLabel}`}>
                {row.thumb ? <Image src={row.thumb} alt="" width={48} height={48} unoptimized /> : row.label}
              </span>
              <span className={own.name}>
                <b>{row.name}</b>
                <span>{status(row)}</span>
                {row.state === 'uploading' && (
                  <span className={own.bar} aria-hidden="true">
                    <i style={{ width: `${row.progress}%` }} />
                  </span>
                )}
              </span>
              <button
                className={own.remove}
                type="button"
                aria-label={`${action} ${row.name}`}
                onClick={() => remove(row.key)}
              >
                {action}
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
