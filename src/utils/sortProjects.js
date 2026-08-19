export const SORT_ALPHABETICAL = 'alphabetical'
export const SORT_NEWEST = 'newest'
export const SORT_OLDEST = 'oldest'

function hasParseableDate(project) {
  if (!project.submission_date) return false
  return !Number.isNaN(new Date(project.submission_date).getTime())
}

function byNameAscending(a, b) {
  return a.project_name.localeCompare(b.project_name)
}

export function sortProjects(projects, sortOption) {
  if (sortOption === SORT_ALPHABETICAL) {
    return [...projects].sort(byNameAscending)
  }

  const dated = projects.filter(hasParseableDate)
  const undated = projects.filter((project) => !hasParseableDate(project))

  const direction = sortOption === SORT_NEWEST ? -1 : 1
  dated.sort((a, b) => {
    const diff = new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime()
    return diff * direction
  })

  undated.sort(byNameAscending)

  return [...dated, ...undated]
}
