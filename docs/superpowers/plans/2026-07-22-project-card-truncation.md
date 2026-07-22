# ProjectCard Description Truncation Implementation Plan

> **Superseded:** the design this plan implements was replaced by [`2026-07-22-project-card-description-scroll-design.md`](../specs/2026-07-22-project-card-description-scroll-design.md). Kept as a historical record — Tasks 1-2 below were completed and then reverted on the same branch.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clamp `ProjectCard` descriptions to 3 lines with a "view more"/"view less" toggle, shown only when the description actually overflows, so all cards in the grid stay roughly the same height.

**Architecture:** `ProjectCard` becomes a stateful leaf component: local `useState` for `expanded` and `isOverflowing`, a `ref` on the description `<p>` to detect overflow via `scrollHeight`/`clientHeight` comparison in a `useEffect`, and a conditional CSS class controlling the line-clamp.

**Tech Stack:** React 19 (`useState`, `useEffect`, `useRef`), plain CSS (`-webkit-line-clamp`). No new dependencies.

## Global Constraints

- No new npm dependencies (spec: scope is `ProjectCard.jsx` and `index.css` only).
- Every modified `.jsx`/`.js` file must pass `npm run lint`.
- No automated test suite in this project — verification is manual, via `npm run dev` in the browser (spec: out of scope, consistent with v1 dashboard plan).
- Expand/collapse state is local per card — expanding one card must not affect others (spec).
- Overflow check runs once on mount; no `ResizeObserver` — accepted limitation, do not add one (spec).
- No animation on expand/collapse — instant show/hide (spec).

---

### Task 1: Add clamp + overflow-detection logic to ProjectCard

**Files:**
- Modify: `src/components/ProjectCard.jsx`

**Interfaces:**
- Produces: same default export `ProjectCard`, same `project` prop shape as before (no changes to how `ProjectGrid` calls it). Internally adds local state and a ref; no new props.

- [ ] **Step 1: Replace `src/components/ProjectCard.jsx` with the full version**

```jsx
import { useEffect, useRef, useState } from 'react'

function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const descRef = useRef(null)

  useEffect(() => {
    const el = descRef.current
    if (el && el.scrollHeight > el.clientHeight) {
      setIsOverflowing(true)
    }
  }, [])

  return (
    <div className="project-card">
      {project.image_url && (
        <img
          className="project-card-image"
          src={project.image_url}
          alt={`${project.project_name} logo`}
        />
      )}
      <h3>{project.project_name}</h3>
      <span className="project-card-category">{project.primaryCategory}</span>
      <p ref={descRef} className={expanded ? '' : 'clamped'}>
        {project.project_desc}
      </p>
      {isOverflowing && (
        <button
          type="button"
          className="project-card-toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'view less' : 'view more'}
        </button>
      )}
      <a href={project.project_link} target="_blank" rel="noreferrer">
        Visit project
      </a>
    </div>
  )
}

export default ProjectCard
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors on `src/components/ProjectCard.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat: add description clamp and overflow-detection to ProjectCard"
```

---

### Task 2: Add clamp and toggle styling

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: the `.clamped` class name and `.project-card-toggle` class name introduced in Task 1.
- Produces: no new interfaces — CSS only, using existing custom properties (`--accent`) already defined in `:root` for light/dark mode consistency.

- [ ] **Step 1: Append clamp and toggle rules to `src/index.css`**

Add these rules at the end of the existing file (after the `.empty-state` block):

```css
.clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card-toggle {
  align-self: flex-start;
  font: inherit;
  font-size: 14px;
  color: var(--accent);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev` (if not already running), open the local URL.

Check:
1. Find a card with a long description — confirm it shows exactly 3 lines with an ellipsis and a "view more" link below it.
2. Click "view more" — confirm the full description shows, the card grows taller, other cards in the grid reflow, and the button now says "view less".
3. Click "view less" — confirm it re-collapses to 3 lines.
4. Find a card with a short description (fits within 3 lines) — confirm no "view more" link appears on it.
5. Confirm all collapsed cards are now roughly the same height (no more wildly different card heights from long descriptions).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: add clamp and toggle styling for ProjectCard descriptions"
```

---

## Self-Review Notes

- **Spec coverage:** 3-line CSS clamp (Task 1 + 2), overflow-only toggle visibility via `scrollHeight`/`clientHeight` check (Task 1), expand-in-place behavior with card growth and grid reflow (Task 1, CSS naturally handles reflow since `.project-grid` is already a responsive grid), per-card independent state (Task 1, `useState` is local to each `ProjectCard` instance), accepted mount-only overflow check limitation (Task 1, no `ResizeObserver` added), no animation (Task 1, plain conditional class swap). All spec sections covered.
- **Type/signature consistency:** `ProjectCard`'s `project` prop is unchanged from the existing implementation, so `ProjectGrid`'s `<ProjectCard key={project.id} project={project} />` call (unchanged) still works. `.clamped` class name used identically in Task 1 (JSX) and Task 2 (CSS). `.project-card-toggle` class name used identically in Task 1 and Task 2.
- **No new npm dependencies**, confirmed — only `useEffect`/`useRef`/`useState` from `react`, already a dependency.
