export type CategoryId = 'learn' | 'ai' | 'community' | 'viz' | 'ext' | 'none'

export interface CategoryMeta {
  id: CategoryId
  /** Label as stored by the Sefaria API (the free-text field may hold several). */
  apiLabel: string
  /** Short label shown in the UI. */
  shortLabel: string
}

/** Display order of the filter rows (after "All projects"). */
export const CATEGORIES: readonly CategoryMeta[] = [
  { id: 'learn', apiLabel: 'Learning & Study Tools', shortLabel: 'Learning & Study' },
  { id: 'ai', apiLabel: 'AI Projects, Apps, & Other Tools', shortLabel: 'AI & Apps' },
  {
    id: 'ext',
    apiLabel: 'Extensions, API Integrations, & GitHub Code',
    shortLabel: 'Extensions & API',
  },
  { id: 'viz', apiLabel: 'Visualization & Data Analysis', shortLabel: 'Visualization & Data' },
  {
    id: 'community',
    apiLabel: 'Community, Interaction, & Social',
    shortLabel: 'Community & Social',
  },
  { id: 'none', apiLabel: '', shortLabel: 'Uncategorized' },
]

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return BY_ID.get(id) ?? (BY_ID.get('none') as CategoryMeta)
}

export function isCategoryId(value: string): value is CategoryId {
  return BY_ID.has(value as CategoryId)
}

/** Older submissions used this wording for the "ext" category. */
const LEGACY_LABELS: ReadonlyArray<readonly [string, CategoryId]> = [
  ['Extensions and API Integrations', 'ext'],
]

const MATCHERS: ReadonlyArray<readonly [string, CategoryId]> = [
  ...CATEGORIES.filter((c) => c.id !== 'none').map((c) => [c.apiLabel, c.id] as const),
  ...LEGACY_LABELS,
]

/**
 * The raw category is free text that may hold several known labels, with or
 * without commas between them. Returns ids in order of appearance, deduped;
 * `['none']` when nothing matches.
 */
export function parseCategories(raw: string | null | undefined): CategoryId[] {
  if (!raw) return ['none']
  const found = MATCHERS.map(([label, id]) => ({ id, index: raw.indexOf(label) }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index)
    .map(({ id }) => id)
  const unique = [...new Set(found)]
  return unique.length > 0 ? unique : ['none']
}
