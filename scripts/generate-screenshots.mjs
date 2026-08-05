import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer'

const API_URL = 'https://www.sefaria.org/api/powered-by'
const SCREENSHOTS_DIR = path.resolve('public/screenshots')
const MANIFEST_PATH = path.resolve('src/data/screenshotManifest.json')
const CONCURRENCY = 3
const NAV_TIMEOUT_MS = 15000
const VIEWPORT = { width: 1280, height: 800 }

async function fetchPublishedProjects() {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`)
  }
  const data = await response.json()
  return data.projects.filter(
    (project) => project.is_published && project.consent_to_display && project.project_link,
  )
}

function isSafeUrl(rawUrl) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[::1\])/.test(url.hostname)) return false
  return true
}

async function screenshotProject(browser, project) {
  if (!isSafeUrl(project.project_link)) {
    console.warn(
      `Skipping ${project.project_name} (${project.project_link}): unsafe or invalid URL`,
    )
    return { id: project.id, ok: false }
  }

  const page = await browser.newPage()
  try {
    await page.setViewport(VIEWPORT)
    await page.goto(project.project_link, {
      waitUntil: 'networkidle2',
      timeout: NAV_TIMEOUT_MS,
    })
    const filePath = path.join(SCREENSHOTS_DIR, `${project.id}.jpg`)
    await page.screenshot({ path: filePath, type: 'jpeg', quality: 60 })
    return { id: project.id, ok: true }
  } catch (error) {
    console.warn(
      `Skipping ${project.project_name} (${project.project_link}): ${error.message}`,
    )
    return { id: project.id, ok: false }
  } finally {
    await page.close()
  }
}

async function runPool(items, worker, concurrency) {
  const results = []
  let index = 0

  async function next() {
    while (index < items.length) {
      const current = items[index]
      index += 1
      results.push(await worker(current))
    }
  }

  await Promise.all(Array.from({ length: concurrency }, next))
  return results
}

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true })

  const projects = await fetchPublishedProjects()
  const browser = await puppeteer.launch({ headless: true })

  let results
  try {
    results = await runPool(
      projects,
      (project) => screenshotProject(browser, project),
      CONCURRENCY,
    )
  } finally {
    await browser.close()
  }

  const manifest = {}
  for (const result of results) {
    if (result.ok) manifest[result.id] = true
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')

  const succeeded = results.filter((r) => r.ok).length
  console.log(`Generated ${succeeded}/${results.length} screenshots`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
