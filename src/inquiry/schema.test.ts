import assert from 'node:assert/strict'
import { test } from 'node:test'

import { bookInquirySchema } from './schema'

const valid = { form: 'book', name: 'Sam Lee', email: 'sam@example.com' }

const fieldErrors = (input: unknown) => {
  const result = bookInquirySchema.safeParse(input)
  assert.equal(result.success, false)
  return new Set(result.error?.issues.map((issue) => issue.path[0]))
}

test('the book form takes a name and an email', () => {
  assert.deepEqual(bookInquirySchema.parse({ ...valid, name: '  Sam Lee ' }), valid)
})

test('the name and email are required', () => {
  assert.deepEqual(fieldErrors({ form: 'book' }), new Set(['name', 'email']))
  assert.deepEqual(fieldErrors({ ...valid, name: '   ' }), new Set(['name']))
})

test('the email must be an email address', () => {
  assert.deepEqual(fieldErrors({ ...valid, email: 'sam at example' }), new Set(['email']))
  assert.deepEqual(fieldErrors({ ...valid, email: `${'a'.repeat(250)}@example.com` }), new Set(['email']))
})

test('the reference photo is optional and must be an upload id', () => {
  const uploadId = '0123456789abcdef01234567'
  assert.equal(bookInquirySchema.parse({ ...valid, uploadId }).uploadId, uploadId)
  assert.deepEqual(fieldErrors({ ...valid, uploadId: '../etc/passwd' }), new Set(['uploadId']))
})

test('fields the form no longer asks are dropped, not saved', () => {
  const parsed = bookInquirySchema.parse({
    ...valid,
    reference: 'DC-2026-0001',
    pieceType: 'engagement-ring',
    budget: 'under-2500',
    description: 'A ring',
  })
  assert.deepEqual(Object.keys(parsed).sort(), ['email', 'form', 'name'])
})
