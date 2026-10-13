import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test as base, type Page } from '@playwright/test'

const fixture = readFileSync(join(process.cwd(), 'src/lib/__fixtures__/projects.json'), 'utf8')

interface RawRow {
  id: number
  project_name: string
  is_published: boolean
  consent_to_display: boolean
  project_why: string | null
  project_source_code: string | null
  sefaria_tools_used: unknown[]
}
const rows = (JSON.parse(fixture) as { projects: RawRow[] }).projects

/** A visible project that fills every section of the dialog. */
export const RICH_PROJECT = rows.find(
  (p) =>
    p.is_published &&
    p.consent_to_display &&
    p.project_why &&
    p.project_source_code &&
    p.sefaria_tools_used.length > 0,
) as RawRow

/** Every test runs against the snapshot, never the live API, so results are deterministic. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route('https://www.sefaria.org/api/powered-by', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: fixture,
        headers: { 'access-control-allow-origin': '*' },
      }),
    )
    // keep tests offline and fast; screenshots (SCREENSHOTS=1) want the real web fonts
    if (!process.env.SCREENSHOTS)
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
    await provide(page)
  },
})

export { expect }

/** Serve the snapshot with some rows changed, e.g. to flag projects as featured. */
export async function serveProjects(
  page: Page,
  change: (rows: Array<Record<string, unknown>>) => void,
) {
  const data = JSON.parse(fixture) as { projects: Array<Record<string, unknown>> }
  change(data.projects)
  await page.route('https://www.sefaria.org/api/powered-by', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(data),
      headers: { 'access-control-allow-origin': '*' },
    }),
  )
}

/** Ids of fixture projects used by tests. Names are checked so a data refresh can't silently change them. */
export const PROJECTS = {
  todaysDaf: 155,
  talmudNavigator: 143,
  torahMcp: 141,
  /** Flagged is_buggy in the snapshot. */
  dafQuiz: 51,
}

export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
}

export async function waitForProjects(page: Page) {
  await expect(page.getByRole('button', { name: /^Explore \d+ projects$/ })).toBeVisible()
}
