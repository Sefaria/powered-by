import { getCategories } from '../utils/categories.js'

const API_URL = 'https://www.sefaria.org/api/powered-by'

export async function fetchProjects() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`)
  }

  const data = await response.json()

  return data.projects
    .filter((project) => project.is_published && project.consent_to_display)
    .map((project) => ({
      ...project,
      categories: getCategories(project.project_category),
    }))
}
