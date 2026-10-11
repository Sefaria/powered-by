import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { ProjectDetail } from '../ProjectDetail'
import { makeProject } from '../../../test/factories'

const full = makeProject({
  project_name: 'Full Project',
  project_desc: 'Does things.',
  project_why: 'Because we needed it.',
  project_link: 'https://www.example.com/app',
  project_source_code: 'https://github.com/x/y',
  tags: ['Gemara', 'AI'],
  sefaria_tools_used: ['/api/texts/', 'Documentation'],
  tech_used_raw: 'React and Python',
  project_reach: '~100',
  submission_date: '2026-07-19T14:54:00+00:00',
  technical_experience: '5-10 years',
  vibe_coded: true,
  is_buggy: true,
  status: 'live',
  featured: true,
  submission_source: 'formstack',
  image_url: 'https://img.example.com/x.png',
  has_pbs_logo: true,
})

const empty = makeProject({
  project_desc: null,
  project_why: null,
  project_link: null,
  project_source_code: null,
  tags: [],
  sefaria_tools_used: [],
  tech_used_raw: null,
  project_reach: null,
  submission_date: null,
})

describe('ProjectDetail', () => {
  it('shows every populated section, including reported reach', () => {
    render(<ProjectDetail project={full} titleId="t" inlineCta />)
    expect(screen.getByRole('heading', { level: 2, name: 'Full Project' })).toHaveAttribute(
      'id',
      't',
    )
    expect(screen.getByRole('link', { name: /Open Full Project/ })).toHaveAttribute(
      'href',
      'https://www.example.com/app',
    )
    expect(screen.getByText('Opens example.com in a new tab')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View source code/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Project Backstory' })).toBeInTheDocument()
    expect(screen.getByText('Because we needed it.')).toBeInTheDocument()
    expect(screen.getByText('Sefaria resources used')).toBeInTheDocument()
    expect(screen.getByText('/api/texts')).toBeInTheDocument()
    expect(screen.getByText('Built with')).toBeInTheDocument()
    expect(screen.getByText('React and Python')).toBeInTheDocument()
    expect(screen.getByText('Topics')).toBeInTheDocument()
    expect(screen.getByText('Reported reach')).toBeInTheDocument()
    expect(screen.getByText(/About 100 users/)).toBeInTheDocument()
    expect(screen.getByText(/approximate, self-reported/)).toBeInTheDocument()
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Jul 19, 2026')).toBeInTheDocument()
  })

  it('never renders internal fields', () => {
    const { container } = render(<ProjectDetail project={full} titleId="t" inlineCta />)
    const text = container.textContent ?? ''
    for (const hidden of [
      'Technical',
      'Formstack',
      'vibe',
      'Vibe',
      'buggy',
      'Featured',
      'Added to database',
      'experience',
    ]) {
      expect(text).not.toContain(hidden)
    }
    expect(container.querySelector('iframe, img')).toBeNull()
  })

  it('omits sections with no data, never an empty label', () => {
    render(<ProjectDetail project={empty} titleId="t" inlineCta />)
    for (const label of [
      'Project Backstory',
      'Sefaria resources used',
      'Built with',
      'Topics',
      'Reported reach',
      'Submitted',
      /Open /,
      /View source/,
    ]) {
      expect(screen.queryByText(label)).toBeNull()
    }
    expect(document.querySelector('dl')).toBeNull()
  })

  it('moves the primary CTA out of the content when it is not inline', () => {
    render(<ProjectDetail project={full} titleId="t" inlineCta={false} />)
    expect(screen.queryByRole('link', { name: /Open Full Project/ })).toBeNull()
    expect(screen.getByRole('link', { name: /View source code/ })).toBeInTheDocument()
  })

  it('shows English as a topic only when it is the only one', () => {
    const { rerender } = render(
      <ProjectDetail
        project={makeProject({ tags: ['English', 'Gemara'] })}
        titleId="t"
        inlineCta
      />,
    )
    expect(screen.queryByText('English')).toBeNull()
    rerender(<ProjectDetail project={makeProject({ tags: ['English'] })} titleId="t" inlineCta />)
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('external links announce that they open in a new tab', () => {
    render(<ProjectDetail project={full} titleId="t" inlineCta />)
    const cta = screen.getByRole('link', { name: /Open Full Project/ })
    expect(cta).toHaveAccessibleName(/opens in a new tab/)
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noreferrer')
  })

  it('has no axe violations', async () => {
    const { container } = render(<ProjectDetail project={full} titleId="t" inlineCta />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
