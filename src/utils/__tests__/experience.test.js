import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXPERIENCE_LEVELS, getExperienceLevel } from './experience.js'

test('EXPERIENCE_LEVELS is the fixed four-level order', () => {
  assert.deepEqual(EXPERIENCE_LEVELS, ['No Experience', 'Beginner', 'Intermediate', 'Advanced'])
})

test('getExperienceLevel maps known raw values to labels', () => {
  assert.equal(getExperienceLevel('None'), 'No Experience')
  assert.equal(getExperienceLevel('<5 years'), 'Beginner')
  assert.equal(getExperienceLevel('5-10 years'), 'Intermediate')
  assert.equal(getExperienceLevel('10+ years'), 'Advanced')
})

test('getExperienceLevel returns null for unspecified experience', () => {
  assert.equal(getExperienceLevel(''), null)
  assert.equal(getExperienceLevel(undefined), null)
})

test('getExperienceLevel returns null for an unrecognized raw value', () => {
  assert.equal(getExperienceLevel('not a real value'), null)
})
