import { expect, expectNoAxeViolations, test } from './support'

test.describe('/charts', () => {
  test('renders all 8 charts, is noindex, and is not linked from the site', async ({ page }) => {
    await page.goto('/charts')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Powered by Sefaria in numbers' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)
    await expect(page.getByText('Show as table')).toHaveCount(8)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
    await expect(page).toHaveTitle('Powered by Sefaria in numbers')
    // the line/bar charts really drew something
    await expect(page.locator('.recharts-surface').first()).toBeVisible()

    await page.goto('/')
    await expect(page.locator('a[href*="charts"]')).toHaveCount(0)
  })

  test('the table alternative shows the same numbers', async ({ page }) => {
    await page.goto('/charts')
    const card = page.getByRole('region', { name: 'Submissions by year' })
    await card.getByText('Show as table').click()
    await expect(card.getByRole('table')).toBeVisible()
    await expect(card.getByRole('row', { name: /2026 58/ })).toBeVisible()
  })

  test('has no horizontal page scroll and no axe violations', async ({ page }) => {
    await page.goto('/charts')
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await expectNoAxeViolations(page)
  })
})
