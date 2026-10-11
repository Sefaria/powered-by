import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paginate } from '../pagination.js'

test('paginate returns the first page slice and correct totalPages for an exact multiple', () => {
  const items = Array.from({ length: 6 }, (_, i) => i)
  const result = paginate(items, 1, 2)
  assert.deepEqual(result.pageItems, [0, 1])
  assert.equal(result.totalPages, 3)
})

test('paginate returns the middle page slice', () => {
  const items = Array.from({ length: 6 }, (_, i) => i)
  const result = paginate(items, 2, 2)
  assert.deepEqual(result.pageItems, [2, 3])
  assert.equal(result.totalPages, 3)
})

test('paginate returns a partial last page when the count is not an exact multiple', () => {
  const items = Array.from({ length: 5 }, (_, i) => i)
  const result = paginate(items, 3, 2)
  assert.deepEqual(result.pageItems, [4])
  assert.equal(result.totalPages, 3)
})

test('paginate returns totalPages 1 and an empty pageItems for an empty list', () => {
  const result = paginate([], 1, 24)
  assert.deepEqual(result.pageItems, [])
  assert.equal(result.totalPages, 1)
})

test('paginate clamps a page number above totalPages down to the last page', () => {
  const items = Array.from({ length: 5 }, (_, i) => i)
  const result = paginate(items, 99, 2)
  assert.deepEqual(result.pageItems, [4])
  assert.equal(result.totalPages, 3)
})

test('paginate clamps a page number below 1 up to page 1', () => {
  const items = Array.from({ length: 5 }, (_, i) => i)
  const result = paginate(items, 0, 2)
  assert.deepEqual(result.pageItems, [0, 1])
  assert.equal(result.totalPages, 3)
})

test('paginate with a single page returns all items and totalPages 1', () => {
  const items = [1, 2, 3]
  const result = paginate(items, 1, 24)
  assert.deepEqual(result.pageItems, [1, 2, 3])
  assert.equal(result.totalPages, 1)
})
