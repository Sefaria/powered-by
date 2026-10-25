import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  analyticsEnabled,
  initAnalytics,
  resetAnalytics,
  searchResultsBucket,
  track,
  trackPageview,
} from '../analytics'

const plausible = vi.fn()

function setPrivacy(signals: { doNotTrack?: string; globalPrivacyControl?: boolean }) {
  Object.defineProperty(navigator, 'doNotTrack', { value: signals.doNotTrack, configurable: true })
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    value: signals.globalPrivacyControl,
    configurable: true,
  })
}

beforeEach(() => {
  resetAnalytics()
  plausible.mockReset()
  window.plausible = plausible
  document.head.querySelectorAll('script[data-domain]').forEach((s) => s.remove())
  setPrivacy({})
})

afterEach(() => {
  vi.unstubAllEnvs()
  delete window.plausible
})

describe('analytics', () => {
  it('does nothing when VITE_ANALYTICS_DOMAIN is unset', () => {
    expect(initAnalytics()).toBe(false)
    track('project_source', { project_id: 1 })
    trackPageview('/')
    expect(analyticsEnabled()).toBe(false)
    expect(plausible).not.toHaveBeenCalled()
    expect(document.querySelector('script[data-domain]')).toBeNull()
  })

  it('injects a deferred script for the domain, with a custom src when given', () => {
    vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'powered-by.sefaria.org')
    vi.stubEnv('VITE_ANALYTICS_SRC', 'https://stats.example/js/script.manual.js')
    expect(initAnalytics()).toBe(true)
    const script = document.querySelector<HTMLScriptElement>('script[data-domain]')
    expect(script?.defer).toBe(true)
    expect(script?.dataset.domain).toBe('powered-by.sefaria.org')
    expect(script?.src).toBe('https://stats.example/js/script.manual.js')
  })

  it.each([
    ['Do Not Track', { doNotTrack: '1' }],
    ['Global Privacy Control', { globalPrivacyControl: true }],
  ])('stays off when %s is on', (_name, signals) => {
    vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'powered-by.sefaria.org')
    setPrivacy(signals)
    expect(initAnalytics()).toBe(false)
    track('project_source', { project_id: 1 })
    expect(plausible).not.toHaveBeenCalled()
    expect(document.querySelector('script[data-domain]')).toBeNull()
  })

  it('sends events with only the props given, and never throws', () => {
    vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'powered-by.sefaria.org')
    initAnalytics()
    track('search', { has_query: true, results: searchResultsBucket(3) })
    expect(plausible).toHaveBeenCalledWith('search', { props: { has_query: true, results: '1-5' } })
    plausible.mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => track('view_change', { view: 'list' })).not.toThrow()
  })

  it('never counts the charts page', () => {
    vi.stubEnv('VITE_ANALYTICS_DOMAIN', 'powered-by.sefaria.org')
    initAnalytics()
    trackPageview('/charts')
    expect(plausible).not.toHaveBeenCalled()
    trackPageview('/projects/1-x')
    expect(plausible).toHaveBeenCalledWith('pageview', undefined)
  })

  it('buckets search results', () => {
    expect([0, 1, 5, 6, 100].map(searchResultsBucket)).toEqual(['0', '1-5', '1-5', '6+', '6+'])
  })
})
