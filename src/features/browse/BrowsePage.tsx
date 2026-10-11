import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { activeFilterCount, categoryCounts, filterProjects, type Filters } from '../../lib/filter'
import { formatNumber } from '../../lib/format'
import { SORT_LABELS, sortProjects } from '../../lib/sort'
import type { Project } from '../../lib/project'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useProjectQueryState } from '../../hooks/useProjectQueryState'
import { useProjects } from '../../hooks/useProjects'
import { PageLayout } from '../../app/PageLayout'
import { Hero } from '../../components/layout/Hero'
import { Container } from '../../components/layout/Container'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProjectDialog } from '../project/ProjectDialog'
import { ActiveFilters } from './ActiveFilters'
import { FilterPanel } from './FilterPanel'
import { FilterSheet } from './FilterSheet'
import { ProjectGrid } from './ProjectGrid'
import { ProjectList } from './ProjectList'
import { ResultsSkeleton } from './ResultsSkeleton'
import { ResultsToolbar } from './ResultsToolbar'
import { ShowMore } from './ShowMore'
import styles from './BrowsePage.module.css'

const PAGE_SIZE = 24
const RESULTS_ID = 'results'

export function BrowsePage() {
  const data = useProjects()
  const { state, update, openProject, closeProject, dropProject } = useProjectQueryState()
  const [sheetOpen, setSheetOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Search input: instant locally, debounced into the URL (and so into the results).
  const [input, setInput] = useState(state.q)
  const debouncedInput = useDebouncedValue(input, 150)
  const syncQuery = useEffectEvent((q: string) => {
    if (q !== state.q) update({ q })
  })
  useEffect(() => {
    syncQuery(debouncedInput)
  }, [debouncedInput])

  const filters: Filters = {
    q: state.q,
    category: state.category,
    openSourceOnly: state.openSourceOnly,
  }
  const all = data.projects
  const filterCount = activeFilterCount(filters)
  const hasFilters = filterCount > 0 || state.q.trim() !== ''

  const counts = useMemo(
    () => (all ? categoryCounts(all, { q: state.q, openSourceOnly: state.openSourceOnly }) : null),
    [all, state.q, state.openSourceOnly],
  )
  const results = useMemo(
    () => (all ? sortProjects(filterProjects(all, filters), state.sort) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, state.q, state.category, state.openSourceOnly, state.sort],
  )

  // Page size resets whenever the filters, search or sort change.
  const signature = `${state.q}|${state.category}|${state.openSourceOnly}|${state.sort}`
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [seenSignature, setSeenSignature] = useState(signature)
  if (seenSignature !== signature) {
    setSeenSignature(signature)
    setLimit(PAGE_SIZE)
  }
  const visible = results.slice(0, limit)

  // After "Show more", move focus to the first newly shown item.
  const focusIndex = useRef<number | null>(null)
  useEffect(() => {
    if (focusIndex.current === null) return
    document.querySelector<HTMLElement>(`[data-result-index="${focusIndex.current}"]`)?.focus()
    focusIndex.current = null
  }, [limit])

  const selected =
    all && state.project !== null ? (all.find((p) => p.id === state.project) ?? null) : null
  const unknownProject = all !== null && state.project !== null && selected === null
  useEffect(() => {
    if (unknownProject) dropProject()
  }, [unknownProject, dropProject])

  const clearAll = () => {
    setInput('')
    update({ q: '', category: 'all', openSourceOnly: false })
  }

  const explore = () => {
    const heading = headingRef.current
    if (!heading) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    heading.focus({ preventScroll: true })
  }

  const summary = !all
    ? ''
    : hasFilters
      ? `${formatNumber(results.length)} ${results.length === 1 ? 'project matches' : 'projects match'}`
      : `Showing ${formatNumber(visible.length)} of ${formatNumber(results.length)} projects · ${
          state.sort === 'new' ? 'newest first' : SORT_LABELS[state.sort]
        }`

  const open = (project: Project) => openProject(project.id)

  return (
    <PageLayout skipTo={{ id: RESULTS_ID, label: 'Skip to projects' }}>
      <Hero projectCount={all?.length ?? null} onExplore={explore} />
      <Container className={styles.layout}>
        <aside className={styles.filters} aria-label="Filters">
          {counts && (
            <FilterPanel
              counts={counts}
              category={state.category}
              openSourceOnly={state.openSourceOnly}
              onCategoryChange={(category) => update({ category })}
              onOpenSourceChange={(openSourceOnly) => update({ openSourceOnly })}
            />
          )}
        </aside>
        <section className={styles.results} aria-busy={data.status === 'loading'}>
          <h2 id={RESULTS_ID} ref={headingRef} tabIndex={-1} className={styles.heading}>
            Browse projects
          </h2>
          <ResultsToolbar
            query={input}
            onQueryChange={setInput}
            activeFilterCount={filterCount}
            onOpenFilters={() => setSheetOpen(true)}
            sort={state.sort}
            onSortChange={(sort) => update({ sort })}
            view={state.view}
            onViewChange={(view) => update({ view })}
          />
          <p className={styles.summary} aria-live="polite">
            {summary}
          </p>
          <ActiveFilters
            filters={filters}
            onClearCategory={() => update({ category: 'all' })}
            onClearOpenSource={() => update({ openSourceOnly: false })}
          />

          {data.status === 'loading' && <ResultsSkeleton view={state.view} />}
          {data.status === 'error' && (
            <EmptyState
              title="We couldn't load projects right now."
              description="Check your connection and try again."
              action={<Button onClick={data.retry}>Try again</Button>}
            />
          )}
          {data.status === 'success' && results.length === 0 && (
            <EmptyState
              title="No projects match that search."
              description="Try a different word, or clear your filters."
              action={<Button onClick={clearAll}>Clear filters</Button>}
            />
          )}
          {data.status === 'success' && results.length > 0 && (
            <>
              {state.view === 'grid' ? (
                <ProjectGrid projects={visible} activeCategory={state.category} onOpen={open} />
              ) : (
                <ProjectList projects={visible} activeCategory={state.category} onOpen={open} />
              )}
              {visible.length < results.length && (
                <ShowMore
                  onClick={() => {
                    focusIndex.current = visible.length
                    setLimit((n) => n + PAGE_SIZE)
                  }}
                />
              )}
            </>
          )}
        </section>
      </Container>

      {sheetOpen && all && (
        <FilterSheet
          projects={all}
          filters={filters}
          onApply={(next) => update(next)}
          onClose={() => setSheetOpen(false)}
        />
      )}
      {selected && <ProjectDialog project={selected} onClose={closeProject} />}
    </PageLayout>
  )
}
