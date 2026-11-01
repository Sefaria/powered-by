import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber, pluralize, stripWrappingQuotes } from '../format'

describe('format', () => {
  it('formats dates as MMM d, yyyy in UTC', () => {
    expect(formatDate(new Date('2026-07-19T23:59:00Z'))).toBe('Jul 19, 2026')
    expect(formatDate(new Date('2026-01-01T00:00:00Z'))).toBe('Jan 1, 2026')
  })
  it('formats numbers and plurals', () => {
    expect(formatNumber(1234)).toBe('1,234')
    expect(pluralize(1, 'project')).toBe('project')
    expect(pluralize(2, 'project')).toBe('projects')
  })
})

describe('stripWrappingQuotes', () => {
  it('strips straight quotes', () => {
    expect(stripWrappingQuotes('"Hello"')).toBe('Hello')
    expect(stripWrappingQuotes("'Hello'")).toBe('Hello')
  })
  it('strips curly quotes', () => {
    expect(stripWrappingQuotes('“Hello”')).toBe('Hello')
    expect(stripWrappingQuotes('‘Hello’')).toBe('Hello')
  })
  it('strips a quote at only one end', () => {
    expect(stripWrappingQuotes('"Hello')).toBe('Hello')
    expect(stripWrappingQuotes('Hello”')).toBe('Hello')
  })
  it('trims surrounding whitespace, inside and outside the quotes', () => {
    expect(stripWrappingQuotes('  \n “ Hello ” \n ')).toBe('Hello')
  })
  it('leaves text with no wrapping quotes, and inner quotes, alone', () => {
    expect(stripWrappingQuotes('Hello world')).toBe('Hello world')
    expect(stripWrappingQuotes('She said "hi" to me')).toBe('She said "hi" to me')
    expect(stripWrappingQuotes("It's fine")).toBe("It's fine")
  })
  it('returns an empty string for blank or quotes-only text', () => {
    expect(stripWrappingQuotes('   ')).toBe('')
    expect(stripWrappingQuotes('""')).toBe('')
  })
})
