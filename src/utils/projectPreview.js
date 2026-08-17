export function getPreviewUrl(project) {
  if (!project.project_link) return null
  if (project.is_buggy === true) return null

  let hostname
  try {
    hostname = new URL(project.project_link).hostname
  } catch {
    return null
  }

  if (hostname === 'github.com' || hostname.endsWith('.github.io')) return null

  return project.project_link
}
