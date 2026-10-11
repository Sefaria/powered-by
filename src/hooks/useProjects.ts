import { useCallback, useEffect, useState } from 'react'
import { fetchProjects } from '../lib/api'
import type { Project } from '../lib/project'

type Fetcher = (signal?: AbortSignal) => Promise<Project[]>

export type ProjectsState =
  | { status: 'loading'; projects: null; error: null }
  | { status: 'error'; projects: null; error: Error }
  | { status: 'success'; projects: Project[]; error: null }

// One request per fetcher: pages that mount later (e.g. /charts) reuse the result.
let cache = new WeakMap<Fetcher, Promise<Project[]>>()

/** For tests: forget every cached response. */
export function resetProjectsCache() {
  cache = new WeakMap()
}

function load(fetcher: Fetcher): Promise<Project[]> {
  let promise = cache.get(fetcher)
  if (!promise) {
    promise = fetcher()
    cache.set(fetcher, promise)
    promise.catch(() => cache.delete(fetcher)) // a failure must be retryable
  }
  return promise
}

/** The only way components get project data. Fetches once, then serves from memory. */
export function useProjects(
  fetcher: Fetcher = fetchProjects,
): ProjectsState & { retry: () => void } {
  const [state, setState] = useState<ProjectsState>({
    status: 'loading',
    projects: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    load(fetcher).then(
      (projects) => {
        if (!cancelled) setState({ status: 'success', projects, error: null })
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            projects: null,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [fetcher, attempt])

  const retry = useCallback(() => {
    cache.delete(fetcher)
    setState({ status: 'loading', projects: null, error: null })
    setAttempt((n) => n + 1)
  }, [fetcher])

  return { ...state, retry }
}
