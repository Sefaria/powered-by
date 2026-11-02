import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ArrowUpRight, Heart, Menu, Plus, X } from 'lucide-react'
import { ExternalLink } from '../ui/ExternalLink'
import { IconButton } from '../ui/IconButton'
import { Container } from './Container'
import { SamekhLogo } from './SamekhLogo'
import styles from './SiteHeader.module.css'

export const SEFARIA_URL = 'https://www.sefaria.org'
export const DEVELOPERS_URL = 'https://developers.sefaria.org'
export const DONATE_URL = 'https://www.sefaria.org/donate'
// Link target only; the visible copy never mentions the form provider.
export const SUBMIT_URL = 'https://sefaria.formstack.com/forms/powered_by_sefaria_submission_form'

interface SiteHeaderProps {
  /** An optional in-app link shown first, e.g. back to all projects on /charts. */
  backLink?: { to: string; label: string }
}

/** Filled call to action. Reads "Submit a project" from 721px up and "Submit" below; the name stays the full phrase. */
function SubmitButton({ className }: { className?: string }) {
  return (
    <ExternalLink href={SUBMIT_URL} className={className} aria-label="Submit a project">
      <Plus size={18} strokeWidth={2} aria-hidden="true" />
      <span aria-hidden="true">
        Submit<span className={styles.submitMore}> a project</span>
      </span>
    </ExternalLink>
  )
}

function HeaderLinks({ backLink, menu }: SiteHeaderProps & { menu?: boolean }) {
  const row = menu ? styles.menuRow : styles.navLink
  return (
    <>
      {backLink && (
        <Link to={backLink.to} className={row}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
          {backLink.label}
        </Link>
      )}
      <ExternalLink href={SEFARIA_URL} className={row}>
        Sefaria.org
        <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
      </ExternalLink>
      <ExternalLink href={DEVELOPERS_URL} className={row}>
        Developer docs
        <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
      </ExternalLink>
      {!menu && <SubmitButton className={styles.submit} />}
      <ExternalLink href={DONATE_URL} className={menu ? styles.menuRow : styles.donate}>
        Donate
        <Heart size={18} strokeWidth={2} aria-hidden="true" />
      </ExternalLink>
    </>
  )
}

/** Below 1024px: a small right-aligned menu. Escape and outside click close it; focus returns to the trigger. */
function HeaderMenu({ backLink }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div className={styles.menu} ref={rootRef}>
      <IconButton
        ref={triggerRef}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <X size={24} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Menu size={24} strokeWidth={2} aria-hidden="true" />
        )}
      </IconButton>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <HeaderLinks backLink={backLink} menu />
      </div>
    </div>
  )
}

export function SiteHeader({ backLink }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <div className={styles.brand}>
          <SamekhLogo />
          <span className={styles.divider} aria-hidden="true" />
          <Link to="/" className={styles.title}>
            Powered by Sefaria
          </Link>
        </div>
        <nav aria-label="Site" className={styles.nav}>
          <HeaderLinks backLink={backLink} />
        </nav>
        <div className={styles.actions}>
          <SubmitButton className={`${styles.submit} ${styles.submitCompact}`} />
          <HeaderMenu backLink={backLink} />
        </div>
      </Container>
    </header>
  )
}
