import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getCategoryColor, KNOWN_CATEGORIES, UNCATEGORIZED } from '../categories.js'

test('getCategoryColor returns a distinct color for every known category', () => {
  const colors = KNOWN_CATEGORIES.map(getCategoryColor)
  assert.equal(new Set(colors).size, KNOWN_CATEGORIES.length)
  for (const color of colors) {
    assert.match(color, /^var\(--chart-[a-z]+\)$/)
  }
})

test('getCategoryColor returns a color for Uncategorized distinct from every known category', () => {
  const uncategorizedColor = getCategoryColor(UNCATEGORIZED)
  assert.match(uncategorizedColor, /^var\(--chart-[a-z]+\)$/)
  assert.equal(KNOWN_CATEGORIES.map(getCategoryColor).includes(uncategorizedColor), false)
})

test('getCategoryColor falls back to the Uncategorized color for an unrecognized label', () => {
  assert.equal(getCategoryColor('Not a real category'), getCategoryColor(UNCATEGORIZED))
})
