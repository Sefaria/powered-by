import { CATEGORIES, getCategoryMeta } from '../../lib/categories'
import type { CategoryCounts, CategoryFilter } from '../../lib/filter'
import { CategoryIcon } from '../../components/icons/CategoryIcon'
import { Checkbox } from '../../components/ui/Checkbox'
import { cx } from '../../components/ui/cx'
import styles from './FilterPanel.module.css'

interface FilterPanelProps {
  counts: CategoryCounts
  category: CategoryFilter
  openSourceOnly: boolean
  onCategoryChange: (category: CategoryFilter) => void
  onOpenSourceChange: (value: boolean) => void
  /** Taller 52px rows, for the mobile sheet. */
  large?: boolean
  /** Unique radio group name when more than one panel can exist at once. */
  name?: string
}

const ROWS: ReadonlyArray<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All projects' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: getCategoryMeta(c.id).shortLabel })),
]

/** Category radio group plus the "Open source only" checkbox. Used in the sidebar and the sheet. */
export function FilterPanel({
  counts,
  category,
  openSourceOnly,
  onCategoryChange,
  onOpenSourceChange,
  large,
  name = 'category',
}: FilterPanelProps) {
  return (
    <div className={styles.panel}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>CATEGORY</legend>
        {ROWS.map(({ id, label }) => (
          <label
            key={id}
            className={cx(styles.row, large && styles.large, id === category && styles.selected)}
          >
            <input
              type="radio"
              name={name}
              className={styles.input}
              checked={id === category}
              onChange={() => onCategoryChange(id)}
            />
            <span className={styles.radio} aria-hidden="true" />
            <span className={styles.icon}>
              <CategoryIcon id={id} />
            </span>
            <span className={styles.label}>{label}</span>
            <span className={styles.count}>{counts[id]}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>CODE</legend>
        <Checkbox label="Open source only" checked={openSourceOnly} onChange={onOpenSourceChange} />
      </fieldset>
    </div>
  )
}
