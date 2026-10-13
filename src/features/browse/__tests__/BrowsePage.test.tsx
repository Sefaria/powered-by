import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetProjectsCache } from '../../../hooks/useProjects'
import { BrowsePage } from '../BrowsePage'
import { fixtureRaw, makeRaw } from '../../../test/factories'

function stubApi(projects: unknown[]) {
  const fetchMock = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ projects }))))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderPage(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <BrowsePage />
    </MemoryRouter>,
  )
}

// The data hook caches its response, so each test starts from an empty cache.
beforeEach(() => resetProjectsCache())
afterEach(() => vi.unstubAllGlobals())

describe('BrowsePage', () => {
  it('fetches once and shows the first page of cards with the live count', async () => {
    const fetchMock = stubApi(fixtureRaw)
    renderPage()
    expect(await screen.findByRole('button', { name: 'Explore 121 projects' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Showing 24 of 121 projects · newest first')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(24)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('shows 24 more with Show more, then hides the button when all are shown', async () => {
    stubApi(Array.from({ length: 30 }, (_, i) => makeRaw({ id: i + 1, project_name: `P${i + 1}` })))
    renderPage()
    await screen.findByText(/Showing 24 of 30/)
    await userEvent.click(screen.getByRole('button', { name: 'Show more projects' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(30)
    expect(screen.queryByRole('button', { name: 'Show more projects' })).toBeNull()
    // focus moved to the first newly shown card (index 24)
    expect(document.activeElement).toHaveAttribute('data-result-index', '24')
  })

  it('filters by search after the debounce and updates the summary', async () => {
    stubApi([makeRaw({ id: 1, project_name: 'Alpha' }), makeRaw({ id: 2, project_name: 'Beta' })])
    renderPage()
    await screen.findByText(/Showing 2 of 2/)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'alp')
    expect(await screen.findByText('1 project matches')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Alpha',
    ])
  })

  it('shows the empty state and clears filters from it', async () => {
    stubApi([makeRaw({ id: 1, project_name: 'Alpha' })])
    renderPage()
    await screen.findByText(/Showing 1 of 1/)
    await userEvent.type(screen.getByRole('searchbox'), 'zzz')
    expect(await screen.findByText('No projects match that search.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('shows an error state with Try again that refetches', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('nope', { status: 500 }))
      .mockResolvedValue(new Response(JSON.stringify({ projects: [makeRaw({ id: 1 })] })))
    vi.stubGlobal('fetch', fetchMock)
    renderPage()
    expect(await screen.findByText("We couldn't load projects right now.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText(/Showing 1 of 1/)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('opens the dialog for ?project=<id> and drops an unknown id', async () => {
    stubApi([makeRaw({ id: 7, project_name: 'Seven' })])
    const { unmount } = renderPage('/?project=7')
    expect(await screen.findByRole('dialog', { name: 'Seven' })).toBeInTheDocument()
    unmount()
    stubApi([makeRaw({ id: 7, project_name: 'Seven' })])
    renderPage('/?project=999')
    await screen.findByText(/Showing 1 of 1/)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('has no axe violations (loaded)', async () => {
    stubApi(fixtureRaw)
    const { container } = renderPage()
    await screen.findByText(/Showing 24 of 121/)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has the landmarks and a skip link as the first focusable element', async () => {
    stubApi(fixtureRaw)
    renderPage()
    await screen.findByText(/Showing 24 of 121/)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByRole('link', { name: 'Skip to projects' })).toHaveFocus()
    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('heading', { level: 2 })[0]).toHaveTextContent(
      'Browse projects',
    )
  })

  describe('known issues', () => {
    const projects = () => [
      makeRaw({ id: 1, project_name: 'Alpha' }),
      makeRaw({ id: 2, project_name: 'Buggy One', is_buggy: true }),
      makeRaw({ id: 3, project_name: 'Gamma' }),
    ]
    const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

    it('hides them everywhere by default: grid, hero count, summary, filter counts', async () => {
      stubApi(projects())
      renderPage()
      expect(await screen.findByRole('button', { name: 'Explore 2 projects' })).toBeInTheDocument()
      expect(screen.getByText('Showing 2 of 2 projects · newest first')).toBeInTheDocument()
      expect(titles()).toEqual(['Alpha', 'Gamma'])
      expect(screen.getByRole('radio', { name: /^All projects 2$/ })).toBeInTheDocument()
      expect(
        screen.getByRole('switch', { name: 'Show projects with known issues' }),
      ).not.toBeChecked()
      expect(screen.queryByText('Known issues')).toBeNull()
    })

    it('shows them with a badge when the switch is turned on, and hides them again when off', async () => {
      stubApi(projects())
      renderPage()
      const toggle = await screen.findByRole('switch')
      await userEvent.click(toggle)
      expect(await screen.findByText('Showing 3 of 3 projects · newest first')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Explore 3 projects' })).toBeInTheDocument()
      expect(titles()).toContain('Buggy One')
      expect(screen.getAllByText('Known issues')).toHaveLength(1)
      await userEvent.click(toggle)
      expect(await screen.findByText('Showing 2 of 2 projects · newest first')).toBeInTheDocument()
    })

    it('reads bugs=1 from the URL', async () => {
      stubApi(projects())
      renderPage('/?bugs=1')
      expect(await screen.findByText('Showing 3 of 3 projects · newest first')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('opens a deep link to a buggy project with its badge, without turning the switch on', async () => {
      stubApi(projects())
      renderPage('/?project=2')
      const dialog = await screen.findByRole('dialog', { name: 'Buggy One' })
      expect(within(dialog).getByText('Known issues')).toBeInTheDocument()
      expect(screen.getByRole('switch')).not.toBeChecked()
      expect(screen.queryByRole('heading', { level: 3, name: 'Buggy One' })).toBeNull()
    })

    it('never features a buggy project while the switch is off', async () => {
      stubApi([
        makeRaw({ id: 1, project_name: 'Alpha', featured: true }),
        makeRaw({ id: 2, project_name: 'Buggy One', featured: true, is_buggy: true }),
      ])
      renderPage()
      await screen.findByText(/Showing 1 of 1/)
      const band = document.querySelector(
        'section[aria-labelledby="featured-heading"]',
      ) as HTMLElement
      expect(within(band).getByRole('heading', { level: 3, name: 'Alpha' })).toBeInTheDocument()
      expect(within(band).queryByText('Buggy One')).toBeNull()
      await userEvent.click(screen.getByRole('switch'))
      expect(await within(band).findByText('Buggy One')).toBeInTheDocument()
    })
  })

  describe('featured band', () => {
    it('is absent when no project is featured, even though projects exist', async () => {
      stubApi([makeRaw({ id: 1 }), makeRaw({ id: 2 })])
      renderPage()
      await screen.findByText(/Showing 2 of 2/)
      expect(screen.queryByRole('heading', { name: 'Featured projects' })).toBeNull()
    })

    it('shows at most 3 featured projects, newest first, and opens one into the dialog', async () => {
      stubApi(
        [1, 2, 3, 4].map((id) =>
          makeRaw({
            id,
            project_name: `F${id}`,
            featured: true,
            submission_date: `2026-0${id}-01T00:00:00Z`,
          }),
        ),
      )
      renderPage()
      const heading = await screen.findByRole('heading', { name: 'Featured projects' })
      const band = heading.closest('section') as HTMLElement
      expect(
        within(band)
          .getAllByRole('heading', { level: 3 })
          .map((h) => h.textContent),
      ).toEqual(['F4', 'F3', 'F2'])
      await userEvent.click(within(band).getByRole('button', { name: 'F3' }))
      expect(await screen.findByRole('dialog', { name: 'F3' })).toBeInTheDocument()
    })
  })

  describe('filters', () => {
    const projects = () => [
      makeRaw({ id: 1, project_name: 'Alpha', tags: ['Gemara', 'Hebrew'], tech_used_raw: 'React' }),
      makeRaw({
        id: 2,
        project_name: 'Beta',
        tags: ['Gemara', 'English'],
        tech_used_raw: 'Python',
      }),
      makeRaw({ id: 3, project_name: 'Gamma', tags: ['Tanakh', 'Hebrew'], tech_used_raw: 'React' }),
    ]
    const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

    it('combines topic, language and tech, shows chips, and removes one at a time', async () => {
      stubApi(projects())
      renderPage()
      await screen.findByText(/Showing 3 of 3/)
      await userEvent.click(screen.getByRole('button', { name: 'Topics' }))
      await userEvent.click(screen.getByRole('checkbox', { name: /^Gemara/ }))
      await userEvent.click(screen.getByRole('button', { name: 'Language' }))
      await userEvent.click(screen.getByRole('checkbox', { name: /^Hebrew/ }))
      expect(await screen.findByText('1 project matches')).toBeInTheDocument()
      expect(titles()).toEqual(['Alpha'])
      expect(screen.getByRole('button', { name: 'Remove filter: Gemara' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Remove filter: Language: Hebrew' }),
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Remove filter: Gemara' }))
      expect(await screen.findByText('2 projects match')).toBeInTheDocument()
      expect(titles()).toEqual(['Alpha', 'Gamma'])
    })

    it('shows "Clear filters" on empty results and it clears the filter values', async () => {
      stubApi(projects())
      renderPage('/?topic=Tanakh&lang=English')
      expect(await screen.findByText('No projects match that search.')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
      expect(await screen.findByText(/Showing 3 of 3/)).toBeInTheDocument()
    })
  })
})
