import type { ReactNode } from 'react'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SkipLink } from '../components/layout/SkipLink'

interface PageLayoutProps {
  /** Where the skip link goes: the id of the main content's heading. */
  skipTo: { id: string; label: string }
  backLink?: { to: string; label: string }
  children: ReactNode
}

/** Landmarks shared by every page: skip link, header, main, footer. */
export function PageLayout({ skipTo, backLink, children }: PageLayoutProps) {
  return (
    <>
      <SkipLink targetId={skipTo.id}>{skipTo.label}</SkipLink>
      <SiteHeader backLink={backLink} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  )
}
