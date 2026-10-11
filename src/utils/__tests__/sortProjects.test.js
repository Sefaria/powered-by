import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortProjects } from '../sortProjects.js'

function project(name, submissionDate) {
  return { project_name: name, submission_date: submissionDate }
}

test('sortProjects with "alphabetical" sorts by project_name ascending', () => {
  const projects = [project('Zeta'), project('alpha'), project('Beta')]
  const result = sortProjects(projects, 'alphabetical')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['alpha', 'Beta', 'Zeta'],
  )
})

test('sortProjects with "newest" sorts dated projects by submission_date descending', () => {
  const projects = [
    project('Old', '2026-01-01T00:00:00+00:00'),
    project('New', '2026-06-01T00:00:00+00:00'),
    project('Mid', '2026-03-01T00:00:00+00:00'),
  ]
  const result = sortProjects(projects, 'newest')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['New', 'Mid', 'Old'],
  )
})

test('sortProjects with "oldest" sorts dated projects by submission_date ascending', () => {
  const projects = [
    project('Old', '2026-01-01T00:00:00+00:00'),
    project('New', '2026-06-01T00:00:00+00:00'),
    project('Mid', '2026-03-01T00:00:00+00:00'),
  ]
  const result = sortProjects(projects, 'oldest')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['Old', 'Mid', 'New'],
  )
})

test('sortProjects with "newest" tails undated projects alphabetically after all dated ones', () => {
  const projects = [
    project('Zeta undated', null),
    project('Recent', '2026-06-01T00:00:00+00:00'),
    project('Alpha undated', undefined),
    project('Early', '2026-01-01T00:00:00+00:00'),
  ]
  const result = sortProjects(projects, 'newest')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['Recent', 'Early', 'Alpha undated', 'Zeta undated'],
  )
})

test('sortProjects with "oldest" also tails undated projects alphabetically after all dated ones', () => {
  const projects = [
    project('Zeta undated', null),
    project('Recent', '2026-06-01T00:00:00+00:00'),
    project('Alpha undated', undefined),
    project('Early', '2026-01-01T00:00:00+00:00'),
  ]
  const result = sortProjects(projects, 'oldest')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['Early', 'Recent', 'Alpha undated', 'Zeta undated'],
  )
})

test('sortProjects treats an unparseable submission_date the same as a missing one', () => {
  const projects = [
    project('Bad date', 'not a date'),
    project('Good date', '2026-01-01T00:00:00+00:00'),
  ]
  const result = sortProjects(projects, 'newest')
  assert.deepEqual(
    result.map((p) => p.project_name),
    ['Good date', 'Bad date'],
  )
})

test('sortProjects does not mutate the input array', () => {
  const projects = [project('B'), project('A')]
  const original = [...projects]
  sortProjects(projects, 'alphabetical')
  assert.deepEqual(projects, original)
})
