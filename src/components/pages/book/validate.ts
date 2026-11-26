import { bookInquirySchema } from '@/inquiry/schema'

import { photoError } from './photo'

export const BOOK_FIELDS = ['name', 'email', 'photo'] as const

export type BookField = (typeof BOOK_FIELDS)[number]

export type BookAnswers = {
  name: string
  email: string
  photo: File | null
}

export type BookErrors = Partial<Record<BookField, string>>

const isBookField = (key: unknown): key is BookField => BOOK_FIELDS.some((field) => field === key)

export function validateBook({ name, email, photo }: BookAnswers): BookErrors {
  const errors: BookErrors = {}
  const result = bookInquirySchema.safeParse({ form: 'book', name, email })
  for (const issue of result.error?.issues ?? []) {
    const field = issue.path[0]
    if (isBookField(field) && errors[field] === undefined) errors[field] = issue.message
  }
  const photoProblem = photo && photoError(photo)
  if (photoProblem) errors.photo = photoProblem
  return errors
}
