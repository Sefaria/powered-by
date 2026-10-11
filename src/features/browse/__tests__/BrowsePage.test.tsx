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
    expect(await screen.findByRole('button', { name: 'Explore 133 projects' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Showing 24 of 133 projects · newest first')).toBeInTheDocument()
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
    await screen.findByText(/Showing 24 of 133/)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has the landmarks and a skip link as the first focusable element', async () => {
    stubApi(fixtureRaw)
    renderPage()
    await screen.findByText(/Showing 24 of 133/)
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
})
