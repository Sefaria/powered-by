import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { FeaturedProjects } from '../FeaturedProjects'
import { makeProject } from '../../../test/factories'

const projects = [
  makeProject({
    id: 1,
    project_name: 'Torah MCP',
    project_desc: 'Ask your AI about Torah.',
    project_category: 'AI Projects, Apps, & Other Tools',
    project_link: 'https://www.torah.example/mcp',
    tags: ['AI', 'Chatbot'],
    featured: true,
  }),
  makeProject({
    id: 2,
    project_name: "Today's Daf",
    project_category: 'Learning & Study Tools',
    featured: true,
    is_buggy: true,
  }),
]

describe('FeaturedProjects', () => {
  it('renders nothing for an empty list: no band and no heading', () => {
    const { container } = render(<FeaturedProjects projects={[]} onOpen={() => {}} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('heading', { name: 'Featured projects' })).toBeNull()
  })

  it('is a section labelled by its heading, with the subtitle', () => {
    const { container } = render(<FeaturedProjects projects={projects} onOpen={() => {}} />)
    const band = container.querySelector('section') as HTMLElement
    const heading = within(band).getByRole('heading', { level: 2, name: 'Featured projects' })
    expect(heading).toHaveAttribute('id', 'featured-heading')
    expect(band).toHaveAttribute('aria-labelledby', 'featured-heading')
    expect(within(band).getByText('Hand-picked by the Sefaria team.')).toBeInTheDocument()
  })

  it('shows each card: category label, title button, description and domain, no tags', () => {
    render(<FeaturedProjects projects={projects} onOpen={() => {}} />)
    const card = screen.getByRole('heading', { level: 3, name: 'Torah MCP' }).closest('article')
    expect(card).not.toBeNull()
    const inCard = within(card as HTMLElement)
    expect(inCard.getByText('AI & Apps')).toBeInTheDocument()
    expect(inCard.getByRole('button', { name: 'Torah MCP' })).toBeInTheDocument()
    expect(inCard.getByText('Ask your AI about Torah.')).toBeInTheDocument()
    expect(inCard.getByText('torah.example')).toBeInTheDocument()
    expect(screen.queryByTestId('topic-tags')).toBeNull()
    expect(card?.textContent).not.toMatch(/Chatbot/)
  })

  it('opens the project from the title button', async () => {
    const onOpen = vi.fn()
    render(<FeaturedProjects projects={projects} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: 'Torah MCP' }))
    expect(onOpen).toHaveBeenCalledWith(projects[0])
  })

  it('marks a buggy project with the Known issues badge', () => {
    render(<FeaturedProjects projects={projects} onOpen={() => {}} />)
    expect(screen.getAllByText('Known issues')).toHaveLength(1)
  })

  it('makes the sideways scroller a focusable, named region below 900px', () => {
    // jsdom matches no media query, so this is the < 900px layout
    const { container } = render(<FeaturedProjects projects={projects} onOpen={() => {}} />)
    const scroller = container.querySelector('div[role="region"]')
    expect(scroller).toHaveAttribute('aria-label', 'Featured projects, scrollable')
    expect(scroller).toHaveAttribute('tabindex', '0')
    expect(within(scroller as HTMLElement).getAllByRole('listitem')).toHaveLength(2)
  })

  it('has no axe violations', async () => {
    const { container } = render(<FeaturedProjects projects={projects} onOpen={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
