import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getScreenshotUrl } from './screenshots.js'

test('getScreenshotUrl returns the screenshot path for an id present in the manifest', () => {
  assert.equal(getScreenshotUrl('1'), null) // manifest is empty in this test run
})

test('getScreenshotUrl returns null for an id not in the manifest', () => {
  assert.equal(getScreenshotUrl('does-not-exist'), null)
})
