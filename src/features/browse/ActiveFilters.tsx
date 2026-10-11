import { X } from 'lucide-react'
import { getCategoryMeta } from '../../lib/categories'
import type { Filters } from '../../lib/filter'
import styles from './ActiveFilters.module.css'

interface ActiveFiltersProps {
  filters: Filters
  onClearCategory: () => void
  onClearOpenSource: () => void
}

/** Removable chips for the active filters (mobile and tablet). */
export function ActiveFilters({ filters, onClearCategory, onClearOpenSource }: ActiveFiltersProps) {
  const chips = [
    filters.category !== 'all' && {
      key: 'category',
      label: getCategoryMeta(filters.category).shortLabel,
      onRemove: onClearCategory,
    },
    filters.openSourceOnly && { key: 'open', label: 'Open source', onRemove: onClearOpenSource },
  ].filter((chip): chip is { key: string; label: string; onRemove: () => void } => chip !== false)

  if (chips.length === 0) return null
  return (
    <ul className={styles.list} aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button type="button" className={styles.button} onClick={chip.onRemove}>
            <span className={styles.chip}>
              {chip.label}
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className={styles.srOnly}>Remove filter</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
