import {
  BookOpen,
  ChartColumn,
  Folder,
  LayoutGrid,
  Plug,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../../lib/categories'
import { cx } from '../ui/cx'
import styles from './CategoryIcon.module.css'

export type CategoryIconId = CategoryId | 'all'

// Lucide used directly: not yet in Sefaria's icon library.
const ICONS: Record<CategoryIconId, LucideIcon> = {
  learn: BookOpen,
  ai: Sparkles,
  community: Users,
  viz: ChartColumn,
  ext: Plug,
  none: Folder,
  all: LayoutGrid,
}

/** The bare category glyph (for filter rows). Decorative: the label is next to it. */
export function CategoryIcon({ id, size = 18 }: { id: CategoryIconId; size?: number }) {
  const Icon = ICONS[id]
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />
}

/** The glyph in a purple tile: 40px/24px on cards, 32px/18px in list rows. */
export function CategoryTile({ id, size = 'md' }: { id: CategoryIconId; size?: 'md' | 'sm' }) {
  return (
    <span className={cx(styles.tile, size === 'sm' && styles.small)} aria-hidden="true">
      <CategoryIcon id={id} size={size === 'sm' ? 18 : 24} />
    </span>
  )
}
