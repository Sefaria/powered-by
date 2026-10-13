import { render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { ProjectDialog } from '../ProjectDialog'
import { makeProject } from '../../../test/factories'

describe('ProjectDialog', () => {
  it('shows the Known issues badge in the header only for a project with known issues', () => {
    const { unmount } = render(<ProjectDialog project={makeProject()} onClose={() => {}} />)
    expect(screen.queryByText('Known issues')).toBeNull()
    unmount()
    render(<ProjectDialog project={makeProject({ is_buggy: true })} onClose={() => {}} />)
    expect(screen.getByText('Known issues')).toBeInTheDocument()
  })

  it('keeps the category chips as purple "category" tags (no per-category color)', () => {
    render(
      <ProjectDialog
        project={makeProject({ project_category: 'Learning & Study Tools' })}
        onClose={() => {}}
      />,
    )
    const chip = screen.getByText('Learning & Study')
    expect(chip.closest('[style]')).toBeNull()
    expect(within(chip.parentElement as HTMLElement).queryByRole('img')).toBeNull()
  })

  it('has no axe violations with the badge', async () => {
    render(<ProjectDialog project={makeProject({ is_buggy: true })} onClose={() => {}} />)
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations()
  })
})
