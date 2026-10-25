import type { Page } from '@playwright/test'
import { expect, RICH_PROJECT, serveProjects, test, waitForProjects } from './support'

const INTERACTIVE = 'button, a[href], input, select, [role=radio]'

/** Every visible interactive element in the viewport must be at least 44x44 CSS px. */
async function smallTargets(page: Page) {
  return page.evaluate((selector) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const small: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.display === 'none') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue
      // elements clipped away from view (e.g. the off-screen skip link)
      if (r.bottom <= 0 || r.top >= vh) continue
      if (r.width < 43.5 || r.height < 43.5) {
        small.push(
          `${el.tagName.toLowerCase()} "${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
        )
      }
    }
    return small
  }, INTERACTIVE)
}

async function scrollThrough(page: Page, check: () => Promise<void>) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const step = await page.evaluate(() => window.innerHeight)
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await check()
  }
}

test.describe('touch targets (>= 44x44)', () => {
  test('browse grid, list and the whole page, scrolled through', async ({ page }) => {
    for (const url of ['/', '/?view=list']) {
      await page.goto(url)
      await waitForProjects(page)
      await scrollThrough(page, async () => expect(await smallTargets(page)).toEqual([]))
    }
  })

  test('project page, filter sheet and header menu', async ({ page, isMobile }) => {
    await page.goto(`/projects/${RICH_PROJECT.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await smallTargets(page)).toEqual([])

    await page.goto('/')
    await waitForProjects(page)
    if (isMobile) {
      await page.getByRole('button', { name: 'Filters', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
      expect(await smallTargets(page)).toEqual([])
      await page.getByRole('button', { name: 'Close' }).click()
      await page.getByRole('button', { name: 'Open menu' }).click()
      expect(await smallTargets(page)).toEqual([])
    }
  })

  test('featured band and every expanded filter section', async ({ page, isMobile }) => {
    await serveProjects(page, (rows) => {
      for (const row of rows) if ([155, 143, 141].includes(row.id as number)) row.featured = true
    })
    await page.goto('/')
    await waitForProjects(page)
    await scrollThrough(page, async () => expect(await smallTargets(page)).toEqual([]))

    if (isMobile) {
      await page.getByRole('button', { name: 'Filters', exact: true }).click()
    }
    const scope = isMobile
      ? page.getByRole('dialog', { name: 'Filters' })
      : page.getByRole('complementary', { name: 'Filters' })
    for (const name of ['Topics', 'Language', 'Sefaria resources', 'Built with']) {
      await scope.getByRole('button', { name: new RegExp(`^${name}`) }).click()
    }
    await scope
      .getByRole('button', { name: /^Show all/ })
      .first()
      .click()
    await page.getByRole('heading', { name: 'Browse projects' }).scrollIntoViewIfNeeded()
    expect(await smallTargets(page)).toEqual([])
  })

  test('charts page', async ({ page }) => {
    await page.goto('/charts')
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8)
    await scrollThrough(page, async () => expect(await smallTargets(page)).toEqual([]))
  })
})

test.describe('responsive layout', () => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    test(`no horizontal page scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const url of ['/', '/?view=list', '/charts']) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${url} at ${width}px`).toBeLessThanOrEqual(0)
      }
    })
  }

  test('the Talmud quote never overlaps the hero copy or buttons from 1100 to 1440px', async ({
    page,
  }) => {
    for (const width of [1100, 1180, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await waitForProjects(page)
      const quote = await page.locator('figure').boundingBox()
      expect(quote).not.toBeNull()
      for (const target of [
        page.getByRole('heading', { level: 1 }),
        page
          .locator('section p')
          .filter({ hasText: 'hub for Torah innovation' })
          .locator('visible=true'),
        page.getByRole('button', { name: /^Explore/ }),
        page.getByRole('link', { name: /Build with Sefaria/ }).first(),
      ]) {
        const box = await target.boundingBox()
        expect(box).not.toBeNull()
        const overlaps =
          quote!.x < box!.x + box!.width &&
          box!.x < quote!.x + quote!.width &&
          quote!.y < box!.y + box!.height &&
          box!.y < quote!.y + quote!.height
        expect(overlaps, `quote overlaps content at ${width}px`).toBe(false)
      }
    }
  })

  test('the quote sits in the hero corner from 1100px and in flow below', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await waitForProjects(page)
    expect(await page.locator('figure').evaluate((el) => getComputedStyle(el).position)).toBe(
      'absolute',
    )
    await page.setViewportSize({ width: 1000, height: 900 })
    expect(await page.locator('figure').evaluate((el) => getComputedStyle(el).position)).toBe(
      'relative',
    )
  })

  test('card tag rows stay on a single line', async ({ page }) => {
    await page.goto('/')
    await waitForProjects(page)
    const heights = await page
      .getByTestId('topic-tags')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
    expect(heights.length).toBeGreaterThan(0)
    for (const h of heights) expect(h).toBe(28)
  })
})
