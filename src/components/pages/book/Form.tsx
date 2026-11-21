'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { flushSync } from 'react-dom'

import { CalendlyStep } from '@/components/booking/calendly/CalendlyStep'
import { joinAnswers } from '@/components/booking/calendly/prefill'
import type { CalendlyPrefill } from '@/components/booking/calendly/prefill'
import { Field } from '@/components/home/booking/Field'
import { Button } from '@/components/site/Button'
import { studio } from '@/components/site/studio'
import type { BookOption, BookOptions } from '@/inquiry/options'
import {
  bookInquirySchema,
  CONTACT_WAY_LABELS,
  CONTACT_WAYS,
  DESCRIPTION_MAX_LENGTH,
  type BookInquiryInput,
  type ContactWay,
} from '@/inquiry/schema'
import { calendlyUrl } from '@/lib/calendly'

import { saveSent } from '../thanks/sent'

import styles from './book.module.css'
import { ChipGroup } from './ChipGroup'
import { ErrorSummary } from './ErrorSummary'
import { Mark } from './Mark'
import { Photos } from './photos'
import type { PhotosChange } from './photos'
import { PieceCard } from './piece'
import type { BookPiece } from './piece'
import { sendBook } from './send'
import type { BookSendResult } from './send'
import { Turnstile, useTurnstile } from './turnstile'
import { BOOK_FIELDS, validateBook } from './validate'
import type { BookErrors, BookField } from './validate'

type FormProps = {
  heading: 'h2' | 'h3'
  options: BookOptions
  piece: BookPiece | null
  initialPieceType: string | null
}

const contactWayOptions = CONTACT_WAYS.map((way) => ({ label: CONTACT_WAY_LABELS[way], value: way }))

const FIELD_IDS: Record<BookField, string> = {
  pieceType: 'book-pieceType',
  budget: 'book-budget',
  description: 'book-description',
  name: 'book-name',
  email: 'book-email',
}

const SUMMARY_LABELS: Record<BookField, string> = {
  pieceType: 'Choose the kind of piece',
  budget: 'Choose a budget range',
  description: 'Tell us about the piece',
  name: 'Add your name',
  email: 'Add your email address',
}

type SendState = 'idle' | 'sending' | 'rate-limited' | 'failed'

const SUBMIT_LABEL = calendlyUrl ? 'Choose a time' : 'Request my consultation'

const SUBMIT_LABELS: Record<SendState, string> = {
  idle: SUBMIT_LABEL,
  sending: 'Sending…',
  'rate-limited': SUBMIT_LABEL,
  failed: 'Try again',
}

const formatCount = (count: number) => count.toLocaleString('en-CA')

const optionLabel = (choices: BookOption[], value: string) =>
  choices.find((option) => option.value === value)?.label

export function Form({ heading: Heading, options, piece, initialPieceType }: FormProps) {
  const [pieceType, setPieceType] = useState(initialPieceType ?? '')
  const [budget, setBudget] = useState('')
  const [description, setDescription] = useState('')
  const [pieceRemoved, setPieceRemoved] = useState(false)
  const [needBy, setNeedBy] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactWay, setContactWay] = useState<ContactWay>('email')
  const [newsOptIn, setNewsOptIn] = useState(false)

  const [errors, setErrors] = useState<BookErrors>({})
  const [sendState, setSendState] = useState<SendState>('idle')
  const [prefill, setPrefill] = useState<CalendlyPrefill | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const sendingRef = useRef(false)
  const photosRef = useRef<PhotosChange>({ ids: [], busy: false })
  const waitingRef = useRef<BookInquiryInput | null>(null)
  const router = useRouter()
  const { getToken } = useTurnstile()

  const summaryItems = BOOK_FIELDS.filter((field) => errors[field] !== undefined).map((field) => ({
    id: FIELD_IDS[field],
    label: SUMMARY_LABELS[field],
  }))

  function refused(state: 'rate-limited' | 'failed') {
    sendingRef.current = false
    flushSync(() => setSendState(state))
    noticeRef.current?.focus()
  }

  // Photos calls this from closures of older renders, so it and post read only refs and setters.
  function photosChanged(change: PhotosChange) {
    photosRef.current = change
    const waiting = waitingRef.current
    if (waiting && !change.busy) {
      waitingRef.current = null
      void post(waiting)
    }
  }

  async function send(input: BookInquiryInput): Promise<BookSendResult> {
    // Offline, Turnstile takes about 40 seconds to give up on a token.
    if (!navigator.onLine) return { outcome: 'failed' }
    let token: string
    try {
      token = await getToken()
    } catch (error) {
      console.error('book: no Turnstile token for the send', error)
      return { outcome: 'failed' }
    }
    return sendBook({ ...input, uploadIds: photosRef.current.ids }, token)
  }

  // Only a send that saved opens the time step, so every booking has a saved request behind it.
  async function post(input: BookInquiryInput) {
    const result = await send(input)
    if (result.outcome !== 'sent') return refused(result.outcome)

    if (calendlyUrl) {
      sendingRef.current = false
      setSendState('idle')
      setPrefill({
        reference: result.reference,
        name: input.name,
        email: input.email,
        a1: joinAnswers(
          [
            optionLabel(options.pieceTypes, input.pieceType),
            optionLabel(options.budgetRanges, input.budget),
            input.needBy && `Need by ${input.needBy}`,
            input.phone && `Phone ${input.phone}`,
            `Reach by ${CONTACT_WAY_LABELS[input.contactWay].toLowerCase()}`,
          ],
          input.description,
        ),
      })
      return
    }

    const sentPiece = input.piece && piece?.photo ? { slug: piece.slug, name: piece.name, photoUrl: piece.photo } : null
    saveSent({
      firstName: input.name.split(/\s+/)[0],
      reference: result.reference,
      piece: sentPiece,
    })
    router.push('/book/thanks')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingRef.current) return

    const found = validateBook({ pieceType, budget, description, name, email: email || undefined })
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
      pieceType,
      budget,
      description,
      name,
      email: email || undefined,
      phone: phone.trim() || undefined,
      contactWay,
      needBy: needBy || undefined,
      newsOptIn,
      piece: piece && !pieceRemoved ? piece.slug : undefined,
    })
    if (!parsed.success) return refused('failed')

    sendingRef.current = true
    setSendState('sending')
    if (photosRef.current.busy) waitingRef.current = parsed.data
    else void post(parsed.data)
  }

  const form = (
    <form className={styles.form} method="post" noValidate onSubmit={submit} hidden={prefill !== null}>
      <Heading className={styles.formHeading}>Book a free consultation</Heading>
      {calendlyUrl ? (
        <p className={styles.formIntro}>
          One short form, then you pick a time with [GOLDSMITH]
          <Mark note="client supplies" /> on this page
          <Mark note="confirm" />.
        </p>
      ) : (
        <p className={styles.formIntro}>
          One short form. [GOLDSMITH]
          <Mark note="client supplies" /> reads it and replies to set a time.
        </p>
      )}

      {summaryItems.length > 0 && <ErrorSummary items={summaryItems} ref={summaryRef} />}

      <PieceCard piece={piece} onRemove={() => setPieceRemoved(true)} />

      <fieldset className={styles.group}>
        <legend>The piece</legend>

        <ChipGroup
          id={FIELD_IDS.pieceType}
          name="pieceType"
          legend={
            <>
              What would you like made?
              <Mark note="from the CMS; confirm" />
            </>
          }
          error={errors.pieceType}
          options={options.pieceTypes}
          value={pieceType}
          onChange={setPieceType}
        />

        <ChipGroup
          id={FIELD_IDS.budget}
          name="budget"
          legend={
            <>
              Budget range (CAD)
              <Mark note="from the CMS; confirm" />
            </>
          }
          hint="A range is fine. It helps us suggest stones and metals."
          error={errors.budget}
          options={options.budgetRanges}
          value={budget}
          onChange={setBudget}
        />

        <Field
          id={FIELD_IDS.description}
          label="Tell us about the piece"
          optional
          hint="What you have in mind, who it's for, a stone you want to reuse. Up to 2,000 characters."
          error={errors.description}
          control={({ id, 'aria-describedby': describedBy, ...aria }) => (
            <>
              <textarea
                className={`${styles.control} ${styles.textarea}`}
                id={id}
                name="description"
                maxLength={DESCRIPTION_MAX_LENGTH}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                aria-describedby={`${describedBy ?? ''} ${id}-count`.trim()}
                {...aria}
              />
              <span className={styles.counter} id={`${id}-count`}>
                {formatCount(description.length)} of {formatCount(DESCRIPTION_MAX_LENGTH)}
              </span>
            </>
          )}
        />

        <Field
          id="book-photos"
          label="Add photos"
          optional
          hint="Up to 5: a sketch, a screenshot, the piece you want to redesign. JPG, PNG, HEIC or WebP, up to 10 MB each. We shrink them before they send."
          control={({ id, 'aria-describedby': describedBy }) => (
            <Photos id={id} describedBy={describedBy} onChange={photosChanged} />
          )}
        />

        <Field
          id="book-needBy"
          label="Need it by a date?"
          optional
          hint="A proposal or a wedding? We'll tell you honestly if we can make it."
          control={(props) => (
            <input
              className={`${styles.control} ${styles.dateControl}`}
              type="date"
              name="needBy"
              value={needBy}
              onChange={(event) => setNeedBy(event.target.value)}
              {...props}
            />
          )}
        />
      </fieldset>

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

        {!calendlyUrl && (
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
        )}

        <Field
          id="book-phone"
          label="Phone"
          optional
          control={(props) => (
            <input
              className={styles.control}
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              {...props}
            />
          )}
        />

        <ChipGroup
          id="book-contactWay"
          name="contactWay"
          legend="How should we reach you?"
          options={contactWayOptions}
          value={contactWay}
          onChange={(value) => setContactWay(value as ContactWay)}
        />

        <label className={styles.check}>
          <input
            type="checkbox"
            id="book-newsOptIn"
            name="newsOptIn"
            checked={newsOptIn}
            onChange={(event) => setNewsOptIn(event.target.checked)}
          />
          <span>
            Also email me news of new work, a few times a year. I can unsubscribe at any time.{' '}
            <span className={styles.optional}>(optional)</span>
            <small>
              From Diamond &amp; Co., {studio.address.street.text}
              <Mark note={studio.address.street.marker} />, {studio.address.city}.
            </small>
          </span>
        </label>
      </fieldset>

      <div className={styles.promise}>
        <p className={styles.promiseHeading}>The Render-First Promise</p>
        <p>
          You approve a drawing and a render before any metal is cut, and your stone never leaves
          our bench.
          <Mark note="confirm revisions, walk-away terms, deposit" />
        </p>
      </div>

      {sendState === 'rate-limited' && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={noticeRef}>
          <p className={styles.summaryHeading}>Too many tries from this connection</p>
          <p className={styles.summaryText}>
            We&apos;ve had several requests from here in the last hour
            <Mark note="confirm" />. Wait an hour and send it again, or call{' '}
            <a href={studio.phone.href}>{studio.phone.text}</a>
            <Mark note={studio.phone.marker} />. Your answers are still here.
          </p>
        </div>
      )}
      {sendState === 'failed' && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={noticeRef}>
          <p className={styles.summaryHeading}>We couldn&apos;t send this</p>
          <p className={styles.summaryText}>
            Something went wrong on our side. Try again, or call{' '}
            <a href={studio.phone.href}>{studio.phone.text}</a>
            <Mark note={studio.phone.marker} />. Your answers and photos are still here.
          </p>
        </div>
      )}

      <Turnstile />

      <Button variant="primary" type="submit" className={styles.submit}>
        {SUBMIT_LABELS[sendState]}
      </Button>

      {sendState === 'sending' ? (
        <p className={styles.after}>Sending your photos and answers. Keep this page open.</p>
      ) : calendlyUrl ? (
        <p className={styles.after}>
          Next, you pick a consultation time on this page
          <Mark note="confirm" />. Nothing is charged until you agree.
        </p>
      ) : (
        <p className={styles.after}>
          [GOLDSMITH] replies within one business day
          <Mark note="confirm" />. Nothing is booked or charged until you agree.
        </p>
      )}
      <p className={styles.call}>
        Rather talk? Call <a href={studio.phone.href}>{studio.phone.text}</a>
        <Mark note={studio.phone.marker} />
      </p>
    </form>
  )

  return (
    <>
      {form}
      {calendlyUrl && prefill && (
        <CalendlyStep link={calendlyUrl} heading={Heading} prefill={prefill} onBack={() => setPrefill(null)} />
      )}
    </>
  )
}
