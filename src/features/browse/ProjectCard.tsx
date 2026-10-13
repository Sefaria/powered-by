import { CATEGORY_META } from '../../lib/categories'
import type { CategoryFilter } from '../../lib/filter'
import type { Project } from '../../lib/project'
import { CategoryTile } from '../../components/icons/CategoryIcon'
import { KnownIssuesBadge } from '../../components/ui/KnownIssuesBadge'
import { TopicTags } from './TopicTags'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  project: Project
  /** When the list is filtered by a category, the card shows that one. */
  activeCategory: CategoryFilter
  resultIndex: number
  onOpen: (project: Project) => void
}

/** A closed card shows only icon, category, title, description, topics and, when shown, the known-issues badge. The whole card is the button. */
export function ProjectCard({ project, activeCategory, resultIndex, onOpen }: ProjectCardProps) {
  const categoryId = activeCategory !== 'all' ? activeCategory : (project.categories[0] ?? 'none')
  const topics = project.topics.slice(0, 3)
  return (
    <article className={styles.card}>
      <div className={styles.category}>
        <CategoryTile id={categoryId} />
        <span className={styles.categoryLabel}>{CATEGORY_META[categoryId].label}</span>
      </div>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.title}
          data-result-index={resultIndex}
          onClick={() => onOpen(project)}
        >
          {project.name}
        </button>
      </h3>
      {project.description && <p className={styles.description}>{project.description}</p>}
      {project.isBuggy && <KnownIssuesBadge />}
      {topics.length > 0 && <TopicTags topics={topics} size="sm" />}
    </article>
  )
}
