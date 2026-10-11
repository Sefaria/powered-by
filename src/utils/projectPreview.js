import { isSafeUrl } from './projectDetail.js'

export function getPreviewUrl(project) {
  if (!isSafeUrl(project.project_link)) return null
  if (project.is_buggy === true) return null

  const hostname = new URL(project.project_link).hostname

  if (hostname === 'github.com' || hostname.endsWith('.github.com')) return null
  if (hostname === 'github.io' || hostname.endsWith('.github.io')) return null
  if (hostname.endsWith('githubusercontent.com')) return null

  return project.project_link
}
