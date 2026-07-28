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
