const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

/** "Oct 8, 2026", always in UTC so it doesn't shift with the viewer's timezone. */
export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date)
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many
}
