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

export function getCategories(rawCategory) {
  if (!rawCategory) return [UNCATEGORIZED]

  const candidates = [...KNOWN_CATEGORIES, ...Object.keys(LEGACY_LABEL_MAP)]

  const matches = candidates
    .map((candidate) => ({
      label: LEGACY_LABEL_MAP[candidate] ?? candidate,
      index: rawCategory.indexOf(candidate),
    }))
    .filter(({ index }) => index !== -1)
    .sort((a, b) => a.index - b.index)
    .map(({ label }) => label)

  const uniqueMatches = [...new Set(matches)]

  return uniqueMatches.length > 0 ? uniqueMatches : [UNCATEGORIZED]
}
