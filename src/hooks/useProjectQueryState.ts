import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  DEFAULT_VIEW,
  parseQueryState,
  serializeQueryState,
  type QueryState,
  type ViewMode,
} from '../lib/url'

const VIEW_KEY = 'pbs:view'

export function readStoredView(): ViewMode {
  try {
    const stored = window.localStorage.getItem(VIEW_KEY)
    return stored === 'list' || stored === 'grid' ? stored : DEFAULT_VIEW
  } catch {
    return DEFAULT_VIEW
  }
}

function storeView(view: ViewMode) {
  try {
    window.localStorage.setItem(VIEW_KEY, view)
  } catch {
    // storage unavailable (private mode, blocked): the preference just isn't remembered
  }
}

/** Marks history entries created by opening a project, so closing can go Back instead of stacking. */
interface DialogLocationState {
  projectDialog?: true
}

export interface ProjectQueryApi {
  state: QueryState
  /** Update filters, search, sort or view. Replaces history (no back-button spam). */
  update: (patch: Partial<Omit<QueryState, 'project'>>) => void
  /** Pushes history so Back closes the dialog. */
  openProject: (id: number) => void
  closeProject: () => void
  /** Silently drop an unknown ?project= id. */
  dropProject: () => void
}

/** URL is the source of truth for q, category, open, sort, view and project. */
export function useProjectQueryState(): ProjectQueryApi {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const defaultView = useState(readStoredView)[0]
  const state = useMemo(
    () => parseQueryState(searchParams, defaultView),
    [searchParams, defaultView],
  )

  const update = useCallback<ProjectQueryApi['update']>(
    (patch) => {
      if (patch.view) storeView(patch.view)
      setSearchParams(serializeQueryState({ ...state, ...patch }, defaultView), {
        replace: true,
        state: location.state,
      })
    },
    [state, defaultView, setSearchParams, location.state],
  )

  const openProject = useCallback(
    (id: number) => {
      const state_: DialogLocationState = { projectDialog: true }
      navigate(
        { search: serializeQueryState({ ...state, project: id }, defaultView).toString() },
        { state: state_ },
      )
    },
    [state, defaultView, navigate],
  )

  const dropProject = useCallback(() => {
    setSearchParams(serializeQueryState({ ...state, project: null }, defaultView), {
      replace: true,
    })
  }, [state, defaultView, setSearchParams])

  const closeProject = useCallback(() => {
    if ((location.state as DialogLocationState | null)?.projectDialog) navigate(-1)
    else dropProject()
  }, [location.state, navigate, dropProject])

  return { state, update, openProject, closeProject, dropProject }
}
