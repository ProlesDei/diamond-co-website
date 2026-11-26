import assert from 'node:assert/strict'
import { test } from 'node:test'

import { sniff } from './sniff'

const bytes = (...parts: (number[] | string)[]) =>
  Buffer.concat(parts.map((part) => (typeof part === 'string' ? Buffer.from(part, 'latin1') : Buffer.from(part))))

test('the upload takes JPG, PNG and HEIC photos by their bytes', () => {
  assert.equal(sniff(bytes([0xff, 0xd8, 0xff, 0xe0]))?.mimetype, 'image/jpeg')
  assert.equal(sniff(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mimetype, 'image/png')
  assert.equal(sniff(bytes([0, 0, 0, 0x18], 'ftypheic'))?.mimetype, 'image/heic')
})

test('the upload refuses anything else, whatever its name says', () => {
  assert.equal(sniff(bytes('%PDF-1.7')), undefined)
  assert.equal(sniff(bytes('GIF89a')), undefined)
  assert.equal(sniff(bytes('<svg xmlns="http://www.w3.org/2000/svg"/>')), undefined)
  assert.equal(sniff(Buffer.alloc(0)), undefined)
})
