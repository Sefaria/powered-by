import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getTechCounts } from './techUsed.js'

test('getTechCounts counts a known technology mentioned by one project', () => {
  const projects = [{ tech_used_raw: 'Next.js, Supabase, Vercel' }]
  const result = getTechCounts(projects)
  assert.deepEqual(result, [
    { label: 'Next.js', count: 1 },
    { label: 'Vercel', count: 1 },
    { label: 'Supabase', count: 1 },
  ])
})

test('getTechCounts is case-insensitive', () => {
  const projects = [{ tech_used_raw: 'REACT frontend, python3' }]
  const result = getTechCounts(projects)
  assert.deepEqual(result, [
    { label: 'React', count: 1 },
    { label: 'Python', count: 1 },
  ])
})

test('getTechCounts ignores projects with empty or missing tech_used_raw', () => {
  const projects = [{ tech_used_raw: '' }, {}, { tech_used_raw: 'React' }]
  const result = getTechCounts(projects)
  assert.deepEqual(result, [{ label: 'React', count: 1 }])
})

test('getTechCounts treats "Claude Code" and generic Claude/Anthropic mentions as separate, exclusive buckets', () => {
  const projects = [
    { tech_used_raw: 'Claude code, python3' },
    { tech_used_raw: 'Claude API (Anthropic)' },
  ]
  const result = getTechCounts(projects)
  assert.deepEqual(result, [
    { label: 'Claude Code', count: 1 },
    { label: 'Python', count: 1 },
    { label: 'Claude/Anthropic API', count: 1 },
  ])
})

test('getTechCounts sorts descending by count', () => {
  const projects = [
    { tech_used_raw: 'React' },
    { tech_used_raw: 'React, Vercel' },
    { tech_used_raw: 'React' },
  ]
  const result = getTechCounts(projects)
  assert.deepEqual(result, [
    { label: 'React', count: 3 },
    { label: 'Vercel', count: 1 },
  ])
})

test('getTechCounts returns at most the top 8 technologies', () => {
  const distinctSingleMentionTechs = [
    'Supabase', 'Deepgram', '.NET', 'C#', 'Avalonia', 'LiteDB', 'GitHub',
    'ChatGPT', 'Gemini', 'Base44', 'Discord', 'GCP', 'Lovable',
  ]
  const projects = distinctSingleMentionTechs.map((tech) => ({ tech_used_raw: tech }))
  const result = getTechCounts(projects)
  assert.equal(result.length, 8)
})
