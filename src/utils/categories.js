export const KNOWN_CATEGORIES = [
  'AI Projects, Apps, & Other Tools',
  'Learning & Study Tools',
  'Community, Interaction, & Social',
  'Visualization & Data Analysis',
  'Extensions, API Integrations, & GitHub Code',
]

export const UNCATEGORIZED = 'Uncategorized'

// Fixed-order categorical hues, matching the palette already used elsewhere
// in the dashboard's charts; gray is reserved for Uncategorized (and any
// unrecognized label) and is never one of the known-category colors.
const CATEGORY_COLORS = {
  'AI Projects, Apps, & Other Tools': '#2a78d6',
  'Learning & Study Tools': '#eb6834',
  'Community, Interaction, & Social': '#1baf7a',
  'Visualization & Data Analysis': '#4a3aa7',
  'Extensions, API Integrations, & GitHub Code': '#e87ba4',
  [UNCATEGORIZED]: '#9a9a94',
}

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS[UNCATEGORIZED]
}

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
