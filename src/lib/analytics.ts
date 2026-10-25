/**
 * Plausible-compatible analytics, off unless VITE_ANALYTICS_DOMAIN is set.
 * No cookies, no storage, no user ids; events carry only project ids and UI context,
 * and never search text. Respects Do Not Track and Global Privacy Control.
 */
export type SearchResults = '0' | '1-5' | '6+'

export interface AnalyticsEvents {
  project_outbound: {
    project_id: number
    surface: 'card' | 'list' | 'featured' | 'page'
    has_issues: boolean
  }
  project_source: { project_id: number }
  featured_open: { project_id: number; position: number }
  filter_change: { facet: string }
  sort_change: { sort: string }
  view_change: { view: string }
  search: { has_query: true; results: SearchResults }
}

interface Plausible {
  (event: string, options?: { props?: object }): void
  q?: unknown[]
}

declare global {
  interface Window {
    plausible?: Plausible
  }
}

export const DEFAULT_SRC = 'https://plausible.io/js/script.manual.js'

let enabled = false

interface PrivacySignals {
  doNotTrack?: string | null
  globalPrivacyControl?: boolean
}

function optedOut(): boolean {
  const nav = navigator as Navigator & PrivacySignals
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true
}

/** Whether events are being sent. The footer's privacy line follows this. */
export function analyticsEnabled(): boolean {
  return enabled
}

/** Injects the script when configured and not opted out. Safe to call more than once. */
export function initAnalytics(): boolean {
  if (enabled) return true
  try {
    const domain = import.meta.env.VITE_ANALYTICS_DOMAIN
    if (!domain || optedOut()) return false
    // Plausible's own queue stub, so events fired before the script loads aren't lost.
    const queue: Plausible = (...args: unknown[]) => {
      ;(queue.q ??= []).push(args)
    }
    window.plausible ??= queue
    const script = document.createElement('script')
    script.defer = true
    script.dataset.domain = domain
    script.src = import.meta.env.VITE_ANALYTICS_SRC || DEFAULT_SRC
    document.head.appendChild(script)
    enabled = true
    return true
  } catch {
    return false
  }
}

/** For tests. */
export function resetAnalytics() {
  enabled = false
}

function send(event: string, props?: object) {
  if (!enabled) return
  try {
    window.plausible?.(event, props ? { props } : undefined)
  } catch {
    // analytics must never break the page
  }
}

export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  send(event, props)
}

/** SPA page view. The charts page is never counted. */
export function trackPageview(pathname: string) {
  if (pathname === '/charts' || pathname.startsWith('/charts/')) return
  send('pageview')
}

export function searchResultsBucket(count: number): SearchResults {
  return count === 0 ? '0' : count <= 5 ? '1-5' : '6+'
}
