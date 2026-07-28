import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getSubmissionsTrendByExperience } from './submissionsTrend.js'

const referenceDate = new Date(2026, 6, 15) // July 2026

test('getSubmissionsTrendByExperience returns [] when no project has a parseable date', () => {
  const projects = [
    { tags: ['Date unspecified'], technical_experience: 'None' },
    { tags: [], technical_experience: 'Beginner' },
  ]
  assert.deepEqual(getSubmissionsTrendByExperience(projects, referenceDate), [])
})

test('getSubmissionsTrendByExperience spans from the earliest submission through referenceDate, zero-filled', () => {
  const projects = [
    { tags: ['May 2026'], technical_experience: 'None' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})

test('getSubmissionsTrendByExperience buckets each level independently per month', () => {
  const projects = [
    { tags: ['May 2026'], technical_experience: 'None' },
    { tags: ['May 2026'], technical_experience: '<5 years' },
    { tags: ['May 2026'], technical_experience: '<5 years' },
    { tags: ['July 2026'], technical_experience: '5-10 years' },
    { tags: ['July 2026'], technical_experience: '10+ years' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 2, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 1, Advanced: 1 },
  ])
})

test('getSubmissionsTrendByExperience returns [] when every parseable project has unspecified experience', () => {
  const projects = [
    { tags: ['July 2026'], technical_experience: '' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [])
})

test('getSubmissionsTrendByExperience ignores unspecified-experience months when finding the earliest month', () => {
  const projects = [
    // Unspecified experience, earlier date — should NOT push the chart's start back.
    { tags: ['January 2026'], technical_experience: '' },
    { tags: ['July 2026'], technical_experience: 'None' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'Jul 2026', 'No Experience': 1, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})
