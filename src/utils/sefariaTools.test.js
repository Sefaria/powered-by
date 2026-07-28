import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEndpoint, getToolUsageCounts } from './sefariaTools.js'

test('normalizeEndpoint strips a trailing slash', () => {
  assert.equal(normalizeEndpoint('/api/texts/'), '/api/texts')
})

test('normalizeEndpoint strips a query string', () => {
  assert.equal(normalizeEndpoint('/api/index?foo=bar'), '/api/index')
})

test('normalizeEndpoint collapses extra path segments onto the longest known base', () => {
  assert.equal(
    normalizeEndpoint('/api/v3/texts/Esther%201.1?version=french'),
    '/api/v3/texts',
  )
})

test('normalizeEndpoint prefers the longest matching known base', () => {
  assert.equal(normalizeEndpoint('/api/words/completion/foo/bar'), '/api/words/completion')
  assert.equal(normalizeEndpoint('/api/words/foo'), '/api/words')
})

test('normalizeEndpoint keeps an unrecognized endpoint as its own bucket', () => {
  assert.equal(normalizeEndpoint('/api/totally-unknown-thing'), '/api/totally-unknown-thing')
})

test('normalizeEndpoint trims whitespace', () => {
  assert.equal(normalizeEndpoint('  /api/index  '), '/api/index')
})

test('getToolUsageCounts returns [] when no project reports any tools', () => {
  const projects = [{ sefaria_tools_used: [] }, {}, { sefaria_tools_used: undefined }]
  assert.deepEqual(getToolUsageCounts(projects), [])
})

test('getToolUsageCounts counts each project once per normalized endpoint even with variant duplicates', () => {
  const projects = [
    { sefaria_tools_used: ['/api/texts', '/api/texts/'] }, // same project, same endpoint twice
    { sefaria_tools_used: ['/api/texts'] },
  ]
  assert.deepEqual(getToolUsageCounts(projects), [{ endpoint: '/api/texts', count: 2 }])
})

test('getToolUsageCounts sorts descending by count', () => {
  const projects = [
    { sefaria_tools_used: ['/api/index'] },
    { sefaria_tools_used: ['/api/calendars'] },
    { sefaria_tools_used: ['/api/calendars'] },
  ]
  assert.deepEqual(getToolUsageCounts(projects), [
    { endpoint: '/api/calendars', count: 2 },
    { endpoint: '/api/index', count: 1 },
  ])
})

test('getToolUsageCounts skips non-string entries instead of throwing', () => {
  const projects = [
    { sefaria_tools_used: [null, 42, '/api/index'] },
    { sefaria_tools_used: ['/api/index'] },
  ]
  assert.doesNotThrow(() => getToolUsageCounts(projects))
  assert.deepEqual(getToolUsageCounts(projects), [{ endpoint: '/api/index', count: 2 }])
})

test('getToolUsageCounts does not add an Other bucket at exactly 6 distinct endpoints', () => {
  const endpoints = ['/api/index', '/api/texts', '/api/calendars', '/api/words', '/api/name', '/api/related']
  const projects = endpoints.map((endpoint) => ({ sefaria_tools_used: [endpoint] }))
  const result = getToolUsageCounts(projects)
  assert.equal(result.length, 6)
  assert.equal(result.some((r) => r.endpoint === 'Other'), false)
})

test('getToolUsageCounts buckets past 6 distinct endpoints into Other', () => {
  // 6 endpoints used twice each (ranked 1-6), 3 endpoints used once each (fold into Other)
  const projects = [
    ...Array(2).fill({ sefaria_tools_used: ['/api/index'] }),
    ...Array(2).fill({ sefaria_tools_used: ['/api/texts'] }),
    ...Array(2).fill({ sefaria_tools_used: ['/api/calendars'] }),
    ...Array(2).fill({ sefaria_tools_used: ['/api/words'] }),
    ...Array(2).fill({ sefaria_tools_used: ['/api/name'] }),
    ...Array(2).fill({ sefaria_tools_used: ['/api/related'] }),
    { sefaria_tools_used: ['/api/shape'] },
    { sefaria_tools_used: ['/api/links'] },
    { sefaria_tools_used: ['/api/topics'] },
  ]
  const result = getToolUsageCounts(projects)
  assert.equal(result.length, 7)
  assert.deepEqual(result[6], { endpoint: 'Other', count: 3 })
  assert.equal(result.slice(0, 6).every((r) => r.count === 2), true)
})
