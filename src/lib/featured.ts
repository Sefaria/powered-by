import { sortProjects } from './sort'
import type { Project } from './project'

export const MAX_FEATURED = 3

/**
 * Projects an admin has flagged `featured`, newest first, at most three.
 * Never backfilled: no flagged project means an empty list. A project with
 * known issues is not featured unless those are being shown.
 */
export function getFeaturedProjects(
  projects: readonly Project[],
  { showBuggy = false }: { showBuggy?: boolean } = {},
): Project[] {
  const featured = projects.filter((p) => p.featured && (showBuggy || !p.isBuggy))
  return sortProjects(featured, 'new').slice(0, MAX_FEATURED)
}
