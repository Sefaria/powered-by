import { isCategoryId } from './categories'
import { DEFAULT_FILTERS, type Filters } from './filter'
import { DEFAULT_SORT, type SortOption } from './sort'

export type ViewMode = 'grid' | 'list'

export interface QueryState extends Filters {
  sort: SortOption
  view: ViewMode
  /** Id of the project whose dialog is open. */
  project: number | null
}

export const DEFAULT_VIEW: ViewMode = 'grid'

export function parseQueryState(
  search: string | URLSearchParams,
  defaultView: ViewMode = DEFAULT_VIEW,
): QueryState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const category = params.get('category') ?? ''
  const sort = params.get('sort')
  const view = params.get('view')
  const project = Number(params.get('project'))
  return {
    q: params.get('q') ?? DEFAULT_FILTERS.q,
    category: isCategoryId(category) ? category : 'all',
    openSourceOnly: params.get('open') === '1',
    sort: sort === 'az' ? 'az' : DEFAULT_SORT,
    view: view === 'grid' || view === 'list' ? view : defaultView,
    project: Number.isInteger(project) && project > 0 ? project : null,
  }
}

/** Serialises non-default values only, so a pristine page has a clean URL. */
export function serializeQueryState(
  state: QueryState,
  defaultView: ViewMode = DEFAULT_VIEW,
): URLSearchParams {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.category !== 'all') params.set('category', state.category)
  if (state.openSourceOnly) params.set('open', '1')
  if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort)
  if (state.view !== defaultView) params.set('view', state.view)
  if (state.project !== null) params.set('project', String(state.project))
  return params
}
