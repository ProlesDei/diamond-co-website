import { bookInquirySchema } from '@/inquiry/schema'

export const BOOK_FIELDS = ['pieceType', 'budget', 'description'] as const

export type BookField = (typeof BOOK_FIELDS)[number]

export type BookAnswers = {
  pieceType: string
  budget: string
  description: string
}

export type BookErrors = Partial<Record<BookField, string>>

const isBookField = (key: unknown): key is BookField => BOOK_FIELDS.some((field) => field === key)

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
