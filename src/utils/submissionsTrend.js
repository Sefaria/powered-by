import { EXPERIENCE_LEVELS, getExperienceLevel } from './experience.js'

// The two series names used by the vibe-coded trend chart. Exported so the
// chart component can build its <Line> for each series without hardcoding
// the strings itself (keeps the "source of truth" for series names here).
export const VIBE_CODED_SERIES = ['Vibe-coded', 'Not vibe-coded']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// submission_date is an ISO timestamp like "2026-07-19T14:54:00+00:00", or
// null for projects that don't have one. Turns it into a { year, monthIndex }
// object in UTC, or null when there's nothing to parse. Uses UTC (not local
// time) so a project's month bucket doesn't shift depending on the viewer's
// timezone.
function parseSubmissionMonth(submissionDate) {
  if (!submissionDate) return null

  const date = new Date(submissionDate)
  if (Number.isNaN(date.getTime())) return null

  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() }
}

// Turns { year, monthIndex } into a string like "2026-07" — used as a Map
// key so months can be looked up/compared without worrying about JS Date
// object identity, and so keys sort correctly as plain strings.
function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

// Builds the 12 calendar months ending with `end`, oldest first.
function last12Months(end) {
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(end.year, end.monthIndex - i, 1)
    months.push({ year: d.getFullYear(), monthIndex: d.getMonth() })
  }
  return months
}

// Returns the most recently *completed* calendar month before referenceDate,
// as a { year, monthIndex } pair — e.g. if referenceDate is any day in
// August, this returns July, since August itself isn't over yet and its
// submission count is still incomplete.
function mostRecentCompletedMonth(referenceDate) {
  const d = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1))
  return { year: d.getUTCFullYear(), monthIndex: d.getUTCMonth() }
}

// Builds the data for SubmissionsTrendChart: total submission count per
// month, for the trailing 12 months ending at the most recently completed
// month before referenceDate.
export function getSubmissionsMonthlyTrend(projects, referenceDate = new Date()) {
  const months = last12Months(mostRecentCompletedMonth(referenceDate))

  // Start every month at 0 so months with no submissions still show up in
  // the chart instead of being skipped entirely.
  const counts = new Map(months.map(({ year, monthIndex }) => [monthKey(year, monthIndex), 0]))

  for (const project of projects) {
    const parsed = parseSubmissionMonth(project.submission_date)
    if (!parsed) continue // no submission_date — skip this project

    const key = monthKey(parsed.year, parsed.monthIndex)
    if (counts.has(key)) {
      // Only bump the count if the month is within our 12-month window —
      // a submission from 2 years ago would produce a key not in `counts`.
      counts.set(key, counts.get(key) + 1)
    }
  }

  // Recharts wants an array of plain objects, one per point on the x-axis,
  // so convert the Map back into that shape here.
  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    count: counts.get(monthKey(year, monthIndex)),
  }))
}

// Builds every calendar month from start through end (inclusive), oldest first.
// Unlike last12Months above, the range length here is variable — used when
// the chart's start point depends on the data rather than always being a
// fixed 12 months back.
function monthsBetween(start, end) {
  const months = []
  let cursor = new Date(start.year, start.monthIndex, 1)
  const endDate = new Date(end.year, end.monthIndex, 1)

  while (cursor.getTime() <= endDate.getTime()) {
    months.push({ year: cursor.getFullYear(), monthIndex: cursor.getMonth() })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  return months
}

// Builds the data for ExperienceTrendChart: one row per month, with a
// submission count for each of the 4 experience levels (No Experience,
// Beginner, Intermediate, Advanced) in that month.
export function getSubmissionsTrendByExperience(projects, referenceDate = new Date()) {
  const parsed = projects
    .map((project) => ({
      month: parseSubmissionMonth(project.submission_date),
      level: getExperienceLevel(project.technical_experience),
    }))
    .filter((entry) => entry.month !== null) // drop projects with no usable date

  if (parsed.length === 0) return [] // nothing to chart

  // Only consider entries with a known experience level when finding the
  // earliest month — otherwise leading months with unspecified experience
  // (but no actual experience data) stretch the chart with dead flat-zero lines.
  const withLevel = parsed.filter((entry) => entry.level !== null)
  if (withLevel.length === 0) return [] // every dated project has unknown experience — nothing meaningful to chart

  // Find the earliest month among entries that have a real experience
  // level, by comparing their string monthKeys (these sort correctly
  // because monthKey pads to a fixed "YYYY-MM" width).
  const earliest = withLevel.reduce((earliestSoFar, entry) => {
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    return key < monthKey(earliestSoFar.year, earliestSoFar.monthIndex) ? entry.month : earliestSoFar
  }, withLevel[0].month)

  const end = mostRecentCompletedMonth(referenceDate)
  const months = monthsBetween(earliest, end)

  // Each month starts with every experience level at 0, e.g.
  // { 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 }
  const counts = new Map(
    months.map(({ year, monthIndex }) => [
      monthKey(year, monthIndex),
      Object.fromEntries(EXPERIENCE_LEVELS.map((level) => [level, 0])),
    ]),
  )

  for (const entry of parsed) {
    if (entry.level === null) continue // unknown experience — don't attribute it to any level
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    if (counts.has(key)) {
      counts.get(key)[entry.level] += 1
    }
  }

  // Spread each month's per-level counts object into the result row
  // alongside its month label, e.g. { month: 'Jul 2026', 'No Experience': 1, Beginner: 0, ... }
  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    ...counts.get(monthKey(year, monthIndex)),
  }))
}

// Builds the data for VibeCodedTrendChart: one row per month, with a
// submission count for each of the 2 series ("Vibe-coded" / "Not
// vibe-coded") in that month. Always covers the trailing 12 months ending
// at the most recently completed month — unlike getSubmissionsTrendByExperience
// above, it doesn't hunt for an earliest-data month, so it can't return []
// the way that one can.
export function getSubmissionsTrendByVibeCoded(projects, referenceDate = new Date()) {
  const months = last12Months(mostRecentCompletedMonth(referenceDate))

  // Each month starts with both series at 0.
  const counts = new Map(
    months.map(({ year, monthIndex }) => [
      monthKey(year, monthIndex),
      Object.fromEntries(VIBE_CODED_SERIES.map((series) => [series, 0])),
    ]),
  )

  for (const project of projects) {
    const parsed = parseSubmissionMonth(project.submission_date)
    if (!parsed) continue // no submission_date — skip this project

    const key = monthKey(parsed.year, parsed.monthIndex)
    if (!counts.has(key)) continue // outside the trailing-12-months window

    const series = project.vibe_coded ? 'Vibe-coded' : 'Not vibe-coded'
    counts.get(key)[series] += 1
  }

  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    ...counts.get(monthKey(year, monthIndex)),
  }))
}
