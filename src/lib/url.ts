import { isCategoryId } from './categories'
import { DEFAULT_FILTERS, type FacetKey, type Filters } from './filter'
import { DEFAULT_SORT, type SortOption } from './sort'

export type ViewMode = 'grid' | 'list'

export interface QueryState extends Filters {
  sort: SortOption
  view: ViewMode
}

export const DEFAULT_VIEW: ViewMode = 'grid'

/** Query param for each multi-select section. Values are comma-separated. */
const FACET_PARAMS: Record<FacetKey, string> = {
  topics: 'topic',
  languages: 'lang',
  resources: 'resource',
  tech: 'tech',
}

function parseList(value: string | null): string[] {
  const items = (value ?? '').split(',').map((item) => item.trim())
  return [...new Set(items.filter(Boolean))]
}

export function parseQueryState(
  search: string | URLSearchParams,
  defaultView: ViewMode = DEFAULT_VIEW,
): QueryState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const category = params.get('category') ?? ''
  const sort = params.get('sort')
  const view = params.get('view')
  return {
    q: params.get('q') ?? DEFAULT_FILTERS.q,
    category: isCategoryId(category) ? category : 'all',
    topics: parseList(params.get(FACET_PARAMS.topics)),
    languages: parseList(params.get(FACET_PARAMS.languages)),
    resources: parseList(params.get(FACET_PARAMS.resources)),
    tech: parseList(params.get(FACET_PARAMS.tech)),
    showBuggy: params.get('bugs') === '1',
    // anything else, including the retired ?sort=users and ?sort=popular, is the default
    sort: sort === 'az' ? 'az' : DEFAULT_SORT,
    view: view === 'grid' || view === 'list' ? view : defaultView,
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
  for (const key of Object.keys(FACET_PARAMS) as FacetKey[]) {
    if (state[key].length > 0) params.set(FACET_PARAMS[key], state[key].join(','))
  }
  if (state.showBuggy) params.set('bugs', '1')
  if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort)
  if (state.view !== defaultView) params.set('view', state.view)
  return params
}
