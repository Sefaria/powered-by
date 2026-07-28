// Base paths from Sefaria's public API reference (developers.sefaria.org).
// Raw sefaria_tools_used values are free text and often include a trailing
// slash, a query string, or extra path segments (a specific text ref) after
// the real endpoint — normalizeEndpoint collapses all of that down to one
// of these base paths.
export const KNOWN_ENDPOINTS = [
  '/api/texts', '/api/v3/texts', '/api/texts/versions', '/api/texts/translations',
  '/api/texts/random-by-topic', '/api/bulktext', '/api/passages',
  '/api/index', '/api/v2/raw/index',
  '/api/shape', '/api/links', '/api/related', '/api/ref-topic-links',
  '/api/link-summary', '/api/search-wrapper', '/api/find-refs',
  '/api/name', '/api/topics', '/api/v2/topics', '/api/topics-graph',
  '/api/recommend/topics', '/api/calendars', '/api/calendars/next-read',
  '/api/sheets', '/api/collections', '/api/counts', '/api/authors',
  '/api/manuscripts', '/api/img-gen', '/api/ref', '/api/profile', '/api/async',
  '/api/words/completion', '/api/words',
]

// Longest base path first, so a more specific base (e.g. /api/words/completion)
// is tried before a shorter one it would otherwise also match (/api/words).
const ENDPOINTS_BY_LENGTH_DESC = [...KNOWN_ENDPOINTS].sort((a, b) => b.length - a.length)

export function normalizeEndpoint(raw) {
  const withoutQuery = raw.trim().split('?')[0]
  const withoutTrailingSlash =
    withoutQuery.length > 1 && withoutQuery.endsWith('/')
      ? withoutQuery.slice(0, -1)
      : withoutQuery

  const knownMatch = ENDPOINTS_BY_LENGTH_DESC.find(
    (base) => withoutTrailingSlash === base || withoutTrailingSlash.startsWith(`${base}/`),
  )

  return knownMatch ?? withoutTrailingSlash
}
