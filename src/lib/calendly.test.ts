import assert from 'node:assert/strict'
import { test } from 'node:test'

import { bookingLink, CALENDLY_PLACEHOLDER_LINK, calendlyPrefillUrl, readCalendlyLink } from './calendly'

test('the prefill puts the name and email in Calendly’s name and email parameters', () => {
  const url = new URL(
    calendlyPrefillUrl('https://calendly.com/studio/consultation', { name: 'Sam Lee', email: 'sam+ring@example.com' }),
  )
  assert.equal(url.origin + url.pathname, 'https://calendly.com/studio/consultation')
  assert.equal(url.searchParams.get('name'), 'Sam Lee')
  assert.equal(url.searchParams.get('email'), 'sam+ring@example.com')
  assert.deepEqual([...url.searchParams.keys()], ['name', 'email'])
})

test('the prefill keeps the event link’s own parameters and encodes the values', () => {
  const href = calendlyPrefillUrl('https://calendly.com/studio/consultation?hide_gdpr_banner=1', {
    name: 'Ana & Jo',
    email: 'ana@example.com',
  })
  assert.equal(href, 'https://calendly.com/studio/consultation?hide_gdpr_banner=1&name=Ana+%26+Jo&email=ana%40example.com')
})

test('only https://calendly.com links with a path count', () => {
  assert.equal(readCalendlyLink('https://calendly.com/studio/consultation'), 'https://calendly.com/studio/consultation')
  for (const link of ['https://calendly.com/', 'http://calendly.com/studio', 'https://calendly.com.evil.test/x', 'https://evil.test/calendly.com/x', '', null, undefined]) {
    assert.equal(readCalendlyLink(link), null, String(link))
  }
})

test('the booking link is the saved link, or the named placeholder when none is saved', () => {
  assert.equal(bookingLink('https://calendly.com/studio/consultation'), 'https://calendly.com/studio/consultation')
  assert.equal(bookingLink(null), CALENDLY_PLACEHOLDER_LINK)
  assert.equal(bookingLink('https://evil.test/x'), CALENDLY_PLACEHOLDER_LINK)
  assert.match(CALENDLY_PLACEHOLDER_LINK, /^https:\/\/calendly\.com\/diamond-co-placeholder\//)
})
