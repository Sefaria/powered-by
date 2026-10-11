import { describe, expect, it } from 'vitest'
import { parseQueryState, serializeQueryState, type QueryState } from '../url'

const base: QueryState = {
  q: '',
  category: 'all',
  openSourceOnly: false,
  sort: 'new',
  view: 'grid',
  project: null,
}

describe('query state', () => {
  it('omits defaults', () => {
    expect(serializeQueryState(base).toString()).toBe('')
  })

  it('round-trips every field', () => {
    const state: QueryState = {
      q: 'rav kook',
      category: 'viz',
      openSourceOnly: true,
      sort: 'az',
      view: 'list',
      project: 42,
    }
    const search = serializeQueryState(state).toString()
    expect(search).toBe('q=rav+kook&category=viz&open=1&sort=az&view=list&project=42')
    expect(parseQueryState(search)).toEqual(state)
  })

  it('falls back to defaults for invalid values', () => {
    expect(parseQueryState('category=bogus&sort=x&view=y&project=abc&open=0')).toEqual(base)
    expect(parseQueryState('project=-3').project).toBeNull()
    expect(parseQueryState('project=1.5').project).toBeNull()
  })

  it('uses the persisted view as the default', () => {
    expect(parseQueryState('', 'list').view).toBe('list')
    expect(serializeQueryState({ ...base, view: 'list' }, 'list').toString()).toBe('')
    expect(serializeQueryState({ ...base, view: 'grid' }, 'list').toString()).toBe('view=grid')
  })
})
