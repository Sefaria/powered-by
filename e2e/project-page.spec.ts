import {
  expect,
  expectNoAxeViolations,
  PROJECTS,
  serveProjects,
  test,
  waitForProjects,
} from './support'

// The three widths in the spec; each describe sets its own viewport, so run once, on desktop.
const WIDTHS = [
  { width: 1280, layout: 'side card' },
  { width: 834, layout: 'inline panel' },
  { width: 390, layout: 'bottom bar' },
] as const

const cta = (page: import('@playwright/test').Page) =>
  page.getByRole('complementary', { name: 'Open this project' })

for (const { width, layout } of WIDTHS) {
  test.describe(`project page at ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390 })
    // eslint-disable-next-line no-empty-pattern
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'sets its own viewports')
    })

    test('a deep link works and a wrong slug redirects to the canonical one', async ({ page }) => {
      await page.goto(`/projects/${PROJECTS.torahMcp}-torah-mcp`)
      await expect(page.getByRole('heading', { level: 1, name: 'Torah MCP' })).toBeVisible()
      await expect(page).toHaveTitle('Torah MCP · Powered by Sefaria')

      await page.goto(`/projects/${PROJECTS.torahMcp}-an-old-name`)
      await expect(page).toHaveURL(new RegExp(`/projects/${PROJECTS.torahMcp}-torah-mcp$`))
      await expect(page.getByRole('heading', { level: 1, name: 'Torah MCP' })).toBeVisible()
    })

    test('an unknown id shows "Project not found"', async ({ page }) => {
      await page.goto('/projects/999999')
      await expect(page.getByRole('heading', { level: 1, name: 'Project not found' })).toBeVisible()
      await page.getByRole('link', { name: 'All projects' }).last().click()
      await expect(page).toHaveURL('/')
    })

    test(`the open button is a ${layout}`, async ({ page }) => {
      await page.goto(`/projects/${PROJECTS.torahMcp}`)
      const panel = cta(page)
      await expect(panel).toBeVisible()
      const open = panel.getByRole('link', { name: /^Open Torah MCP/ })
      const [panelBox, openBox, h1Box, vh] = [
        await panel.boundingBox(),
        await open.boundingBox(),
        await page.getByRole('heading', { level: 1 }).boundingBox(),
        page.viewportSize()!.height,
      ]
      const position = await panel.evaluate((el) => getComputedStyle(el).position)
      expect(position).toBe(width >= 600 && width < 1024 ? 'static' : 'sticky')
      if (width >= 1024) {
        // a right-hand column, level with the header, with full-width stacked buttons
        expect(panelBox!.x).toBeGreaterThan(width / 2)
        expect(panelBox!.width).toBeCloseTo(360, 0)
        expect(openBox!.height).toBeCloseTo(52, 0)
        await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
        // still in view after scrolling: it follows the page
        const after = await panel.boundingBox()
        expect(after!.y).toBeCloseTo(24, 0)
      } else if (width >= 600) {
        // an inline panel under the header, buttons side by side at natural width
        expect(panelBox!.y).toBeGreaterThan(h1Box!.y)
        expect(openBox!.width).toBeLessThan(panelBox!.width - 40)
        const source = await panel.getByRole('link', { name: /View source code/ }).boundingBox()
        expect(Math.abs(source!.y - openBox!.y)).toBeLessThan(2)
      } else {
        // pinned to the bottom edge, bleeding to both sides, one full-width 52px button
        expect(panelBox!.x).toBe(0)
        expect(panelBox!.width).toBe(width)
        expect(panelBox!.y + panelBox!.height).toBeCloseTo(vh, 0)
        expect(openBox!.height).toBeCloseTo(52, 0)
        expect(openBox!.width).toBeGreaterThan(width - 40)
        // "View source code" has moved into the header
        await expect(panel.getByRole('link', { name: /View source code/ })).toHaveCount(0)
        await expect(
          page.getByRole('banner').getByRole('link', { name: /View source code/ }),
        ).toHaveCount(0)
        await expect(page.getByRole('link', { name: /View source code/ })).toBeVisible()
      }
    })

    if (width < 600) {
      test('the bottom bar never covers the last of the details', async ({ page }) => {
        await page.goto(`/projects/${PROJECTS.torahMcp}`)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
        )
        const details = page.locator('section[aria-labelledby="details-heading"]')
        await expect(details).toBeVisible()
        const [detailsBox, barBox] = [await details.boundingBox(), await cta(page).boundingBox()]
        expect(detailsBox!.y + detailsBox!.height).toBeLessThanOrEqual(barBox!.y + 1)
      })
    }

    test('a known-issues project has the notice above "Open anyway"', async ({ page }) => {
      await page.goto(`/projects/${PROJECTS.dafQuiz}`)
      const panel = cta(page)
      await expect(panel.getByRole('note')).toContainText('This project may no longer be active.')
      await expect(panel.getByRole('link', { name: /^Open anyway/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /^Open Daf Quiz/ })).toHaveCount(0)
    })

    test('axe passes', async ({ page }) => {
      await page.goto(`/projects/${PROJECTS.torahMcp}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectNoAxeViolations(page)
      await page.goto(`/projects/${PROJECTS.dafQuiz}`)
      await expect(page.getByRole('note')).toBeVisible()
      await expectNoAxeViolations(page)
    })

    test('Back from a project restores the browse filters, sort and scroll', async ({ page }) => {
      await page.goto('/?sort=az&category=learn')
      await waitForProjects(page)
      await page.locator('[data-result-index="6"]').scrollIntoViewIfNeeded()
      const before = await page.evaluate(() => window.scrollY)
      expect(before).toBeGreaterThan(0)
      await page.locator('[data-result-index="6"]').click()
      await expect(page).toHaveURL(/\/projects\/\d+-/)
      await page.getByRole('link', { name: 'All projects' }).first().click()
      await expect(page).toHaveURL(/sort=az/)
      await expect(page).toHaveURL(/category=learn/)
      await waitForProjects(page)
      await expect
        .poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 })
        .toBeGreaterThan(before - 150)
    })

    test('"All projects" links to / when the page is opened directly', async ({ page }) => {
      await page.goto(`/projects/${PROJECTS.torahMcp}`)
      await page.getByRole('link', { name: 'All projects' }).first().click()
      await expect(page).toHaveURL('/')
    })
  })
}

test.describe('featured band', () => {
  test('never shows a known-issues project, even one flagged featured', async ({ page }) => {
    await serveProjects(page, (rows) => {
      for (const row of rows) if (row.id === PROJECTS.dafQuiz) row.featured = true
    })
    await page.goto('/?bugs=1')
    await waitForProjects(page)
    await expect(page.locator('section[aria-labelledby="featured-heading"]')).toHaveCount(0)
  })
})
