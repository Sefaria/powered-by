import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getPreviewUrl } from '../projectPreview.js'

test('getPreviewUrl returns the link for a normal, non-buggy, non-GitHub project', () => {
  const project = { project_link: 'https://chevruta.ai/', is_buggy: false }
  assert.equal(getPreviewUrl(project), 'https://chevruta.ai/')
})

test('getPreviewUrl returns null when project_link is missing or empty', () => {
  assert.equal(getPreviewUrl({ project_link: '', is_buggy: false }), null)
  assert.equal(getPreviewUrl({ project_link: null, is_buggy: false }), null)
  assert.equal(getPreviewUrl({ is_buggy: false }), null)
})

test('getPreviewUrl returns null when is_buggy is true', () => {
  const project = { project_link: 'https://example.com/', is_buggy: true }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for a github.com link', () => {
  const project = { project_link: 'https://github.com/someuser/somerepo', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for a *.github.io link', () => {
  const project = { project_link: 'https://someuser.github.io/someproject/', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for an unparseable project_link', () => {
  const project = { project_link: 'not a url', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for a javascript: URL', () => {
  const project = { project_link: 'javascript:alert(1)', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for a www.github.com link', () => {
  const project = { project_link: 'https://www.github.com/someuser/somerepo', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl returns null for a gist.github.com link', () => {
  const project = { project_link: 'https://gist.github.com/someuser/somegist', is_buggy: false }
  assert.equal(getPreviewUrl(project), null)
})

test('getPreviewUrl treats a missing is_buggy as not buggy', () => {
  const project = { project_link: 'https://example.com/' }
  assert.equal(getPreviewUrl(project), 'https://example.com/')
})
