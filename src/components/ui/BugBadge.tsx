import { Bug } from 'lucide-react'
import { cx } from './cx'
import styles from './BugBadge.module.css'

interface BugBadgeProps {
  /** md: 28px on grid and featured cards. sm: 24px in list rows, the dialog pill and the switch row. */
  size?: 'md' | 'sm'
  className?: string
}

/** The only place a project's `is_buggy` flag is ever shown publicly. The amber is a fill, never text. */
export function BugBadge({ size = 'md', className }: BugBadgeProps) {
  return (
    <span
      role="img"
      aria-label="Known issues"
      title="Known issues"
      className={cx(styles.badge, size === 'sm' && styles.small, className)}
    >
      <Bug size={size === 'sm' ? 14 : 16} strokeWidth={2} aria-hidden="true" />
    </span>
  )
}
