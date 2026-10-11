import { CATEGORIES, getCategoryMeta, type CategoryId } from './categories'
import type { Project } from './project'

export type CategoryFilter = CategoryId | 'all'

export interface Filters {
  q: string
  category: CategoryFilter
  openSourceOnly: boolean
}

export const DEFAULT_FILTERS: Filters = { q: '', category: 'all', openSourceOnly: false }

function searchHaystack(p: Project): string {
  return [
    p.name,
    p.description,
    ...p.topics,
    ...p.categories.map((c) => getCategoryMeta(c).shortLabel),
    ...p.resources,
  ]
    .join('\n')
    .toLowerCase()
}

/** Case-insensitive substring search over name, description, topics, category labels, resources. */
export function searchProjects(projects: readonly Project[], q: string): Project[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return [...projects]
  return projects.filter((p) => searchHaystack(p).includes(needle))
}

export function filterProjects(projects: readonly Project[], filters: Filters): Project[] {
  return searchProjects(projects, filters.q).filter(
    (p) =>
      (!filters.openSourceOnly || p.sourceUrl !== null) &&
      (filters.category === 'all' || p.categories.includes(filters.category)),
  )
}

export type CategoryCounts = Record<CategoryFilter, number>

/**
 * Counts per category for the filter UI, computed from the current search
 * results (and the open-source toggle, so a count always equals what you'd
 * see after choosing that row) but not from the category selection itself.
 */
export function categoryCounts(
  projects: readonly Project[],
  filters: Pick<Filters, 'q' | 'openSourceOnly'>,
): CategoryCounts {
  const base = filterProjects(projects, { ...filters, category: 'all' })
  const counts = { all: base.length } as CategoryCounts
  for (const { id } of CATEGORIES) {
    counts[id] = base.filter((p) => p.categories.includes(id)).length
  }
  return counts
}

export function activeFilterCount(filters: Filters): number {
  return (filters.category !== 'all' ? 1 : 0) + (filters.openSourceOnly ? 1 : 0)
}
