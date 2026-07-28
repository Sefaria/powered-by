import { EXPERIENCE_LEVELS, getExperienceLevel } from './experience.js'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Tag dates look like "July 2026" or "Date unspecified".
function parseTagMonth(rawDate) {
  const match = /^([A-Za-z]+) (\d{4})$/.exec(rawDate ?? '')
  if (!match) return null

  const monthIndex = MONTH_NAMES.indexOf(match[1])
  if (monthIndex === -1) return null

  return { year: Number(match[2]), monthIndex }
}

function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

// Builds the 12 calendar months ending with referenceDate's month, oldest first.
function last12Months(referenceDate) {
  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), monthIndex: d.getMonth() })
  }
  return months
}

export function getSubmissionsMonthlyTrend(projects, referenceDate = new Date()) {
  const months = last12Months(referenceDate)

  const counts = new Map(months.map(({ year, monthIndex }) => [monthKey(year, monthIndex), 0]))

  for (const project of projects) {
    const [rawDate] = project.tags ?? []

    const parsed = parseTagMonth(rawDate)
    if (!parsed) continue

    const key = monthKey(parsed.year, parsed.monthIndex)
    if (counts.has(key)) {
      counts.set(key, counts.get(key) + 1)
    }
  }

  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    count: counts.get(monthKey(year, monthIndex)),
  }))
}

// Builds every calendar month from start through end (inclusive), oldest first.
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

export function getSubmissionsTrendByExperience(projects, referenceDate = new Date()) {
  const parsed = projects
    .map((project) => ({
      month: parseTagMonth(project.tags?.[0]),
      level: getExperienceLevel(project.technical_experience),
    }))
    .filter((entry) => entry.month !== null)

  if (parsed.length === 0) return []

  const earliest = parsed.reduce((earliestSoFar, entry) => {
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    return key < monthKey(earliestSoFar.year, earliestSoFar.monthIndex) ? entry.month : earliestSoFar
  }, parsed[0].month)

  const end = { year: referenceDate.getFullYear(), monthIndex: referenceDate.getMonth() }
  const months = monthsBetween(earliest, end)

  const counts = new Map(
    months.map(({ year, monthIndex }) => [
      monthKey(year, monthIndex),
      Object.fromEntries(EXPERIENCE_LEVELS.map((level) => [level, 0])),
    ]),
  )

  for (const entry of parsed) {
    if (entry.level === null) continue
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    if (counts.has(key)) {
      counts.get(key)[entry.level] += 1
    }
  }

  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    ...counts.get(monthKey(year, monthIndex)),
  }))
}
