import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetProjectsCache } from '../../../hooks/useProjects'
import { makeRaw } from '../../../test/factories'
import type { RawProject } from '../../../lib/project'
import { FROM_BROWSE } from '../../../lib/slug'
import { ProjectPage } from '../ProjectPage'

function stubApi(projects: RawProject[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ projects })))),
  )
}

function Where() {
  const location = useLocation()
  return <p data-testid="where">{location.pathname}</p>
}

function renderAt(entry: string | { pathname: string; state: unknown }, entries?: string[]) {
  return render(
    <MemoryRouter initialEntries={[...(entries ?? []), entry as string]}>
      <Routes>
        <Route path="/" element={<p>Browse page</p>} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
      </Routes>
      <Where />
    </MemoryRouter>,
  )
}

const full = makeRaw({
  id: 141,
  project_name: 'Torah MCP',
  project_desc: 'An MCP server for Sefaria.',
  project_why: 'Models misquote sources.',
  project_link: 'https://torah-mcp.example.dev/app',
  project_source_code: 'https://github.com/x/torah-mcp',
  project_category: 'AI Projects, Apps, & Other Tools Learning & Study Tools',
  sefaria_tools_used: ['Sefaria API', '/api/v3/texts'],
  tech_used_raw: 'Cloudflare Workers',
  tags: ['AI', 'Chatbot'],
  project_reach: 'About 10 users',
  submission_date: '2026-08-13T00:00:00Z',
})
const sparse = makeRaw({
  id: 2,
  project_name: 'Sparse',
  project_desc: '',
  project_link: null,
  project_category: null,
  submission_date: null,
})
const buggy = makeRaw({ id: 3, project_name: 'Old App', is_buggy: true, project_source_code: null })
const sibling = (id: number, name: string, extra: Partial<RawProject> = {}) =>
  makeRaw({
    id,
    project_name: name,
    project_category: 'AI Projects, Apps, & Other Tools',
    ...extra,
  })

beforeEach(() => resetProjectsCache())
afterEach(() => vi.unstubAllGlobals())

describe('ProjectPage', () => {
  it('renders every section of a full project', async () => {
    stubApi([full, sibling(5, 'Sibling'), sibling(6, 'Hidden', { is_buggy: true })])
    renderAt('/projects/141-torah-mcp')
    expect(await screen.findByRole('heading', { level: 1, name: 'Torah MCP' })).toBeInTheDocument()
    expect(document.title).toBe('Torah MCP · Powered by Sefaria')
    expect(screen.getByText('An MCP server for Sefaria.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Project Backstory' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Details' })).toBeInTheDocument()
    for (const label of [
      'Sefaria resources used',
      'Built with',
      'Topics',
      'Reported reach',
      'Submitted',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('About 10 users')).toBeInTheDocument()
    expect(screen.getByText('AI & Apps')).toBeInTheDocument()
    expect(screen.getByText('Learning & Study')).toBeInTheDocument()
    const related = screen.getByRole('heading', { name: 'More in AI & Apps' }).closest('section')
    expect(within(related as HTMLElement).getByRole('link', { name: /Sibling/ })).toHaveAttribute(
      'href',
      '/projects/5-sibling',
    )
    expect(within(related as HTMLElement).queryByText('Hidden')).toBeNull()
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://powered-by.sefaria.org/projects/141-torah-mcp',
    )
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'An MCP server for Sefaria.',
    )
  })

  it('shows the open button, source button and domain; external links open safely', async () => {
    stubApi([full])
    renderAt('/projects/141-torah-mcp')
    const open = await screen.findByRole('link', { name: /Open Torah MCP/ })
    expect(open).toHaveAttribute('href', 'https://torah-mcp.example.dev/app')
    expect(open).toHaveAttribute('target', '_blank')
    expect(open).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(open).getByText('(opens in a new tab)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View source code/ })).toHaveAttribute(
      'href',
      'https://github.com/x/torah-mcp',
    )
    expect(screen.getByText('torah-mcp.example.dev · opens in a new tab')).toBeInTheDocument()
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.queryByRole('link', { name: /Open anyway/ })).toBeNull()
  })

  it('hides every empty section, row and button', async () => {
    stubApi([sparse])
    renderAt('/projects/2-sparse')
    await screen.findByRole('heading', { level: 1, name: 'Sparse' })
    expect(screen.queryByRole('heading', { name: 'Project Backstory' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: /More in/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Open/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /source code/ })).toBeNull()
  })

  it('shows the soft notice above an "Open anyway" button for a known-issues project', async () => {
    stubApi([buggy])
    renderAt('/projects/3-old-app')
    const note = await screen.findByRole('note')
    expect(note).toHaveTextContent(
      'This project may no longer be active. Things may not work as expected.',
    )
    const open = screen.getByRole('link', { name: /Open anyway/ })
    expect(open).toHaveAttribute('href', 'https://www.example.com/app')
    expect(note.compareDocumentPosition(open) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Open Old App/ })).toBeNull()
  })

  it('redirects a stale slug to the canonical one without adding history', async () => {
    stubApi([full])
    renderAt('/projects/141-old-name')
    await waitFor(() =>
      expect(screen.getByTestId('where')).toHaveTextContent('/projects/141-torah-mcp'),
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Torah MCP' })).toBeInTheDocument()
  })

  it('shows "Project not found" with a link to all projects for an unknown id', async () => {
    stubApi([full])
    renderAt('/projects/999999')
    expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/')
    expect(document.head.querySelector('meta[name="prerender-status-code"]')).toHaveAttribute(
      'content',
      '404',
    )
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })

  it('treats an unpublished project as not found', async () => {
    stubApi([{ ...full, is_published: false }])
    renderAt('/projects/141-torah-mcp')
    expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
  })

  it('moves focus to the h1 after navigating, but not on a first load', async () => {
    stubApi([full])
    const { unmount } = renderAt('/projects/141-torah-mcp')
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).not.toHaveFocus()
    unmount()
    renderAt({ pathname: '/projects/141-torah-mcp', state: FROM_BROWSE }, ['/'])
    expect(await screen.findByRole('heading', { level: 1 })).toHaveFocus()
  })

  it('"Skip to project" moves focus into the page, whatever state it is in', async () => {
    stubApi([full])
    const { unmount } = renderAt('/projects/141-torah-mcp')
    await screen.findByRole('heading', { level: 1 })
    await userEvent.click(screen.getByRole('link', { name: 'Skip to project' }))
    expect(document.getElementById('project-main')).toHaveFocus()
    unmount()
    stubApi([full])
    renderAt('/projects/999-nope')
    await screen.findByRole('heading', { name: 'Project not found' })
    await userEvent.click(screen.getByRole('link', { name: 'Skip to project' }))
    expect(document.getElementById('project-main')).toHaveFocus()
  })

  describe('breadcrumb', () => {
    it('shows "← All projects / Name" with the current page marked', async () => {
      stubApi([full])
      renderAt('/projects/141-torah-mcp')
      const nav = await screen.findByRole('navigation', { name: 'Breadcrumb' })
      expect(within(nav).getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/')
      expect(within(nav).getByText('Torah MCP')).toHaveAttribute('aria-current', 'page')
    })

    it('goes back in history when the browse page is the previous entry', async () => {
      stubApi([full])
      renderAt({ pathname: '/projects/141-torah-mcp', state: FROM_BROWSE }, ['/?category=ai'])
      await userEvent.click(await screen.findByRole('link', { name: 'All projects' }))
      expect(await screen.findByText('Browse page')).toBeInTheDocument()
      // navigate(-1), not a push: the entry we left is the one we are on
      expect(screen.getByTestId('where')).toHaveTextContent('/')
    })

    it('leaves modified clicks to the browser instead of going back', async () => {
      stubApi([full])
      renderAt({ pathname: '/projects/141-torah-mcp', state: FROM_BROWSE }, ['/?category=ai'])
      const link = await screen.findByRole('link', { name: 'All projects' })
      fireEvent.click(link, { ctrlKey: true })
      expect(screen.queryByText('Browse page')).toBeNull()
    })

    it('links to / when the page was opened directly', async () => {
      stubApi([full])
      renderAt('/projects/141-torah-mcp')
      await userEvent.click(await screen.findByRole('link', { name: 'All projects' }))
      expect(await screen.findByText('Browse page')).toBeInTheDocument()
    })
  })

  it('has no axe violations', async () => {
    stubApi([full, sibling(5, 'Sibling')])
    const { container } = renderAt('/projects/141-torah-mcp')
    await screen.findByRole('heading', { level: 1 })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations for a known-issues project', async () => {
    stubApi([buggy])
    const { container } = renderAt('/projects/3-old-app')
    await screen.findByRole('note')
    expect(await axe(container)).toHaveNoViolations()
  })
})
