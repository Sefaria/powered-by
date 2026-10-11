import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS } from '../../../lib/filter'
import { FilterSheet } from '../FilterSheet'
import { makeProject } from '../../../test/factories'

const projects = [
  makeProject({ id: 1, project_category: 'Learning & Study Tools' }),
  makeProject({
    id: 2,
    project_category: 'Learning & Study Tools',
    project_source_code: 'https://github.com/a/b',
  }),
  makeProject({ id: 3, project_category: 'AI Projects, Apps, & Other Tools' }),
]

function setup() {
  const onApply = vi.fn()
  const onClose = vi.fn()
  const utils = render(
    <FilterSheet
      projects={projects}
      filters={DEFAULT_FILTERS}
      onApply={onApply}
      onClose={onClose}
    />,
  )
  return { onApply, onClose, ...utils }
}

describe('FilterSheet', () => {
  it('starts from the current filters and shows the live count on the Show button', () => {
    setup()
    expect(screen.getByRole('radio', { name: /All projects/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Show 3 projects' })).toBeInTheDocument()
  })

  it('updates the count with the pending selection without applying it', async () => {
    const { onApply } = setup()
    await userEvent.click(screen.getByRole('radio', { name: /AI & Apps/ }))
    expect(screen.getByRole('button', { name: 'Show 1 project' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Open source only' }))
    expect(screen.getByRole('button', { name: 'Show 0 projects' })).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('applies the selection on Show', async () => {
    const { onApply, onClose } = setup()
    await userEvent.click(screen.getByRole('radio', { name: /Learning & Study/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Open source only' }))
    await userEvent.click(screen.getByRole('button', { name: 'Show 1 project' }))
    expect(onApply).toHaveBeenCalledWith({ category: 'learn', openSourceOnly: true })
    expect(onClose).toHaveBeenCalled()
  })

  it('discards the selection when closed without Show', async () => {
    const { onApply, onClose } = setup()
    await userEvent.click(screen.getByRole('radio', { name: /AI & Apps/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('Clear all resets the pending selection', async () => {
    setup()
    await userEvent.click(screen.getByRole('radio', { name: /AI & Apps/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getByRole('radio', { name: /All projects/ })).toBeChecked()
  })

  it('has no axe violations', async () => {
    setup()
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations()
  })
})
