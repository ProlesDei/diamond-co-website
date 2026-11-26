import { z } from 'zod'

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

export const EMAIL_MAX_LENGTH = 254

// The visitor gives only these. Keys an older page still sends, such as pieceType or budget, are dropped, not saved.
export const bookInquirySchema = z.object({
  form: z.literal('book'),
  name: z
    .string({ error: 'Add your name.' })
    .trim()
    .min(1, 'Add your name.')
    .max(NAME_MAX_LENGTH, `Keep your name to ${NAME_MAX_LENGTH} characters.`),
  email: z
    .string({ error: 'Add your email address.' })
    .trim()
    .max(EMAIL_MAX_LENGTH, { error: `Keep your email address to ${EMAIL_MAX_LENGTH} characters.`, abort: true })
    .pipe(z.email('Add an email address like name@example.com.')),
  uploadId: z
    .string()
    .regex(/^[0-9a-f]{24}$/, 'Not a valid upload id.')
    .optional(),
  piece: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Not a valid piece.')
    .optional(),
})

export type BookInquiryInput = z.infer<typeof bookInquirySchema>
