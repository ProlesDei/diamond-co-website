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

const requiredChoice = (message: string) => z.string({ error: message }).trim().min(1, message)

// The visitor answers only these; Calendly asks their name and email when they pick a time.
// Keys an older page still sends, such as name or uploadIds, are dropped, not saved.
export const bookInquirySchema = z.object({
  form: z.literal('book'),
  pieceType: requiredChoice('Choose the kind of piece, or "Something else".'),
  budget: requiredChoice('Choose a range, or "Not sure yet". It helps us suggest stones and metals.'),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH, 'Keep the description to 2,000 characters.').optional(),
  piece: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Not a valid piece.')
    .optional(),
})

export type BookInquiryInput = z.infer<typeof bookInquirySchema>
