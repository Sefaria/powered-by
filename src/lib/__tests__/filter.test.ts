import { describe, expect, it } from 'vitest'
import {
  activeFilterCount,
  categoryCounts,
  DEFAULT_FILTERS,
  filterProjects,
  searchProjects,
} from '../filter'
import { fixtureProjects, makeProject } from '../../test/factories'

const projects = [
  makeProject({
    id: 1,
    project_name: 'Talmud Helper',
    project_desc: 'Study aid',
    project_category: 'Learning & Study Tools',
    tags: ['Gemara'],
  }),
  makeProject({
    id: 2,
    project_name: 'Bot',
    project_desc: 'Answers questions',
    project_category: 'AI Projects, Apps, & Other Tools Learning & Study Tools',
    sefaria_tools_used: ['/api/calendars/'],
    project_source_code: 'https://github.com/x/y',
  }),
  makeProject({
    id: 3,
    project_name: 'Chart',
    project_category: 'Visualization & Data Analysis',
    tags: ['Visual'],
  }),
]

const ids = (list: { id: number }[]) => list.map((p) => p.id)

describe('searchProjects', () => {
  it('returns everything for a blank query', () => {
    expect(searchProjects(projects, '  ')).toHaveLength(3)
  })
  it.each([
    ['talmud', [1]], // name, case-insensitive
    ['answers', [2]], // description
    ['gemara', [1]], // topic
    ['AI & Apps', [2]], // short category label
    ['calendars', [2]], // resource
  ])('matches %s', (q, expected) => {
    expect(ids(searchProjects(projects, q))).toEqual(expected)
  })
})

describe('filterProjects', () => {
  it('matches a project when its categories include the selected one', () => {
    expect(ids(filterProjects(projects, { ...DEFAULT_FILTERS, category: 'learn' }))).toEqual([1, 2])
  })
  it('combines search and category', () => {
    expect(ids(filterProjects(projects, { q: 'bot', category: 'ai' }))).toEqual([2])
    expect(filterProjects(projects, { q: 'bot', category: 'viz' })).toEqual([])
  })
})

describe('categoryCounts', () => {
  it('counts per category and reflects the current search, not the selected category', () => {
    expect(categoryCounts(projects, { q: '' })).toMatchObject({
      all: 3,
      learn: 2,
      ai: 1,
      viz: 1,
      ext: 0,
      community: 0,
      none: 0,
    })
    expect(categoryCounts(projects, { q: 'study aid' })).toMatchObject({
      all: 1,
      learn: 1,
      ai: 0,
    })
  })
  it('works on the fixture', () => {
    const counts = categoryCounts(fixtureProjects, { q: '' })
    expect(counts.all).toBe(133)
  })
})

describe('activeFilterCount', () => {
  it('counts the category, not search', () => {
    expect(activeFilterCount({ q: 'x', category: 'ai' })).toBe(1)
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: 'x' })).toBe(0)
  })
})
