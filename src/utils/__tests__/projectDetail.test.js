import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, hasValue, isSafeUrl } from '../projectDetail.js'

test('formatDate formats an ISO timestamp as a human-readable date', () => {
  assert.equal(formatDate('2026-08-16T10:25:42+00:00'), 'Aug 16, 2026')
})

test('formatDate uses UTC so the date does not shift with the viewer local timezone', () => {
  // Just after UTC midnight: in negative-offset timezones (e.g. US) this would
  // roll back to the previous day if formatDate used local time instead of UTC.
  assert.equal(formatDate('2026-08-16T00:30:00Z'), 'Aug 16, 2026')
  // Just before UTC midnight: in positive-offset timezones this would roll
  // forward to the next day if formatDate used local time instead of UTC.
  assert.equal(formatDate('2026-08-16T23:30:00Z'), 'Aug 16, 2026')
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

test('hasValue is false for the number 0 and true for other numbers', () => {
  assert.equal(hasValue(0), false)
  assert.equal(hasValue(5), true)
})

test('isSafeUrl allows http and https URLs', () => {
  assert.equal(isSafeUrl('https://example.com'), true)
  assert.equal(isSafeUrl('http://example.com'), true)
})

test('isSafeUrl rejects javascript: URLs and other unsafe schemes', () => {
  assert.equal(isSafeUrl('javascript:alert(1)'), false)
  assert.equal(isSafeUrl('data:text/html,<script>alert(1)</script>'), false)
  assert.equal(isSafeUrl('ftp://example.com/file'), false)
})

test('isSafeUrl rejects malformed, empty, and non-string input', () => {
  assert.equal(isSafeUrl(''), false)
  assert.equal(isSafeUrl('not a url'), false)
  assert.equal(isSafeUrl(null), false)
  assert.equal(isSafeUrl(undefined), false)
})
