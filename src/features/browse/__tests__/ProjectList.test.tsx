import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { ProjectList } from '../ProjectList'
import { makeProject } from '../../../test/factories'

const projects = [
  makeProject({ id: 1, project_name: 'Fine' }),
  makeProject({ id: 2, project_name: 'Broken', is_buggy: true }),
]

describe('ProjectList', () => {
  it('shows the Known issues badge only on the buggy row (narrow rows)', () => {
    render(<ProjectList projects={projects} activeCategory="all" onOpen={() => {}} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).not.toHaveTextContent('Known issues')
    expect(rows[1]).toHaveTextContent('Known issues')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ProjectList projects={projects} activeCategory="all" onOpen={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
