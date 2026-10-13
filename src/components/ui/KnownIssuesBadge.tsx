import { TriangleAlert } from 'lucide-react'
import styles from './KnownIssuesBadge.module.css'

/** The only place a project's `is_buggy` flag is ever shown publicly. */
export function KnownIssuesBadge() {
  return (
    <span className={styles.badge}>
      <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" className={styles.icon} />
      Known issues
    </span>
  )
}
