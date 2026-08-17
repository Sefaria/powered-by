import { getCategories } from '../utils/categories.js'

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
  const projects = await fetchProjectList(PROD_API_URL)

  return projects
    .filter((project) => project.is_published && project.consent_to_display)
    .map((project) => ({
      ...project,
      categories: getCategories(project.project_category),
    }))
}
