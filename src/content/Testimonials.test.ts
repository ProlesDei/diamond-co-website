import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Field } from 'payload'

import { toShownTestimonial } from '../components/home/trust/testimonials'
import { TestimonialProofs } from '../media/TestimonialProofs'
import { Testimonials } from './Testimonials'

const field = (name: string) => {
  const found = Testimonials.fields.find((candidate: Field) => 'name' in candidate && candidate.name === name)
  assert.ok(found, `no ${name} field`)
  return found as Field & Record<string, unknown>
}

test('a testimonial is a Google review or a personal one', () => {
  const source = field('source')
  assert.equal(source.type, 'select')
  assert.equal(source.required, true)
  assert.deepEqual((source.options as { value: string }[]).map(({ value }) => value), ['google', 'personal'])
})

test('a testimonial needs a name and the quote', () => {
  assert.equal(field('firstName').required, true)
  assert.equal(field('firstName').label, 'Name')
  assert.equal(field('quote').required, true)
})

test('the proof screenshot is an optional upload to its own collection', () => {
  const proof = field('proof')
  assert.equal(proof.type, 'upload')
  assert.equal(proof.relationTo, TestimonialProofs.slug)
  assert.notEqual(proof.required, true)
  assert.ok(TestimonialProofs.upload)
})

test('visitors see only proofs that a published testimonial with consent shows', async () => {
  let asked: unknown
  const req = {
    user: null,
    payload: {
      find: async (args: unknown) => {
        asked = args
        return { docs: [{ proof: 'p1' }, { proof: { id: 'p2' } }, { proof: null }] }
      },
    },
  }
  const read = TestimonialProofs.access?.read
  assert.ok(read)
  assert.deepEqual(await read({ req } as never), { id: { in: ['p1', 'p2'] } })
  assert.deepEqual((asked as { where: unknown }).where, {
    _status: { equals: 'published' },
    consentOnFile: { equals: true },
    proof: { exists: true },
  })
  assert.equal(await read({ req: { ...req, user: { id: 'staff' } } } as never), true)
})

test('each shown testimonial carries its source label and any proof', () => {
  const proof = { id: 'p1', alt: 'Google review, 5 stars', url: '/api/testimonial-proofs/file/review.png', width: 600, height: 300, updatedAt: '', createdAt: '' }
  assert.deepEqual(toShownTestimonial({ id: 't1', firstName: 'Sam', quote: 'Lovely ring.', source: 'google', proof }), {
    id: 't1',
    name: 'Sam',
    quote: 'Lovely ring.',
    sourceLabel: 'Google review',
    proof: { url: proof.url, alt: proof.alt, width: 600, height: 300 },
  })
  const older = toShownTestimonial({ id: 't2', firstName: 'Jo', quote: 'Thank you.', source: null, proof: null })
  assert.equal(older.sourceLabel, 'Personal testimonial')
  assert.equal(older.proof, null)
})
