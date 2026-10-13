import { expect, PROJECTS, RICH_PROJECT, serveProjects, test, waitForProjects } from './support'

// Not part of the normal run: `npm run screenshots` writes every screen at every width to screenshots/.
test.skip(!process.env.SCREENSHOTS, 'only with SCREENSHOTS=1')

const WIDTHS = [360, 390, 768, 1024, 1440]
const dir = process.env.SCREENSHOT_DIR ?? 'screenshots'

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width >= 1024 ? 900 : 844 }, hasTouch: width < 1024 })

    test('browse grid', async ({ page }) => {
      await page.goto('/')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${dir}/browse-grid-${width}.png`, fullPage: true })
    })

    test('browse list', async ({ page }) => {
      await page.goto('/?view=list')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${dir}/browse-list-${width}.png`, fullPage: true })
    })

    test('filters (sidebar from 1024, sheet below)', async ({ page }) => {
      await page.goto('/')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      if (width >= 1024) {
        await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
        await page.getByRole('radio', { name: /AI & Apps/ }).click()
        await expect(page).toHaveURL(/category=ai/)
        await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
      } else {
        await page.getByRole('button', { name: 'Filters', exact: true }).click()
        await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
      }
      await page.screenshot({ path: `${dir}/filters-${width}.png` })
    })

    test('project dialog', async ({ page }) => {
      await page.goto(`/?project=${RICH_PROJECT.id}`)
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${dir}/dialog-${width}.png` })
    })

    test('empty state', async ({ page }) => {
      await page.goto('/?q=zzzzzz')
      await expect(page.getByText('No projects match that search.')).toBeVisible()
      await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${dir}/empty-${width}.png` })
    })

    test('charts', async ({ page }) => {
      await page.goto('/charts')
      await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${dir}/charts-${width}.png`, fullPage: true })
    })

    test('mobile menu', async ({ page }) => {
      test.skip(width >= 1024, 'the menu only exists below 1024px')
      await page.goto('/')
      await waitForProjects(page)
      await page.getByRole('button', { name: 'Open menu' }).click()
      await page.screenshot({
        path: `${dir}/menu-${width}.png`,
        clip: { x: 0, y: 0, width, height: 320 },
      })
    })
  })
}

// Revision 2 (docs/REDESIGN_SPEC.md §16): the screens the PR shows, desktop and mobile only.
for (const width of [1440, 390]) {
  test.describe(`revision 2 at ${width}px`, () => {
    const desktop = width >= 1024
    test.use({ viewport: { width, height: desktop ? 900 : 844 }, hasTouch: !desktop })

    test('featured band', async ({ page }) => {
      await serveProjects(page, (rows) => {
        for (const row of rows) {
          if (
            [PROJECTS.todaysDaf, PROJECTS.talmudNavigator, PROJECTS.torahMcp].includes(
              row.id as number,
            )
          )
            row.featured = true
        }
      })
      await page.goto('/')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      await page.locator('section[aria-labelledby="featured-heading"]').screenshot({
        path: `${dir}/featured-${width}.png`,
      })
    })

    test('mixed category icon colors', async ({ page }) => {
      await page.goto('/')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${dir}/icon-colors-${width}.png` })
    })

    test('expanded filters', async ({ page }) => {
      await page.goto('/?topic=Gemara')
      await waitForProjects(page)
      await page.evaluate(() => document.fonts.ready)
      if (desktop) {
        const aside = page.getByRole('complementary', { name: 'Filters' })
        for (const name of ['Language', 'Sefaria resources', 'Built with']) {
          await aside.getByRole('button', { name: new RegExp(`^${name}`) }).click()
        }
        await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
        await page.screenshot({ path: `${dir}/filters-expanded-${width}.png` })
      } else {
        await page.getByRole('button', { name: /^Filters/ }).click()
        const sheet = page.getByRole('dialog', { name: 'Filters' })
        await sheet.getByRole('button', { name: /^Language/ }).click()
        await sheet.getByRole('button', { name: /^Built with/ }).click()
        await page.screenshot({ path: `${dir}/filters-expanded-${width}.png` })
      }
    })

    test('a buggy project with its badge', async ({ page }) => {
      await page.goto('/?bugs=1&q=Daf+Quiz')
      await expect(page.getByRole('heading', { level: 3, name: 'Daf Quiz' })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${dir}/known-issues-card-${width}.png` })
      await page.goto(`/?project=${PROJECTS.dafQuiz}`)
      await expect(page.getByRole('dialog', { name: 'Daf Quiz' })).toBeVisible()
      await page.screenshot({ path: `${dir}/known-issues-dialog-${width}.png` })
    })
  })
}
