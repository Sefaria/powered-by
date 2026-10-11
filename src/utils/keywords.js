export const KNOWN_KEYWORDS = [
  'Tefillah', 'Leining', 'Daf Yomi', 'Chatbot', 'Zmanim', 'Tanakh', 'Halakha',
  'AI', 'Calendar', 'Research', 'Parsha', 'Rambam', 'Forum', 'Kaballah',
  'Quiz', 'Commentary', 'Gemara', 'Classroom', 'Visual', 'Dictionary',
]

// One project's tags used this spelling; treat it as the same keyword.
const ALIAS_MAP = {
  Kabbalah: 'Kaballah',
}

export function getKeywordCounts(projects) {
  const counts = new Map(KNOWN_KEYWORDS.map((keyword) => [keyword, 0]))

  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      const keyword = ALIAS_MAP[tag] ?? tag
      if (counts.has(keyword)) {
        counts.set(keyword, counts.get(keyword) + 1)
      }
    }
  }

  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
}
