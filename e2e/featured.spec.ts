import {
  expect,
  expectNoAxeViolations,
  PROJECTS,
  serveProjects,
  test,
  waitForProjects,
} from './support'

const featureThree = (rows: Array<Record<string, unknown>>) => {
  for (const row of rows) {
    if (
      [PROJECTS.todaysDaf, PROJECTS.talmudNavigator, PROJECTS.torahMcp].includes(row.id as number)
    )
      row.featured = true
  }
}

const band = (page: import('@playwright/test').Page) =>
  page.locator('section[aria-labelledby="featured-heading"]')

test.describe('featured band', () => {
  test('is absent while no project is featured (as in production today)', async ({ page }) => {
    await page.goto('/')
    await waitForProjects(page)
    await expect(page.getByRole('heading', { name: 'Featured projects' })).toHaveCount(0)
    await expect(band(page)).toHaveCount(0)
  })

  test('clicking the "Made with" tag opens the project like the rest of the card', async ({
    page,
  }) => {
    await serveProjects(page, featureThree)
    await page.goto('/')
    await waitForProjects(page)
    // by coordinates, as a person would: the tag itself no longer takes pointer events
    const label = band(page).getByText('Made with').first()
    await label.scrollIntoViewIfNeeded()
    const tag = (await label.boundingBox())!
    await page.mouse.click(tag.x + tag.width / 2, tag.y + tag.height / 2)
    await expect(page).toHaveURL(/\/projects\/\d+-/)
  })

  test('shows up to 3 featured projects, newest first, between the hero and browse area', async ({
    page,
  }) => {
    await serveProjects(page, featureThree)
    await page.goto('/')
    await waitForProjects(page)
    await expect(band(page)).toBeVisible()
    await expect(band(page).getByRole('heading', { level: 2 })).toHaveText('Featured projects')
    await expect(band(page).getByText('Hand-picked by the Sefaria team.')).toBeVisible()
    await expect(band(page).getByRole('heading', { level: 3 })).toHaveText([
      "Today's Daf (daf-yomi.dev)",
      'Talmud Navigator',
      'Torah MCP',
    ])
    // no tags on featured cards, and the band sits above "Browse projects"
    await expect(band(page).getByTestId('topic-tags')).toHaveCount(0)
    const bandBox = await band(page).boundingBox()
    const browseBox = await page.getByRole('heading', { name: 'Browse projects' }).boundingBox()
    expect(bandBox!.y + bandBox!.height).toBeLessThanOrEqual(browseBox!.y)
  })

  test('lays out as a 3-column grid from 900px and a scroll-snap row below', async ({
    page,
    isMobile,
  }) => {
    await serveProjects(page, featureThree)
    await page.goto('/')
    await waitForProjects(page)
    const scroller = band(page)
      .locator('div')
      .filter({ has: page.locator('ul') })
      .first()
    const cards = band(page).getByRole('listitem')
    const first = await cards.nth(0).boundingBox()
    const second = await cards.nth(1).boundingBox()
    const third = await cards.nth(2).boundingBox()
    if (isMobile) {
      const region = band(page).getByRole('region', { name: 'Featured projects, scrollable' })
      await expect(region).toHaveAttribute('tabindex', '0')
      expect(await region.evaluate((el) => getComputedStyle(el).scrollSnapType)).toMatch(
        /x mandatory/,
      )
      // the next card peeks in, and the third is off-screen until scrolled
      expect(first!.width).toBe(300)
      expect(second!.x).toBeLessThan(390)
      expect(third!.x).toBeGreaterThanOrEqual(390)
      expect(await region.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
    } else {
      await expect(band(page).getByRole('region', { name: /scrollable/ })).toHaveCount(0)
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(1)
      expect(Math.abs(second!.y - third!.y)).toBeLessThan(1)
      expect(Math.abs(first!.width - second!.width)).toBeLessThan(1)
      expect(Math.abs(second!.width - third!.width)).toBeLessThan(1)
    }
    void scroller
  })

  test('opening a featured card shows the project page', async ({ page }) => {
    await serveProjects(page, featureThree)
    await page.goto('/')
    await waitForProjects(page)
    await band(page).getByRole('link', { name: 'Talmud Navigator', exact: true }).click()
    await expect(page).toHaveURL(
      new RegExp(`/projects/${PROJECTS.talmudNavigator}-talmud-navigator`),
    )
    await expect(page.getByRole('heading', { level: 1, name: 'Talmud Navigator' })).toBeVisible()
    await page.goBack()
    await expect(band(page)).toBeVisible()
  })

  test('never features a buggy project, even when known issues are shown', async ({ page }) => {
    await serveProjects(page, (rows) => {
      featureThree(rows)
      for (const row of rows) {
        if (row.id === PROJECTS.dafQuiz)
          Object.assign(row, { featured: true, submission_date: '2026-10-01T00:00:00Z' })
      }
    })
    await page.goto('/')
    await waitForProjects(page)
    await expect(band(page).getByRole('heading', { level: 3 })).toHaveCount(3)
    await expect(band(page).getByText('Daf Quiz')).toHaveCount(0)

    await page.goto('/?bugs=1')
    await waitForProjects(page)
    await expect(band(page).getByRole('heading', { level: 3 })).toHaveCount(3)
    await expect(band(page).getByText('Daf Quiz')).toHaveCount(0)
  })

  test('the band ignores search and filters', async ({ page }) => {
    await serveProjects(page, featureThree)
    await page.goto('/?q=zzzzzz')
    await expect(page.getByText('No projects match that search.')).toBeVisible()
    await expect(band(page).getByRole('heading', { level: 3 })).toHaveCount(3)
  })

  test('accessibility: no axe violations with the band showing', async ({ page }) => {
    await serveProjects(page, featureThree)
    await page.goto('/')
    await waitForProjects(page)
    await expect(band(page)).toBeVisible()
    await expectNoAxeViolations(page)
  })
})
