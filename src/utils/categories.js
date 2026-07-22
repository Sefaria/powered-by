export const KNOWN_CATEGORIES = [
  'AI Projects, Apps, & Other Tools',
  'Learning & Study Tools',
  'Community, Interaction, & Social',
  'Visualization & Data Analysis',
  'Extensions, API Integrations, & GitHub Code',
]

export const UNCATEGORIZED = 'Uncategorized'

// Some older submissions used this wording for category 5; treat it as the same category.
const LEGACY_LABEL_MAP = {
  'Extensions and API Integrations': 'Extensions, API Integrations, & GitHub Code',
}

export function getPrimaryCategory(rawCategory) {
  if (!rawCategory) return UNCATEGORIZED

  const candidates = [...KNOWN_CATEGORIES, ...Object.keys(LEGACY_LABEL_MAP)]

  let earliestIndex = Infinity
  let match = null

  for (const candidate of candidates) {
    const index = rawCategory.indexOf(candidate)
    if (index !== -1 && index < earliestIndex) {
      earliestIndex = index
      match = candidate
    }
  }

  if (match === null) return UNCATEGORIZED
  return LEGACY_LABEL_MAP[match] ?? match
}
