import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../lib/project'
import styles from './QuickOpenLink.module.css'

/**
 * A real link to the project's site, for card headers. Sits above the card's stretched
 * click overlay, so it never opens the dialog. Renders nothing without a URL.
 */
export function QuickOpenLink({ project }: { project: Pick<Project, 'name' | 'url'> }) {
  if (!project.url) return null
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      className={styles.link}
      aria-label={`Visit ${project.name} (opens in a new tab)`}
      title="Open project"
    >
      <ArrowUpRight size={20} strokeWidth={2} aria-hidden="true" />
    </a>
  )
}
