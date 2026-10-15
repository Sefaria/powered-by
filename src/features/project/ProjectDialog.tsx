import { useId } from 'react'
import { X } from 'lucide-react'
import { CATEGORY_META } from '../../lib/categories'
import type { Project } from '../../lib/project'
import { MEDIA_SM, useMediaQuery } from '../../hooks/useMediaQuery'
import { CategoryIcon } from '../../components/icons/CategoryIcon'
import { Dialog } from '../../components/ui/Dialog'
import { IconButton } from '../../components/ui/IconButton'
import { BugBadge } from '../../components/ui/BugBadge'
import { Tag } from '../../components/ui/Tag'
import { PrimaryCta, ProjectDetail } from './ProjectDetail'
import styles from './ProjectDialog.module.css'

interface ProjectDialogProps {
  project: Project
  onClose: () => void
}

/**
 * Centred modal from 640px, full screen below. The same ProjectDetail content
 * is shown in both; only the container (and where the primary CTA sits) changes.
 */
export function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const titleId = useId()
  const wide = useMediaQuery(MEDIA_SM)

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <ul className={styles.chips}>
            {project.categories.map((id) => (
              <li key={id}>
                <Tag variant="category" icon={<CategoryIcon id={id} size={14} />}>
                  {CATEGORY_META[id].label}
                </Tag>
              </li>
            ))}
          </ul>
          {project.isBuggy && (
            <span className={styles.issuesPill}>
              <BugBadge size="sm" />
              Known issues
            </span>
          )}
        </div>
        <IconButton filled aria-label="Close" onClick={onClose}>
          <X size={24} strokeWidth={2} aria-hidden="true" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <ProjectDetail project={project} titleId={titleId} inlineCta={wide} />
      </div>
      {!wide && project.url && (
        <div className={styles.footer}>
          <PrimaryCta project={project} compact />
        </div>
      )}
    </Dialog>
  )
}
