import { describe, expect, it } from 'vitest'
import { getCategoryMeta, isCategoryId, parseCategories } from '../categories'

describe('parseCategories', () => {
  it('returns none for empty or unknown input', () => {
    expect(parseCategories(null)).toEqual(['none'])
    expect(parseCategories('')).toEqual(['none'])
    expect(parseCategories('Misc')).toEqual(['none'])
  })

  it('finds a single known label', () => {
    expect(parseCategories('Visualization & Data Analysis')).toEqual(['viz'])
    expect(parseCategories('Community, Interaction, & Social')).toEqual(['community'])
    expect(parseCategories('Extensions, API Integrations, & GitHub Code')).toEqual(['ext'])
  })

  it('returns all labels in order of appearance, with or without commas', () => {
    expect(
      parseCategories(
        'AI Projects, Apps, & Other Tools Learning & Study Tools,Community, Interaction, & Social',
      ),
    ).toEqual(['ai', 'learn', 'community'])
  })

  it('maps the legacy label and dedupes against the current one', () => {
    expect(parseCategories('Extensions and API Integrations')).toEqual(['ext'])
    expect(
      parseCategories(
        'Extensions and API Integrations Extensions, API Integrations, & GitHub Code',
      ),
    ).toEqual(['ext'])
  })
})

describe('category meta', () => {
  it('exposes short labels', () => {
    expect(getCategoryMeta('ai').shortLabel).toBe('AI & Apps')
    expect(getCategoryMeta('none').shortLabel).toBe('Uncategorized')
  })
  it('validates ids', () => {
    expect(isCategoryId('viz')).toBe(true)
    expect(isCategoryId('all')).toBe(false)
  })
})
