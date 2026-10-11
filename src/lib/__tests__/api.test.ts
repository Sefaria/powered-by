import { describe, expect, it, vi } from 'vitest'
import { ApiError, fetchProjects } from '../api'
import { makeRaw } from '../../test/factories'

const respond = (body: unknown, init: ResponseInit = {}) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), init))

describe('fetchProjects', () => {
  it('requests once and returns normalised, visible projects', async () => {
    const fetchImpl = respond({
      projects: [makeRaw({ id: 1 }), makeRaw({ id: 2, is_published: false })],
    })
    const projects = await fetchProjects(undefined, fetchImpl)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(projects.map((p) => p.id)).toEqual([1])
  })

  it('throws ApiError on a non-OK status', async () => {
    const fetchImpl = respond({}, { status: 500 })
    await expect(fetchProjects(undefined, fetchImpl)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
  })

  it('throws ApiError on an unexpected shape', async () => {
    await expect(fetchProjects(undefined, respond({ nope: true }))).rejects.toBeInstanceOf(ApiError)
  })
})
