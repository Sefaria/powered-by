import type { Locator, Page } from '@playwright/test'
import { expect, expectNoAxeViolations, PROJECTS, test, waitForProjects } from './support'

/** Where the filter sections live: the sidebar on desktop, the sheet on mobile. */
function filterScope(page: Page, isMobile: boolean): Locator {
  return isMobile
    ? page.getByRole('dialog', { name: 'Filters' })
    : page.getByRole('complementary', { name: 'Filters' })
}

async function openFilters(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: /^Filters/ }).click()
  await expect(filterScope(page, isMobile)).toBeVisible()
}

async function expandSection(scope: Locator, name: string) {
  const header = scope.getByRole('button', { name: new RegExp(`^${name}`) })
  if ((await header.getAttribute('aria-expanded')) === 'false') await header.click()
  await expect(header).toHaveAttribute('aria-expanded', 'true')
}

async function pick(scope: Locator, section: string, option: RegExp) {
  await expandSection(scope, section)
  // click, not check(): on desktop the box flips once the URL has updated, a tick after the click
  await scope.getByRole('checkbox', { name: option }).click()
}

/** Mobile selections only apply on "Show N projects". */
async function applyIfSheet(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: /^Show \d+ projects?$/ }).click()
}

test.describe('filters', () => {
  test('combines topic + language + built-with: results, chips, badge and URL', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    await waitForProjects(page)
    await openFilters(page, isMobile)
    const scope = filterScope(page, isMobile)
    await pick(scope, 'Topics', /^Gemara\b/)
    await pick(scope, 'Language', /^English\b/)
    await pick(scope, 'Built with', /^React\b/)
    await applyIfSheet(page, isMobile)

    await expect(page).toHaveURL(/topic=Gemara/)
    await expect(page).toHaveURL(/lang=English/)
    await expect(page).toHaveURL(/tech=React/)
    await expect(page).not.toHaveURL(/bugs=/)
    await expect(page.getByText('1 project matches')).toBeVisible()
    await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Jastrow Search'])

    for (const label of ['Gemara', 'Language: English', 'Built with: React']) {
      await expect(page.getByRole('button', { name: `Remove filter: ${label}` })).toBeVisible()
    }
    await expect(page.getByRole('button', { name: /^Filters · 3$/ })).toBeVisible({
      visible: isMobile,
    })

    // removing one chip widens the results (Gemara + English only)
    await page.getByRole('button', { name: 'Remove filter: Built with: React' }).click()
    await expect(page).not.toHaveURL(/tech=/)
    await expect(page.getByText('14 projects match')).toBeVisible()

    await page.getByRole('button', { name: 'Clear all' }).last().click()
    await expect(page).not.toHaveURL(/topic=|lang=/)
    await expect(page.getByText(/Showing 24 of 122/)).toBeVisible()
  })

  test('OR within a section: two topics match either', async ({ page, isMobile }) => {
    await page.goto('/?topic=Gemara')
    await waitForProjects(page)
    await expect(page.getByText('16 projects match')).toBeVisible()
    await openFilters(page, isMobile)
    await pick(filterScope(page, isMobile), 'Topics', /^Tanakh\b/)
    await applyIfSheet(page, isMobile)
    await expect(page).toHaveURL(/topic=Gemara%2CTanakh|topic=Gemara,Tanakh/)
    // Gemara (16) or Tanakh (13), visible projects only: 29 in the snapshot. Retries, since the
    // URL changes a moment before the results re-render.
    await expect(page.getByText('29 projects match')).toBeVisible()
  })

  test('section disclosures start collapsed, open from a selection in the URL', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/?lang=Hebrew')
    await waitForProjects(page)
    await openFilters(page, isMobile)
    const scope = filterScope(page, isMobile)
    await expect(scope.getByRole('button', { name: 'Language · 1' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(scope.getByRole('button', { name: 'Topics' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('Show all expands a long list, and Filter topics narrows it', async ({ page, isMobile }) => {
    await page.goto('/')
    await waitForProjects(page)
    await openFilters(page, isMobile)
    const scope = filterScope(page, isMobile)
    await expandSection(scope, 'Topics')
    const group = scope.getByRole('group', { name: 'Topics' })
    await expect(group.getByRole('checkbox')).toHaveCount(8)
    await scope.getByRole('button', { name: /^Show all \d+$/ }).click()
    expect(await group.getByRole('checkbox').count()).toBeGreaterThan(12)
    await scope.getByRole('searchbox', { name: 'Filter topics' }).fill('gemara')
    await expect(group.getByRole('checkbox')).toHaveCount(1)
  })

  test('mobile sheet: pending selection, live "Show N", discarded on close', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The sheet is the mobile/tablet filter UI')
    await page.goto('/')
    await waitForProjects(page)
    await openFilters(page, true)
    const sheet = filterScope(page, true)
    await expect(page.getByRole('button', { name: 'Show 122 projects' })).toBeVisible()

    await pick(sheet, 'Topics', /^Gemara\b/)
    await expect(page.getByRole('button', { name: 'Show 16 projects' })).toBeVisible()
    await expect(page).not.toHaveURL(/topic=/) // not applied yet
    await pick(sheet, 'Language', /^Hebrew\b/)
    await expect(page.getByRole('button', { name: 'Show 2 projects' })).toBeVisible()

    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page).not.toHaveURL(/topic=|lang=/)
    await expect(page.getByText(/Showing 24 of 122/)).toBeVisible()

    await openFilters(page, true)
    await expandSection(filterScope(page, true), 'Topics')
    await expect(
      filterScope(page, true).getByRole('checkbox', { name: /^Gemara\b/ }),
    ).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Show 122 projects' })).toBeVisible()
  })

  test('known issues: hidden by default, shown (without a badge) when switched on', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    await waitForProjects(page)
    await expect(page.getByRole('button', { name: 'Explore 122 projects' })).toBeVisible()
    await expect(page.getByText('Showing 24 of 122 projects')).toBeVisible()

    await openFilters(page, isMobile)
    const toggle = filterScope(page, isMobile).getByRole('switch', {
      name: 'Show projects with known issues',
    })
    await expect(toggle).not.toBeChecked()
    await toggle.click()
    await expect(toggle).toBeChecked()
    await applyIfSheet(page, isMobile)

    await expect(page).toHaveURL(/bugs=1/)
    await expect(page.getByRole('button', { name: 'Explore 134 projects' })).toBeVisible()
    await expect(page.getByText('Showing 24 of 134 projects')).toBeVisible()

    // a buggy project is now findable, with no badge; off again, it's gone
    await page.goto('/?bugs=1&q=Daf+Quiz')
    await expect(page.getByRole('heading', { level: 3, name: 'Daf Quiz' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Known issues' })).toHaveCount(0)
    await page.goto('/?q=Daf+Quiz')
    await expect(page.getByText('No projects match that search.')).toBeVisible()
  })

  test('known issues: filter counts follow the switch', async ({ page, isMobile }) => {
    await page.goto('/?topic=Gemara')
    await waitForProjects(page)
    await expect(page.getByText('16 projects match')).toBeVisible()
    await page.goto('/?topic=Gemara&bugs=1')
    await waitForProjects(page)
    await expect(page.getByText('18 projects match')).toBeVisible()
    await openFilters(page, isMobile)
    await expect(
      filterScope(page, isMobile).getByRole('switch', { name: 'Show projects with known issues' }),
    ).toBeChecked()
  })

  test('a known-issues project opens its page from the arrow, with the notice above the button', async ({
    page,
  }) => {
    await page.goto('/?bugs=1&q=Daf+Quiz')
    await page.getByRole('link', { name: 'About Daf Quiz' }).click()
    await expect(page).toHaveURL(new RegExp(`/projects/${PROJECTS.dafQuiz}-daf-quiz`))
    const note = page.getByRole('note')
    await expect(note).toContainText('This project may no longer be active.')
    const open = page.getByRole('link', { name: /^Open anyway/ })
    await expect(open).toBeVisible()
    const [noteBox, openBox] = [await note.boundingBox(), await open.boundingBox()]
    expect(noteBox!.y + noteBox!.height).toBeLessThanOrEqual(openBox!.y)
  })

  test('the project page of a known-issues project works with the switch off', async ({
    page,
    isMobile,
  }) => {
    await page.goto(`/projects/${PROJECTS.dafQuiz}`)
    await expect(page.getByRole('heading', { level: 1, name: 'Daf Quiz' })).toBeVisible()
    await page.getByRole('link', { name: 'All projects' }).first().click()
    await waitForProjects(page)
    await openFilters(page, isMobile)
    await expect(
      filterScope(page, isMobile).getByRole('switch', { name: 'Show projects with known issues' }),
    ).not.toBeChecked()
  })

  test('the empty state offers Clear filters', async ({ page }) => {
    await page.goto('/?topic=Gemara&lang=Korean')
    await expect(page.getByText('No projects match that search.')).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).not.toHaveURL(/topic=|lang=/)
    await expect(page.getByText(/Showing 24 of 122/)).toBeVisible()
  })

  test('accessibility: no axe violations with every section open', async ({ page, isMobile }) => {
    await page.goto('/?topic=Gemara&lang=English&bugs=1')
    await waitForProjects(page)
    await openFilters(page, isMobile)
    const scope = filterScope(page, isMobile)
    for (const section of ['Topics', 'Language', 'Sefaria resources', 'Built with']) {
      await expandSection(scope, section)
    }
    await expectNoAxeViolations(page)
  })
})
