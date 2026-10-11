import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const MEDIA_SM = '(min-width: 640px)'
export const MEDIA_LG = '(min-width: 1024px)'
