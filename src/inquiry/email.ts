import type { Payload, SendEmailOptions } from 'payload'

import type { Inquiry, InquirySetting } from '@/payload-types'

import { INTEREST_LABELS } from './schema'

const LINE_BREAKS_AND_CONTROLS = /[\p{Cc}\p{Zl}\p{Zp}]+/gu

function errorKind(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown error'
}

function oneLine(text: string | null | undefined): string {
  return (text ?? '').replace(LINE_BREAKS_AND_CONTROLS, ' ').trim()
}

function staffSummary(inquiry: Inquiry, adminUrl: string): string {
  const interests = (inquiry.interests ?? []).map((interest) => INTEREST_LABELS[interest])
  return [
    `A new booking request came in: ${inquiry.reference}.`,
    '',
    `Name: ${oneLine(inquiry.name)}`,
    `Email or phone: ${oneLine(inquiry.contact)}`,
    `Interested in: ${interests.length > 0 ? interests.join(', ') : 'not given'}`,
    `Need by: ${inquiry.needBy || 'not given'}`,
    `Photo or sketch: ${inquiry.upload ? 'attached in the admin' : 'none'}`,
    `Wants news of new work: ${inquiry.newsOptIn ? 'yes' : 'no'}`,
    '',
    `Open it in the admin: ${adminUrl}`,
  ].join('\n')
}

type Choice = { label: string; value: string }

function labelFor(choices: Choice[] | null | undefined, value: string | null | undefined): string {
  return oneLine(choices?.find((choice) => choice.value === value)?.label ?? value)
}

function bookSummary(inquiry: Inquiry, settings: InquirySetting, adminUrl: string): string {
  const piece = typeof inquiry.piece === 'object' && inquiry.piece ? oneLine(inquiry.piece.title) : 'none'
  return [
    `A new booking request came in: ${inquiry.reference}.`,
    '',
    'Sent from: Book',
    `Piece type: ${labelFor(settings.pieceTypes, inquiry.pieceType)}`,
    `Budget range (CAD): ${labelFor(settings.budgetRanges, inquiry.budget)}`,
    `Piece asked about: ${piece}`,
    `Photos: ${(inquiry.uploads ?? []).length}, in the admin`,
    '',
    `Open it in the admin: ${adminUrl}`,
  ].join('\n')
}

function visitorReply(inquiry: Inquiry, settings: InquirySetting): string {
  return [
    `Hello ${oneLine(inquiry.name)},`,
    '',
    settings.autoReply?.trim() || 'Thank you for your booking request. We have it.',
    '',
    `Your reference is ${inquiry.reference}.`,
    ...(settings.responseTime?.trim() ? [`Expect our reply ${settings.responseTime.trim()}.`] : []),
  ].join('\n')
}

export async function sendInquiryEmails(payload: Payload, inquiry: Inquiry, adminUrl: string): Promise<void> {
  let settings: InquirySetting
  try {
    settings = await payload.findGlobal({ slug: 'inquiry-settings', depth: 0 })
  } catch (error) {
    console.error(`inquiry: could not read inquiry-settings for ${inquiry.reference} (${errorKind(error)}); no email sent.`)
    return
  }

  const sends: { kind: string; message: SendEmailOptions }[] = []
  const staff = (settings.alertRecipients ?? []).map((recipient) => recipient.email)
  if (staff.length > 0) {
    sends.push({
      kind: 'staff alert',
      message: {
        to: staff,
        subject: `New booking request ${inquiry.reference}`,
        text: inquiry.form === 'book' ? bookSummary(inquiry, settings, adminUrl) : staffSummary(inquiry, adminUrl),
      },
    })
  } else {
    console.error(`inquiry: no staff alert recipients in inquiry-settings, so no one was told of ${inquiry.reference}. Add one in the admin.`)
  }
  const visitorEmail = inquiry.form === 'book' ? (inquiry.email ?? '') : (inquiry.contact ?? '')
  if (visitorEmail.includes('@')) {
    sends.push({
      kind: 'auto-reply',
      message: {
        to: visitorEmail,
        subject: `We have your booking request, ${inquiry.reference}`,
        text: visitorReply(inquiry, settings),
      },
    })
  }

  const results = await Promise.allSettled(sends.map(async ({ message }) => payload.sendEmail(message)))
  const failures = results.flatMap((result, index) =>
    result.status === 'rejected' ? [`${sends[index].kind} (${errorKind(result.reason)})`] : [],
  )
  if (failures.length > 0) {
    console.error(`inquiry: email for ${inquiry.reference} failed: ${failures.join(', ')}. The request is saved.`)
  }
}
