import { useEffect } from 'react'

/** Sets the document title and, optionally, a robots meta tag for the lifetime of the page. */
export function useDocumentMeta({ title, robots }: { title: string; robots?: string }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    let meta: HTMLMetaElement | null = null
    if (robots) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      meta.content = robots
      document.head.appendChild(meta)
    }
    return () => {
      document.title = previousTitle
      meta?.remove()
    }
  }, [title, robots])
}
