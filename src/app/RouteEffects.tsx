import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { trackPageview } from '../lib/analytics'
import { VisuallyHidden } from '../components/ui/VisuallyHidden'

/** Per-route work that belongs to no single page: page views, and announcing the new title. */
export function RouteEffects() {
  const { pathname } = useLocation()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    trackPageview(pathname)
  }, [pathname])

  // Pages set document.title as they load (some lazily), so announce whenever it changes
  // after a client-side navigation rather than guessing a delay.
  useEffect(() => {
    const title = document.querySelector('title')
    if (!title) return
    const observer = new MutationObserver(() => setAnnouncement(document.title))
    observer.observe(title, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      <VisuallyHidden>{announcement}</VisuallyHidden>
    </div>
  )
}
