import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ProjectCard } from '../ProjectCard'
import { makeProject } from '../../../test/factories'

const project = makeProject({
  project_name: 'Talmud Helper',
  project_desc: 'Study aid for the daf.',
  project_category: 'AI Projects, Apps, & Other Tools Learning & Study Tools',
  tags: ['English', 'Gemara', 'AI', 'Tanakh', 'Hebrew'],
  project_source_code: 'https://github.com/x/y',
  sefaria_tools_used: ['/api/texts'],
  tech_used_raw: 'React',
  technical_experience: 'None',
  vibe_coded: true,
  status: 'live',
  featured: true,
})

function renderCard(overrides: Partial<Parameters<typeof ProjectCard>[0]> = {}) {
  const onOpen = vi.fn()
  const utils = render(
    <ProjectCard
      project={project}
      activeCategory="all"
      resultIndex={0}
      onOpen={onOpen}
      {...overrides}
    />,
  )
  return { onOpen, ...utils }
}

const topicTagsCss = readFileSync(
  join(process.cwd(), 'src/features/browse/TopicTags.module.css'),
  'utf8',
)

describe('ProjectCard', () => {
  it('renders exactly the category label, title, description and up to 3 topics (no English)', () => {
    const { container } = renderCard()
    const card = container.querySelector('article') as HTMLElement
    expect(within(card).getByText('AI & Apps')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { level: 3, name: 'Talmud Helper' }),
    ).toBeInTheDocument()
    expect(within(card).getByText('Study aid for the daf.')).toBeInTheDocument()
    const tags = within(card).getByTestId('topic-tags')
    expect([...tags.children].map((t) => t.textContent)).toEqual(['Gemara', 'AI', 'Tanakh'])
    // nothing else: only one interactive element, no links
    expect(within(card).getAllByRole('button')).toHaveLength(1)
    expect(within(card).queryByRole('link')).toBeNull()
    expect(card.textContent).not.toMatch(/github|React|Texts|\/api|2026|live|vibe/i)
  })

  it('keeps the tag row to a single clipped line', () => {
    renderCard()
    // jsdom applies no layout, so assert the row's class and that its CSS holds the clamp.
    expect(screen.getByTestId('topic-tags')).toHaveClass('rowSm')
    const rule = /\.rowSm,\s*\.rowXs\s*{([^}]*)}/.exec(topicTagsCss)?.[1] ?? ''
    expect(rule).toMatch(/display:\s*flex/)
    expect(rule).toMatch(/flex-wrap:\s*wrap/)
    expect(rule).toMatch(/overflow:\s*hidden/)
    expect(/\.rowSm\s*{([^}]*)}/.exec(topicTagsCss)?.[1]).toMatch(/height:\s*28px/)
  })

  it('shows the filtered category instead of the first one', () => {
    renderCard({ activeCategory: 'learn' })
    expect(screen.getByText('Learning & Study')).toBeInTheDocument()
  })

  it('opens when the title is activated', async () => {
    const { onOpen } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Talmud Helper' }))
    expect(onOpen).toHaveBeenCalledWith(project)
  })

  it('has no axe violations', async () => {
    const { container } = renderCard()
    expect(await axe(container)).toHaveNoViolations()
  })
})
