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

const WRAPPING_QUOTES = /^[\s"“'‘’”]+|[\s"“'‘’”]+$/g

/** Trims the text and any straight or curly quote marks at its start or end, so we can add our own. */
export function stripWrappingQuotes(text: string): string {
  return text.replace(WRAPPING_QUOTES, '')
}
