'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { z } from 'zod'

import { Button } from '@/components/site/Button'
import { isEmailOrPhone } from '@/inquiry/contact'
import { sendFile } from '@/inquiry/directUpload'
import { INTEREST_LABELS, INTERESTS } from '@/inquiry/schema'
import type { InquiryInput } from '@/inquiry/schema'

import styles from './booking.module.css'
import { Field } from './Field'
import { Turnstile, useTurnstile } from './turnstile'

const BYTES_PER_MB = 1024 * 1024
const MAX_FILE_BYTES = 10 * BYTES_PER_MB

const NAME_ID = 'booking-name'
const CONTACT_ID = 'booking-contact'
const FILE_ID = 'booking-file'

const COUNT_WORDS = ['', 'One thing', 'Two things', 'Three things']

type Problem = { id: string; error: string; summary: string }

type SendState = 'idle' | 'sending' | 'failed'

type Upload = { file: File; uploadId: string }

const uploadAnswer = z.object({ uploadId: z.string() })

async function postMultipart(file: File, token: string): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/inquiry/upload', {
    method: 'POST',
    headers: { 'x-turnstile-token': token },
    body,
  })
  if (!response.ok) throw new Error(`The upload route answered HTTP ${response.status}.`)
  return uploadAnswer.parse(await response.json()).uploadId
}

async function uploadFile(file: File, token: string): Promise<string> {
  const result = await sendFile({
    file,
    filename: file.name,
    turnstileToken: token,
    multipart: async () => ({ outcome: 'added', uploadId: await postMultipart(file, token) }),
  })
  if (result.outcome !== 'added') throw new Error(`The upload was ${result.outcome}.`)
  return result.uploadId
}

async function sendInquiry(input: InquiryInput, token: string): Promise<void> {
  const response = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...input, turnstileToken: token }),
  })
  if (!response.ok) throw new Error(`The inquiry route answered HTTP ${response.status}.`)
}

function megabytes(file: File): string {
  return `${(Math.ceil((file.size / BYTES_PER_MB) * 10) / 10).toFixed(1)} MB`
}

function describeFile(file: File): string {
  const size =
    file.size < BYTES_PER_MB ? `${Math.max(1, Math.round(file.size / 1024))} KB` : megabytes(file)
  return `${file.name} · ${size}`
}

function fileProblem(file: File | undefined): Problem | undefined {
  if (!file || file.size <= MAX_FILE_BYTES) return undefined
  return {
    id: FILE_ID,
    error: `That file is ${megabytes(file)}, over our 10 MB limit. Choose a smaller one, or bring it to your consultation.`,
    summary: 'Choose a photo under 10 MB',
  }
}

function nameProblem(name: string): Problem | undefined {
  if (name.trim()) return undefined
  return {
    id: NAME_ID,
    error: 'Add your name so we know who to reply to.',
    summary: 'Add your name',
  }
}

function contactProblem(contact: string): Problem | undefined {
  if (!contact.trim()) {
    return {
      id: CONTACT_ID,
      error: 'Add an email address or a phone number so [GOLDSMITH] can reply.',
      summary: 'Add an email address or a phone number',
    }
  }
  if (isEmailOrPhone(contact)) return undefined
  return {
    id: CONTACT_ID,
    error: 'That doesn’t look like an email address or a phone number. Check it and try again.',
    summary: 'Check your email or phone',
  }
}

export function BookingForm() {
  const [file, setFile] = useState<File | undefined>()
  const [nameError, setNameError] = useState<Problem | undefined>()
  const [contactError, setContactError] = useState<Problem | undefined>()
  const [summaryShown, setSummaryShown] = useState(false)
  const [sendState, setSendState] = useState<SendState>('idle')
  const [sentName, setSentName] = useState<string | undefined>()
  const summaryRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)
  const sendingRef = useRef(false)
  const uploadRef = useRef<Upload | undefined>(undefined)
  const { getToken } = useTurnstile()

  const fileError = fileProblem(file)
  const problems = [nameError, contactError, fileError].filter((problem) => problem !== undefined)

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0])
  }

  // A chosen file that already uploaded is not sent again, so a retry after a failed request reuses it.
  async function uploadIdFor(chosen: File): Promise<string> {
    if (uploadRef.current?.file === chosen) return uploadRef.current.uploadId
    const uploadId = await uploadFile(chosen, await getToken())
    uploadRef.current = { file: chosen, uploadId }
    return uploadId
  }

  async function send(input: Omit<InquiryInput, 'uploadId'>, chosen: File | undefined) {
    try {
      const uploadId = chosen ? await uploadIdFor(chosen) : undefined
      await sendInquiry({ ...input, uploadId }, await getToken())
    } catch {
      flushSync(() => setSendState('failed'))
      summaryRef.current?.focus()
      return
    } finally {
      sendingRef.current = false
    }
    flushSync(() => setSentName(input.name.trim().split(/\s+/)[0]))
    sentRef.current?.focus()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingRef.current) return
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '')
    const contact = String(data.get('contact') ?? '')
    const nextName = nameProblem(name)
    const nextContact = contactProblem(contact)
    const hasGaps = Boolean(nextName || nextContact || fileError)
    if (!hasGaps) sendingRef.current = true
    flushSync(() => {
      setNameError(nextName)
      setContactError(nextContact)
      setSummaryShown(hasGaps)
      setSendState(hasGaps ? 'idle' : 'sending')
    })
    if (hasGaps) {
      summaryRef.current?.focus()
      return
    }

    const kinds = data.getAll('kind')
    const needBy = String(data.get('date') ?? '')
    void send(
      {
        name,
        contact,
        interests: INTERESTS.filter((interest) => kinds.includes(interest)),
        needBy: needBy || undefined,
        newsOptIn: data.get('news') !== null,
      },
      file,
    )
  }

  if (sentName !== undefined) {
    return (
      <div className={styles.sent} tabIndex={-1} ref={sentRef}>
        <p className={styles.sentEyebrow}>Request sent</p>
        <h3 className={styles.formHeading}>Got it, {sentName}.</h3>
        <p>
          You&apos;ll hear from [GOLDSMITH] by [next business day]
          <span className={styles.confirm}>[confirm]</span> to set a time for your free consultation.
        </p>
        <p>
          Nothing is booked or charged until you agree. If a date matters, we&apos;ll say honestly
          whether we can make it.
        </p>
        <p className={styles.call}>
          Rather talk? Call <span className={styles.phone}>[PHONE]</span>
          <span className={styles.confirm}>[client supplies]</span>
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} method="post" noValidate onSubmit={submit}>
      <h3 className={styles.formHeading}>Book a free consultation</h3>
      <p className={styles.formIntro}>
        Tell us a little and [GOLDSMITH]<span className={styles.confirm}>[client supplies]</span>{' '}
        will reply to set a time. Two fields are all we need.
      </p>

      {sendState === 'failed' && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={summaryRef}>
          <p className={styles.summaryHeading}>
            We couldn&apos;t send this. Try again, or call [PHONE].
          </p>
        </div>
      )}

      {summaryShown && problems.length > 0 && (
        <div className={styles.summary} role="alert" tabIndex={-1} ref={summaryRef}>
          <p className={styles.summaryHeading}>
            {COUNT_WORDS[problems.length]} to fix before we can send this
          </p>
          <ul>
            {problems.map((problem) => (
              <li key={problem.id}>
                <a href={`#${problem.id}`}>{problem.summary}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field
        id={NAME_ID}
        label="Your name"
        error={nameError?.error}
        control={(props) => (
          <input className={styles.control} name="name" autoComplete="name" required {...props} />
        )}
      />

      <Field
        id={CONTACT_ID}
        label="Email or phone"
        error={contactError?.error}
        hint="Whichever you'd rather we reply on."
        control={(props) => (
          <input
            className={styles.control}
            name="contact"
            autoComplete="email"
            inputMode="email"
            required
            {...props}
          />
        )}
      />

      <fieldset className={styles.field}>
        <legend className={styles.label}>
          What are you thinking of? <span className={styles.optional}>(optional)</span>
        </legend>
        <div className={styles.chipRow}>
          {INTERESTS.map((interest) => (
            <label className={styles.chip} key={interest}>
              <input type="checkbox" name="kind" value={interest} />
              <span>{INTEREST_LABELS[interest]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        id={FILE_ID}
        label="Add a photo or sketch"
        optional
        error={fileError?.error}
        hint="A screenshot, a napkin sketch, or the stone you want to reuse. JPG, PNG, HEIC or PDF, up to 10 MB."
        control={(props) => (
          <span className={styles.drop}>
            <input
              className={styles.dropInput}
              type="file"
              name="file"
              accept=".jpg,.jpeg,.png,.heic,.pdf"
              onChange={chooseFile}
              {...props}
            />
            <span className={styles.dropButton} aria-hidden="true">
              Choose a file
            </span>
            <span className={styles.dropName}>{file ? describeFile(file) : 'No file chosen'}</span>
          </span>
        )}
      />

      <Field
        id="booking-date"
        label="Need it by a date?"
        optional
        hint="A proposal? We'll tell you honestly if we can make it."
        control={(props) => (
          <input
            className={`${styles.control} ${styles.dateControl}`}
            type="date"
            name="date"
            {...props}
          />
        )}
      />

      <label className={styles.news}>
        <input type="checkbox" name="news" />
        <span>
          Also email me news of new work, a few times a year. I can unsubscribe at any time.
          <small>
            From Diamond &amp; Co., [street address]
            <span className={styles.confirm}>[confirm]</span>, White Rock, BC. Without this box
            ticked, we use your details only to reply to this request.
          </small>
        </span>
      </label>

      <div className={styles.promise}>
        <p className={styles.promiseHeading}>The Render-First Promise</p>
        <p>
          You approve a drawing and a render before any metal is cut, and your stone never leaves
          our bench.
          <span className={styles.confirm}>[confirm revisions, walk-away terms, deposit]</span>
        </p>
      </div>

      <Turnstile />

      <Button variant="primary" type="submit" className={styles.submit}>
        {sendState === 'sending' ? 'Sending...' : 'Request my consultation'}
      </Button>

      <p className={styles.after}>
        [GOLDSMITH] replies within one business day<span className={styles.confirm}>[confirm]</span>
        . Nothing is booked or charged until you agree.
      </p>
      <p className={styles.call}>
        Rather talk? Call <span className={styles.phone}>[PHONE]</span>
        <span className={styles.confirm}>[client supplies]</span>
      </p>
    </form>
  )
}
