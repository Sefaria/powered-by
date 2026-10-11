import { describe, expect, it } from 'vitest'
import { formatDate, formatNumber, pluralize } from '../format'

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
