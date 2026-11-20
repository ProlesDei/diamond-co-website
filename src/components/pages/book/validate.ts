import { bookInquirySchema } from '@/inquiry/schema'

export const BOOK_FIELDS = [
  'pieceType',
  'budget',
  'description',
  'name',
  'email',
  'privacyConsent',
] as const

export type BookField = (typeof BOOK_FIELDS)[number]

export type BookAnswers = {
  pieceType: string
  budget: string
  description: string
  name: string
  email: string
  privacyConsent: boolean
}

export type BookErrors = Partial<Record<BookField, string>>

const isBookField = (key: unknown): key is BookField => BOOK_FIELDS.some((field) => field === key)

// The schema also checks the other fields (phone, contact way); the form answers only these six.
export function validateBook(answers: BookAnswers): BookErrors {
  const result = bookInquirySchema.safeParse({ form: 'book', ...answers })
  const errors: BookErrors = {}
  if (result.success) return errors

  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (isBookField(field) && errors[field] === undefined) errors[field] = issue.message
  }
  return errors
}
