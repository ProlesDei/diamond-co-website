import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MAX_PHOTO_BYTES, NOT_A_PHOTO } from './photo'
import { BOOK_FIELDS, validateBook } from './validate'

const photo = (name: string, type: string, size = 1024) => ({ name, type, size }) as File

test('the form asks only a name, an email and an optional photo', () => {
  assert.deepEqual(BOOK_FIELDS, ['name', 'email', 'photo'])
})

test('a name and an email are enough to send', () => {
  assert.deepEqual(validateBook({ name: 'Sam', email: 'sam@example.com', photo: null }), {})
})

test('missing answers are named per field', () => {
  assert.deepEqual(Object.keys(validateBook({ name: '', email: 'nope', photo: null })).sort(), ['email', 'name'])
})

test('the photo must be a photo of 10 MB or less', () => {
  const answers = { name: 'Sam', email: 'sam@example.com' }
  assert.deepEqual(validateBook({ ...answers, photo: photo('ring.jpg', 'image/jpeg') }), {})
  assert.deepEqual(validateBook({ ...answers, photo: photo('IMG_1.HEIC', '') }), {})
  assert.equal(validateBook({ ...answers, photo: photo('quote.pdf', 'application/pdf') }).photo, NOT_A_PHOTO)
  assert.match(validateBook({ ...answers, photo: photo('big.jpg', 'image/jpeg', MAX_PHOTO_BYTES + 1) }).photo ?? '', /10 MB/)
})
