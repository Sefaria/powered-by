import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, hasValue } from '../projectDetail.js'

test('formatDate formats an ISO timestamp as a human-readable date', () => {
  assert.equal(formatDate('2026-08-16T10:25:42+00:00'), 'Aug 16, 2026')
})

test('formatDate returns an empty string for a falsy input', () => {
  assert.equal(formatDate(''), '')
  assert.equal(formatDate(null), '')
  assert.equal(formatDate(undefined), '')
})

test('formatDate returns an empty string for an unparseable input', () => {
  assert.equal(formatDate('not a date'), '')
})

test('hasValue is false for empty strings, null, undefined, and empty arrays', () => {
  assert.equal(hasValue(''), false)
  assert.equal(hasValue('   '), false)
  assert.equal(hasValue(null), false)
  assert.equal(hasValue(undefined), false)
  assert.equal(hasValue([]), false)
})

test('hasValue is true for a non-empty string and a non-empty array', () => {
  assert.equal(hasValue('React'), true)
  assert.equal(hasValue(['Search API']), true)
})

test('hasValue is true for a boolean true and false for boolean false', () => {
  assert.equal(hasValue(true), true)
  assert.equal(hasValue(false), false)
})
