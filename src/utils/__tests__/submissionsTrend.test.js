import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getSubmissionsTrendByExperience, getSubmissionsTrendByVibeCoded } from '../submissionsTrend.js'

// Fixed "today" for every test below, so results are predictable instead of
// depending on when the test happens to run. August 15 2026 in local time —
// JS Date months are 0-indexed, so 7 means August. Charts only render data
// through the most recently *completed* month (July here), since August
// itself isn't over yet.
const referenceDate = new Date(2026, 7, 15) // August 2026

// --- getSubmissionsTrendByExperience -------------------------------------
// This function builds the data for ExperienceTrendChart: one row per
// month, with a count for each experience level (No Experience, Beginner,
// Intermediate, Advanced) in that month.

test('getSubmissionsTrendByExperience returns [] when no project has a usable submission_date', () => {
  // Neither project has a submission_date (null and missing both fail to
  // parse), so there's nothing to chart — the function should bail out to
  // an empty array rather than a chart full of zeros.
  const projects = [
    { submission_date: null, technical_experience: 'None' },
    { technical_experience: 'Beginner' },
  ]
  assert.deepEqual(getSubmissionsTrendByExperience(projects, referenceDate), [])
})

test('getSubmissionsTrendByExperience spans from the earliest submission through referenceDate, zero-filled', () => {
  // Only one project, submitted May 2026. The chart should still cover
  // every month from May through the reference month (July), not just the
  // one month that has data — June has no submissions, so it's zero-filled
  // rather than skipped.
  const projects = [
    { submission_date: '2026-05-10T10:00:00+00:00', technical_experience: 'None' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})

test('getSubmissionsTrendByExperience buckets each level independently per month', () => {
  // 5 projects across 2 months and multiple experience levels. This checks
  // that each level gets its own running count per month, independent of
  // the others — e.g. May should show 1 "No Experience" AND 2 "Beginner"
  // in the same row, and July's counts shouldn't leak into May's.
  const projects = [
    { submission_date: '2026-05-01T10:00:00+00:00', technical_experience: 'None' },
    { submission_date: '2026-05-15T10:00:00+00:00', technical_experience: '<5 years' },
    { submission_date: '2026-05-20T10:00:00+00:00', technical_experience: '<5 years' },
    { submission_date: '2026-07-02T10:00:00+00:00', technical_experience: '5-10 years' },
    { submission_date: '2026-07-25T10:00:00+00:00', technical_experience: '10+ years' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 2, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 1, Advanced: 1 },
  ])
})

test('getSubmissionsTrendByExperience returns [] when every dated project has unspecified experience', () => {
  // The date parses fine, but technical_experience is blank, so
  // getExperienceLevel can't map it to any of the 4 known levels. With no
  // project contributing a real level, there's nothing meaningful to
  // chart, so this should behave the same as "no data" (empty array).
  const projects = [
    { submission_date: '2026-07-10T10:00:00+00:00', technical_experience: '' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [])
})

test('getSubmissionsTrendByExperience ignores unspecified-experience months when finding the earliest month', () => {
  // Two projects: one in January with no usable experience level, one in
  // July with a real level. If the January entry were allowed to set the
  // chart's start month, the chart would open with 6 months of dead
  // zero-rows (Jan-Jun) before any real data shows up. This test locks in
  // that the January entry is skipped when picking the earliest month, so
  // the chart starts at July instead — see submissionsTrend.js's comment
  // on this exact behavior.
  const projects = [
    // Unspecified experience, earlier date — should NOT push the chart's start back.
    { submission_date: '2026-01-10T10:00:00+00:00', technical_experience: '' },
    { submission_date: '2026-07-10T10:00:00+00:00', technical_experience: 'None' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'Jul 2026', 'No Experience': 1, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})

// --- getSubmissionsTrendByVibeCoded ---------------------------------------
// This function builds the data for VibeCodedTrendChart: always exactly
// the trailing 12 months (unlike the experience trend above, which starts
// at the earliest real data), with a count of "Vibe-coded" vs.
// "Not vibe-coded" submissions per month.

test('getSubmissionsTrendByVibeCoded returns 12 zero-filled months when no project has a usable submission_date', () => {
  const referenceDate = new Date(2026, 7, 15) // August 2026 — most recently completed month is July
  // Neither project has a usable date, so every month should come back
  // zero-filled — but note this function always returns exactly 12 months
  // (the trailing year up to referenceDate) regardless of whether there's
  // any data, unlike getSubmissionsTrendByExperience above which returns []
  // when there's nothing to show.
  const projects = [{ submission_date: null }, {}]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  assert.equal(result.length, 12)
  assert.equal(result[11].month, 'Jul 2026') // last of the 12 months is always the most recently completed month
  for (const entry of result) {
    assert.equal(entry['Vibe-coded'], 0)
    assert.equal(entry['Not vibe-coded'], 0)
  }
})

test('getSubmissionsTrendByVibeCoded buckets each project into the correct series for its month', () => {
  const referenceDate = new Date(2026, 7, 15) // August 2026 — most recently completed month is July
  // 4 projects: 3 in July (2 vibe-coded, 1 not) and 1 in June (not
  // vibe-coded). Checks that each project's vibe_coded boolean routes it
  // into the right one of the two series, per month.
  const projects = [
    { submission_date: '2026-07-05T10:00:00+00:00', vibe_coded: true },
    { submission_date: '2026-07-12T10:00:00+00:00', vibe_coded: true },
    { submission_date: '2026-07-20T10:00:00+00:00', vibe_coded: false },
    { submission_date: '2026-06-15T10:00:00+00:00', vibe_coded: false },
  ]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  const july = result.find((entry) => entry.month === 'Jul 2026')
  const june = result.find((entry) => entry.month === 'Jun 2026')

  assert.deepEqual(july, { month: 'Jul 2026', 'Vibe-coded': 2, 'Not vibe-coded': 1 })
  assert.deepEqual(june, { month: 'Jun 2026', 'Vibe-coded': 0, 'Not vibe-coded': 1 })
})

test('getSubmissionsTrendByVibeCoded ignores projects with a missing submission_date', () => {
  const referenceDate = new Date(2026, 7, 15) // August 2026 — most recently completed month is July
  // 3 projects, only 1 with a real submission_date; the other 2 have null
  // and no submission_date field at all, respectively. Both bad ones should
  // be silently dropped rather than counted or causing an error — so the
  // total across all months should be exactly 1.
  const projects = [
    { submission_date: '2026-07-10T10:00:00+00:00', vibe_coded: true },
    { submission_date: null, vibe_coded: true },
    { vibe_coded: true },
  ]
  const result = getSubmissionsTrendByVibeCoded(projects, referenceDate)

  const july = result.find((entry) => entry.month === 'Jul 2026')
  assert.deepEqual(july, { month: 'Jul 2026', 'Vibe-coded': 1, 'Not vibe-coded': 0 })

  const total = result.reduce((sum, entry) => sum + entry['Vibe-coded'] + entry['Not vibe-coded'], 0)
  assert.equal(total, 1)
})
