import type { CSSProperties } from 'react'
import { CATEGORY_META } from '../../lib/categories'
import type { Project } from '../../lib/project'
import { KnownIssuesBadge } from '../../components/ui/KnownIssuesBadge'
import styles from './FeaturedCard.module.css'

interface FeaturedCardProps {
  project: Project
  onOpen: (project: Project) => void
}

/** A larger ProjectCard for the featured band: colored header art, no tags. The title button opens the dialog. */
export function FeaturedCard({ project, onOpen }: FeaturedCardProps) {
  const { label, Icon, colorVar } = CATEGORY_META[project.categories[0] ?? 'none']
  return (
    <article className={styles.card}>
      <div
        className={styles.art}
        style={{ '--art-color': colorVar } as CSSProperties}
        aria-hidden="true"
      >
        <Icon className={styles.watermark} size={168} strokeWidth={1} />
        <span className={styles.tile}>
          <Icon size={26} strokeWidth={2} />
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{label}</span>
          {project.isBuggy && <KnownIssuesBadge />}
        </div>
        <h3 className={styles.heading}>
          <button type="button" className={styles.title} onClick={() => onOpen(project)}>
            {project.name}
          </button>
        </h3>
        {project.description && <p className={styles.description}>{project.description}</p>}
        {project.domain && <p className={styles.domain}>{project.domain}</p>}
      </div>
    </article>
  )
}
