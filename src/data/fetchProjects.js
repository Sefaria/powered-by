import { getCategories } from '../utils/categories.js'

const LOCAL_API_URL = 'http://localhost:8000/api/powered-by'
const PROD_API_URL = 'https://www.sefaria.org/api/powered-by'

async function fetchProjectList(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch projects from ${url}: ${response.status}`)
  }

  const data = await response.json()
  return data.projects
}

export async function fetchProjects() {
  const [localProjects, prodProjects] = await Promise.all([
    fetchProjectList(LOCAL_API_URL),
    fetchProjectList(PROD_API_URL),
  ])

  // later entries win ties, so prod overwrites local on matching project_name
  const byName = new Map()
  for (const project of [...localProjects, ...prodProjects]) {
    byName.set(project.project_name, project)
  }

  return [...byName.values()]
    .filter((project) => project.is_published && project.consent_to_display)
    .map((project) => ({
      ...project,
      categories: getCategories(project.project_category),
    }))
}
