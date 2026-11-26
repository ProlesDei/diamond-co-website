'use client'

import { useCallback, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { flushSync } from 'react-dom'

import { Field } from '@/components/home/booking/Field'
import { Button } from '@/components/site/Button'
import { bookInquirySchema, type BookInquiryInput } from '@/inquiry/schema'
import { calendlyPrefillUrl } from '@/lib/calendly'

import styles from './book.module.css'
import { ErrorSummary } from './ErrorSummary'
import { NOT_A_PHOTO, PHOTO_ACCEPT, sendPhoto } from './photo'
import { PieceCard } from './piece'
import type { BookPiece } from './piece'
import { sendBook } from './send'
import { Turnstile, useTurnstile } from './turnstile'
import { BOOK_FIELDS, validateBook } from './validate'
import type { BookErrors, BookField } from './validate'

type FormProps = {
  heading: 'h2' | 'h3'
  calendlyLink: string
  piece: BookPiece | null
}

const FIELD_IDS: Record<BookField, string> = {
  name: 'book-name',
  email: 'book-email',
  photo: 'book-photo',
}

const SUMMARY_LABELS: Record<BookField, string> = {
  name: 'Add your name',
  email: 'Add your email address',
  photo: 'Check the reference photo',
}

const PHOTO_REFUSED = "We couldn't add this photo. Choose it again, or send the form without it."
const PHOTO_DROPPED = 'The connection dropped before the photo was sent. Send the form again.'

type SendState = 'idle' | 'sending' | 'opening' | 'rate-limited' | 'failed'

const submitLabel = (state: SendState): string => {
  if (state === 'sending') return 'Sending…'
  if (state === 'opening') return 'Opening Calendly…'
  if (state === 'failed') return 'Try again'
  return 'Choose a time'
}

type Sent = { outcome: 'sent' } | { outcome: 'rate-limited' | 'failed' } | { outcome: 'photo'; message: string }

export function Form({ heading: Heading, calendlyLink, piece }: FormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [pieceRemoved, setPieceRemoved] = useState(false)

  const [errors, setErrors] = useState<BookErrors>({})
  const [sendState, setSendState] = useState<SendState>('idle')
  const summaryRef = useRef<HTMLDivElement>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const sendingRef = useRef(false)
  const openingRef = useRef(false)
  const { getToken } = useTurnstile()

  const summaryItems = BOOK_FIELDS.filter((field) => errors[field] !== undefined).map((field) => ({
    id: FIELD_IDS[field],
    label: SUMMARY_LABELS[field],
  }))

  // Back from Calendly can restore this page from the browser's cache, still marked as opening it.
  // Only that state resets: a send still in flight keeps its lock. Listens only while the form is on
  // the page; React runs the returned cleanup when it leaves.
  const resetOnRestore = useCallback((form: HTMLFormElement | null) => {
    if (!form) return
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !openingRef.current) return
      openingRef.current = false
      sendingRef.current = false
      setSendState('idle')
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  function stop(state: 'idle' | 'rate-limited' | 'failed', found: BookErrors = {}) {
    sendingRef.current = false
    flushSync(() => {
      setErrors(found)
      setSendState(state)
    })
    if (state === 'idle') summaryRef.current?.focus()
    else noticeRef.current?.focus()
  }

  async function uploadPhoto(file: File): Promise<{ uploadId: string } | { message: string }> {
    const result = await sendPhoto(file, await getToken())
    if (result === 'not-a-photo') return { message: NOT_A_PHOTO }
    if (result.outcome === 'added') return { uploadId: result.uploadId }
    return { message: result.outcome === 'dropped' ? PHOTO_DROPPED : PHOTO_REFUSED }
  }

  async function send(input: BookInquiryInput): Promise<Sent> {
    // Offline, Turnstile takes about 40 seconds to give up on a token.
    if (!navigator.onLine) return { outcome: 'failed' }
    try {
      let uploadId: string | undefined
      if (photo) {
        const uploaded = await uploadPhoto(photo)
        if ('message' in uploaded) return { outcome: 'photo', message: uploaded.message }
        uploadId = uploaded.uploadId
      }
      return await sendBook({ ...input, uploadId }, await getToken())
    } catch (error) {
      console.error('book: the send failed', error)
      return { outcome: 'failed' }
    }
  }

  // Only a send that saved opens Calendly, so every booking has a saved request behind it.
  async function post(input: BookInquiryInput) {
    const result = await send(input)
    if (result.outcome === 'photo') return stop('idle', { photo: result.message })
    if (result.outcome !== 'sent') return stop(result.outcome)
    openingRef.current = true
    setSendState('opening')
    window.location.assign(calendlyPrefillUrl(calendlyLink, { name: input.name, email: input.email }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingRef.current) return

    const found = validateBook({ name, email, photo })
    flushSync(() => {
      setErrors(found)
      setSendState('idle')
    })
    if (Object.keys(found).length > 0) {
      summaryRef.current?.focus()
      return
    }

    const parsed = bookInquirySchema.safeParse({
      form: 'book',
      name,
      email,
      piece: piece && !pieceRemoved ? piece.slug : undefined,
    })
    if (!parsed.success) return stop('failed')

    sendingRef.current = true
    setSendState('sending')
    void post(parsed.data)
  }

  function choosePhoto(file: File | null) {
    setPhoto(file)
    setErrors((current) => ({ ...current, photo: undefined }))
  }

  function clearPhoto() {
    choosePhoto(null)
    if (photoRef.current) photoRef.current.value = ''
    photoRef.current?.focus()
  }

  return (
    <form className={styles.form} method="post" noValidate onSubmit={submit} ref={resetOnRestore}>
      <Heading className={styles.formHeading}>Book a free consultation</Heading>
      <p className={styles.formIntro}>Send your name and email, then pick a time on Calendly.</p>

      {summaryItems.length > 0 && <ErrorSummary items={summaryItems} ref={summaryRef} />}

      <PieceCard piece={piece} onRemove={() => setPieceRemoved(true)} />

      <fieldset className={styles.group}>
        <legend>You</legend>

        <Field
          id={FIELD_IDS.name}
          label="Your name"
          error={errors.name}
          control={(props) => (
            <input
              className={styles.control}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              {...props}
            />
          )}
        />

        <Field
          id={FIELD_IDS.email}
          label="Email"
          error={errors.email}
          control={(props) => (
            <input
              className={styles.control}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              {...props}
            />
          )}
        />

        <Field
          id={FIELD_IDS.photo}
          label="Reference photo"
          optional
          hint="A sketch, a screenshot or the piece you want to redesign. JPG, PNG, HEIC or WebP, up to 10 MB."
          error={errors.photo}
          control={(props) => (
            <span className={styles.drop}>
              <input
                ref={photoRef}
                className={styles.dropInput}
                type="file"
                name="photo"
                accept={PHOTO_ACCEPT}
                onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
                {...props}
              />
              <span className={styles.dropButton} aria-hidden="true">
                Choose a photo
              </span>
              <span className={styles.dropName}>{photo ? photo.name : 'No photo chosen'}</span>
            </span>
          )}
        />
        {photo && (
          <Button variant="secondary" type="button" onClick={clearPhoto}>
            Remove {photo.name}
          </Button>
        )}
      </fieldset>

      <div className={styles.promise}>
        <p className={styles.promiseHeading}>The Render-First Promise</p>
        <p>You approve a drawing and a render before any metal is cut.</p>
      </div>

      {sendState === 'rate-limited' && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={noticeRef}>
          <p className={styles.summaryHeading}>Too many tries from this connection</p>
          <p className={styles.summaryText}>
            We&apos;ve had several requests from here in the last hour. Wait an hour and send it
            again. Your answers are still here.
          </p>
        </div>
      )}
      {sendState === 'failed' && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={noticeRef}>
          <p className={styles.summaryHeading}>We couldn&apos;t send this</p>
          <p className={styles.summaryText}>
            Something went wrong on our side. Try again in a minute. Your answers are still here.
          </p>
        </div>
      )}

      <Turnstile />

      <Button variant="primary" type="submit" className={styles.submit}>
        {submitLabel(sendState)}
      </Button>

      <p className={styles.after}>
        {sendState === 'sending'
          ? 'Sending your answers. Keep this page open.'
          : 'Next, you pick a time on Calendly. Nothing is charged until you agree.'}
      </p>
    </form>
  )
}
