import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getSubmissionsTrendByExperience, getSubmissionsTrendByVibeCoded } from './submissionsTrend.js'

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

test('getSubmissionsTrendByVibeCoded returns 12 zero-filled months when no project has a parseable date', () => {
  const referenceDate = new Date(2026, 6, 15) // July 2026
  const projects = [{ tags: ['Date unspecified'] }, {}]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  assert.equal(result.length, 12)
  assert.equal(result[11].month, 'Jul 2026')
  for (const entry of result) {
    assert.equal(entry['Vibe-coded'], 0)
    assert.equal(entry['Not vibe-coded'], 0)
  }
})

test('getSubmissionsTrendByVibeCoded buckets each project into the correct series for its month', () => {
  const referenceDate = new Date(2026, 6, 15) // July 2026
  const projects = [
    { tags: ['July 2026'], vibe_coded: true },
    { tags: ['July 2026'], vibe_coded: true },
    { tags: ['July 2026'], vibe_coded: false },
    { tags: ['June 2026'], vibe_coded: false },
  ]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  const july = result.find((entry) => entry.month === 'Jul 2026')
  const june = result.find((entry) => entry.month === 'Jun 2026')

  assert.deepEqual(july, { month: 'Jul 2026', 'Vibe-coded': 2, 'Not vibe-coded': 1 })
  assert.deepEqual(june, { month: 'Jun 2026', 'Vibe-coded': 0, 'Not vibe-coded': 1 })
})

test('getSubmissionsTrendByVibeCoded ignores projects with unparseable or missing dates', () => {
  const referenceDate = new Date(2026, 6, 15) // July 2026
  const projects = [
    { tags: ['July 2026'], vibe_coded: true },
    { tags: ['not a date'], vibe_coded: true },
    { vibe_coded: true },
  ]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  const july = result.find((entry) => entry.month === 'Jul 2026')
  assert.deepEqual(july, { month: 'Jul 2026', 'Vibe-coded': 1, 'Not vibe-coded': 0 })

  const total = result.reduce((sum, entry) => sum + entry['Vibe-coded'] + entry['Not vibe-coded'], 0)
  assert.equal(total, 1)
})
