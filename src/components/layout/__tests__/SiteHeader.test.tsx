import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { SiteHeader } from '../SiteHeader'

const renderHeader = () =>
  render(
    <MemoryRouter>
      <SiteHeader />
    </MemoryRouter>,
  )

describe('SiteHeader', () => {
  it('links the logo to the developer portal and the wordmark home', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /Developers on Sefaria/ })).toHaveAttribute(
      'href',
      'https://developers.sefaria.org',
    )
    expect(screen.getByRole('link', { name: 'Powered by Sefaria' })).toHaveAttribute('href', '/')
  })

  it('announces external links as opening in a new tab', () => {
    renderHeader()
    expect(
      screen.getAllByRole('link', {
        name: /Sefaria\.org\s*\(opens in a new tab\)/,
        hidden: true,
      })[0],
    ).toHaveAttribute('target', '_blank')
  })

  it('opens the menu, closes it on Escape and returns focus to the trigger', async () => {
    renderHeader()
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    await userEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
  })

  it('closes the menu on an outside click', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.click(document.body)
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('has no axe violations', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })
})
