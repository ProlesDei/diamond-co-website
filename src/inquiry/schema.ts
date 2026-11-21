import { z } from 'zod'

import { calendlyUrl } from '../lib/calendly'
import { isEmailOrPhone } from './contact'

export const INTERESTS = ['engagement-ring', 'redesign', 'wedding-band', 'not-sure'] as const

export type Interest = (typeof INTERESTS)[number]

export const INTEREST_LABELS: Record<Interest, string> = {
  'engagement-ring': 'Engagement ring',
  redesign: 'Redesign a piece I own',
  'wedding-band': 'Wedding band',
  'not-sure': 'Not sure yet',
}

export const NAME_MAX_LENGTH = 120
export const DESCRIPTION_MAX_LENGTH = 2000
export const MAX_UPLOADS = 5

export const CONTACT_WAYS = ['email', 'phone', 'text'] as const

export type ContactWay = (typeof CONTACT_WAYS)[number]

export const CONTACT_WAY_LABELS: Record<ContactWay, string> = {
  email: 'Email',
  phone: 'Phone call',
  text: 'Text message',
}

const uploadId = z.string().regex(/^[0-9a-f]{24}$/, 'Not a valid upload id.')

const needBy = z.iso.date('Use a real calendar date as YYYY-MM-DD.')

export const CONTACT_MAX_LENGTH = 254

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Add your name.').max(NAME_MAX_LENGTH, `Keep your name to ${NAME_MAX_LENGTH} characters.`),
  contact: z
    .string()
    .trim()
    .max(CONTACT_MAX_LENGTH, { error: `Keep your email or phone number to ${CONTACT_MAX_LENGTH} characters.`, abort: true })
    .refine(isEmailOrPhone, 'Add an email address or a phone number.'),
  interests: z
    .array(z.enum(INTERESTS))
    .refine((interests) => new Set(interests).size === interests.length, 'Choose each interest at most once.')
    .optional(),
  uploadId: uploadId.optional(),
  needBy: needBy.optional(),
  newsOptIn: z.boolean().default(false),
})

export type InquiryInput = z.infer<typeof inquirySchema>

const requiredChoice = (message: string) => z.string({ error: message }).trim().min(1, message)

const bookEmail = z
  .string({ error: 'Add your email address so we can reply.' })
  .trim()
  .min(1, { error: 'Add your email address so we can reply.', abort: true })
  .max(CONTACT_MAX_LENGTH, { error: `Keep your email address to ${CONTACT_MAX_LENGTH} characters.`, abort: true })
  .refine(
    (email) => email.includes('@') && isEmailOrPhone(email),
    'That doesn’t look like an email address. Check it and try again.',
  )

export const bookInquirySchema = z.object({
  form: z.literal('book'),
  pieceType: requiredChoice('Choose the kind of piece, or "Something else".'),
  budget: requiredChoice('Choose a range, or "Not sure yet". It helps us suggest stones and metals.'),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH, 'Keep the description to 2,000 characters.').optional(),
  name: z
    .string({ error: 'Add your name so we know who to reply to.' })
    .trim()
    .min(1, 'Add your name so we know who to reply to.')
    .max(NAME_MAX_LENGTH, `Keep your name to ${NAME_MAX_LENGTH} characters.`),
  email: calendlyUrl ? bookEmail.optional() : bookEmail,
  phone: z
    .string()
    .trim()
    .refine(
      (phone) => !phone.includes('@') && isEmailOrPhone(phone),
      'That doesn’t look like a phone number. Check it and try again.',
    )
    .optional(),
  contactWay: z.enum(CONTACT_WAYS, { error: 'Choose how we should reach you.' }),
  uploadIds: z
    .array(uploadId)
    .max(MAX_UPLOADS, "That's 5, our limit. Remove one to add another, or bring the rest to your consultation.")
    .refine((ids) => new Set(ids).size === ids.length, 'Add each photo once.')
    .optional(),
  needBy: needBy.optional(),
  newsOptIn: z.boolean().default(false),
  piece: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Not a valid piece.')
    .optional(),
})

export type BookInquiryInput = z.infer<typeof bookInquirySchema>
