import { expect, expectNoAxeViolations, RICH_PROJECT, test, waitForProjects } from './support'

test.describe('browse', () => {
  test('search, filter, switch to list, open a project, Back closes the dialog', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    await waitForProjects(page)
    await expect(page.getByText('Showing 24 of 121 projects · newest first')).toBeVisible()

    await page.getByRole('searchbox', { name: 'Search projects' }).fill('torah')
    await expect(page).toHaveURL(/q=torah/)
    await expect(page.getByText(/projects match$/)).toBeVisible()

    if (isMobile) {
      await page.getByRole('button', { name: /^Filters/ }).click()
      await page.getByRole('radio', { name: /AI & Apps/ }).click()
      await page.getByRole('button', { name: /^Show \d+ projects?$/ }).click()
      await expect(page.getByRole('button', { name: /^Filters · 1$/ })).toBeVisible()
    } else {
      await page.getByRole('radio', { name: /AI & Apps/ }).click()
    }
    await expect(page).toHaveURL(/category=ai/)

    await page.getByRole('button', { name: 'List', exact: true }).click()
    await expect(page).toHaveURL(/view=list/)
    await expect(page.getByRole('button', { name: 'List', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    const first = page.locator('[data-result-index="0"]')
    const name = (await first.textContent())?.trim() ?? ''
    await first.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL(/project=\d+/)
    // (on mobile the row also contains its subline, so compare the other way round)
    const title = (await dialog.getByRole('heading', { level: 2 }).textContent()) ?? ''
    expect(title.length).toBeGreaterThan(0)
    expect(name).toContain(title)

    await page.goBack()
    await expect(dialog).toBeHidden()
    await expect(page).not.toHaveURL(/project=/)
    // filters survive closing the dialog, and focus returns to the opener
    await expect(page).toHaveURL(/category=ai/)
    await expect(first).toBeFocused()
  })

  test('deep link opens the dialog and Escape closes it', async ({ page }) => {
    await page.goto(`/?project=${RICH_PROJECT.id}`)
    const dialog = page.getByRole('dialog', { name: RICH_PROJECT.project_name })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: /^Open / })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).not.toHaveURL(/project=/)
  })

  test('closes the dialog from the close button and the backdrop', async ({ page, isMobile }) => {
    await page.goto(`/?project=${RICH_PROJECT.id}`)
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    test.skip(isMobile, 'The mobile dialog is full screen: there is no backdrop')
    await page.goto(`/?project=${RICH_PROJECT.id}`)
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.mouse.click(2, 2)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('an unknown project id is silently dropped', async ({ page }) => {
    await page.goto('/?project=999999')
    await waitForProjects(page)
    await expect(page).not.toHaveURL(/project=/)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('Show more appends 24 and moves focus to the first new card', async ({ page }) => {
    await page.goto('/')
    await waitForProjects(page)
    await expect(page.locator('[data-result-index]')).toHaveCount(24)
    await page.getByRole('button', { name: 'Show more projects' }).click()
    await expect(page.locator('[data-result-index]')).toHaveCount(48)
    await expect(page.locator('[data-result-index="24"]')).toBeFocused()
  })

  test('the filter sheet discards on close and applies on Show (mobile)', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The sheet is the mobile/tablet filter UI')
    await page.goto('/')
    await waitForProjects(page)
    await page.getByRole('button', { name: 'Filters', exact: true }).click()
    await page.getByRole('radio', { name: /Visualization/ }).click()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page).not.toHaveURL(/category=/)

    await page.getByRole('button', { name: 'Filters', exact: true }).click()
    await page.getByRole('radio', { name: /Visualization/ }).click()
    await page.getByRole('button', { name: /^Show \d+ projects$/ }).click()
    await expect(page).toHaveURL(/category=viz/)
    await expect(
      page.getByRole('button', { name: 'Remove filter: Visualization & Data' }),
    ).toBeVisible()
  })

  test('the empty state clears filters', async ({ page }) => {
    await page.goto('/?q=zzzzzz')
    await expect(page.getByText('No projects match that search.')).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.getByRole('searchbox')).toHaveValue('')
    await expect(page.getByText(/Showing 24 of 121/)).toBeVisible()
  })

  test('unknown routes show a client-side 404', async ({ page }) => {
    await page.goto('/nope')
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
  })

  test('accessibility: no axe violations on browse, dialog and filter sheet', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    await waitForProjects(page)
    await expectNoAxeViolations(page)

    await page.goto('/?view=list')
    await waitForProjects(page)
    await expectNoAxeViolations(page)

    await page.goto(`/?project=${RICH_PROJECT.id}`)
    await expect(page.getByRole('dialog')).toBeVisible()
    await expectNoAxeViolations(page)

    if (isMobile) {
      await page.goto('/')
      await waitForProjects(page)
      await page.getByRole('button', { name: 'Filters', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
      await expectNoAxeViolations(page)
    }
  })
})
