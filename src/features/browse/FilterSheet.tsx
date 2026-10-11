import { useId, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  categoryCounts,
  DEFAULT_FILTERS,
  filterProjects,
  type CategoryFilter,
  type Filters,
} from '../../lib/filter'
import type { Project } from '../../lib/project'
import { formatNumber, pluralize } from '../../lib/format'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { IconButton } from '../../components/ui/IconButton'
import { FilterPanel } from './FilterPanel'
import styles from './FilterSheet.module.css'

interface FilterSheetProps {
  projects: readonly Project[]
  filters: Filters
  onApply: (next: Pick<Filters, 'category'>) => void
  onClose: () => void
}

/**
 * A bottom sheet. The selection is held here and only applied on "Show";
 * closing any other way discards it. Mount to open, unmount to close.
 */
export function FilterSheet({ projects, filters, onApply, onClose }: FilterSheetProps) {
  const titleId = useId()
  const [category, setCategory] = useState<CategoryFilter>(filters.category)

  const counts = useMemo(() => categoryCounts(projects, { q: filters.q }), [projects, filters.q])
  const matching = useMemo(
    () => filterProjects(projects, { q: filters.q, category }).length,
    [projects, filters.q, category],
  )

  return (
    <Dialog placement="sheet" labelledBy={titleId} onClose={onClose}>
      <div className={styles.handle} aria-hidden="true" />
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          Filters
        </h2>
        <IconButton filled aria-label="Close" onClick={onClose}>
          <X size={24} strokeWidth={2} aria-hidden="true" />
        </IconButton>
      </div>
      <div className={styles.body}>
        <FilterPanel
          large
          name="sheet-category"
          counts={counts}
          category={category}
          onCategoryChange={setCategory}
        />
      </div>
      <div className={styles.footer}>
        <Button variant="text" onClick={() => setCategory(DEFAULT_FILTERS.category)}>
          Clear all
        </Button>
        <Button
          variant="primary"
          size="lg"
          className={styles.show}
          onClick={() => {
            onApply({ category })
            onClose()
          }}
        >
          Show {formatNumber(matching)} {pluralize(matching, 'project')}
        </Button>
      </div>
    </Dialog>
  )
}
