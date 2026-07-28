import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEndpoint } from './sefariaTools.js'

test('normalizeEndpoint strips a trailing slash', () => {
  assert.equal(normalizeEndpoint('/api/texts/'), '/api/texts')
})

test('normalizeEndpoint strips a query string', () => {
  assert.equal(normalizeEndpoint('/api/index?foo=bar'), '/api/index')
})

test('normalizeEndpoint collapses extra path segments onto the longest known base', () => {
  assert.equal(
    normalizeEndpoint('/api/v3/texts/Esther%201.1?version=french'),
    '/api/v3/texts',
  )
})

test('normalizeEndpoint prefers the longest matching known base', () => {
  assert.equal(normalizeEndpoint('/api/words/completion/foo/bar'), '/api/words/completion')
  assert.equal(normalizeEndpoint('/api/words/foo'), '/api/words')
})

test('normalizeEndpoint keeps an unrecognized endpoint as its own bucket', () => {
  assert.equal(normalizeEndpoint('/api/totally-unknown-thing'), '/api/totally-unknown-thing')
})

test('normalizeEndpoint trims whitespace', () => {
  assert.equal(normalizeEndpoint('  /api/index  '), '/api/index')
})
