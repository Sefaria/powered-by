# Powered by Sefaria Dashboard v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a React dashboard that fetches, searches, filters, sorts, and displays the ~36 community projects from `https://www.sefaria.org/api/powered-by` as a responsive card grid.

**Architecture:** `Dashboard` (stateful) fetches and holds all project data, search text, and category filter in `useState`; it passes a derived, filtered/sorted list down to presentational children (`Controls`, `ProjectGrid`, `ProjectCard`) via props. No external state library, no new dependencies.

**Tech Stack:** React 19, Vite 8, plain `fetch`, no test framework (manual verification only, per spec).

## Global Constraints

- No new npm dependencies — use the browser's built-in `fetch` only (spec: "No new dependencies are needed").
- Node 20.19+ or 22.12+ per `.nvmrc` (project prerequisite, unchanged).
- Every new/modified `.js`/`.jsx` file must pass `npm run lint` (existing ESLint config: `js.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`).
- API endpoint is fixed: `https://www.sefaria.org/api/powered-by`. Call it directly — no mocking, no local fixture data (spec: live API is the only data source).
- Category label set is exactly these 5, plus a legacy variant that normalizes to the 5th, plus a synthetic `"Uncategorized"` fallback (spec, corrected 2026-07-21):
  1. `AI Projects, Apps, & Other Tools`
  2. `Learning & Study Tools`
  3. `Community, Interaction, & Social`
  4. `Visualization & Data Analysis`
  5. `Extensions, API Integrations, & GitHub Code` (legacy variant string: `Extensions and API Integrations`)
- Only projects with `is_published === true` and `consent_to_display === true` are ever shown.
- No automated test suite in v1 (spec: out of scope) — verification is manual, via `npm run dev` in the browser, or via one-off `node --input-type=module -e "..."` scripts for pure functions/data modules that don't touch the DOM.

---

### Task 1: Category label utility

**Files:**
- Create: `src/utils/categories.js`

**Interfaces:**
- Produces: `KNOWN_CATEGORIES` (array of 5 strings, exact labels from Global Constraints), `UNCATEGORIZED` (string constant `"Uncategorized"`), `getPrimaryCategory(rawCategory: string | null | undefined): string` — returns one of `KNOWN_CATEGORIES` or `UNCATEGORIZED`. Later tasks (2, 7) import all three by name from this file.

- [x] **Step 1: Write `src/utils/categories.js`**

```js
export const KNOWN_CATEGORIES = [
  'AI Projects, Apps, & Other Tools',
  'Learning & Study Tools',
  'Community, Interaction, & Social',
  'Visualization & Data Analysis',
  'Extensions, API Integrations, & GitHub Code',
]

export const UNCATEGORIZED = 'Uncategorized'

// Some older submissions used this wording for category 5; treat it as the same category.
const LEGACY_LABEL_MAP = {
  'Extensions and API Integrations': 'Extensions, API Integrations, & GitHub Code',
}

export function getPrimaryCategory(rawCategory) {
  if (!rawCategory) return UNCATEGORIZED

  const candidates = [...KNOWN_CATEGORIES, ...Object.keys(LEGACY_LABEL_MAP)]

  let earliestIndex = Infinity
  let match = null

  for (const candidate of candidates) {
    const index = rawCategory.indexOf(candidate)
    if (index !== -1 && index < earliestIndex) {
      earliestIndex = index
      match = candidate
    }
  }

  if (match === null) return UNCATEGORIZED
  return LEGACY_LABEL_MAP[match] ?? match
}
```

- [x] **Step 2: Verify it manually with real observed data shapes**

Run:

```bash
node --input-type=module -e "
import { getPrimaryCategory, UNCATEGORIZED, KNOWN_CATEGORIES } from './src/utils/categories.js'

console.log(getPrimaryCategory('Learning & Study Tools'))
console.log(getPrimaryCategory('Learning & Study Tools AI Projects, Apps, & Other Tools'))
console.log(getPrimaryCategory('Learning & Study Tools AI Projects, Apps, & Other Tools Other: Davening Toolkit'))
console.log(getPrimaryCategory('AI Projects, Apps, & Other Tools Extensions and API Integrations'))
console.log(getPrimaryCategory('Other: Something'))
console.log(getPrimaryCategory(''))
console.log(getPrimaryCategory(null))
console.log(KNOWN_CATEGORIES.length)
console.log(UNCATEGORIZED)
"
```

Expected output (9 lines, in order):

```
Learning & Study Tools
Learning & Study Tools
Learning & Study Tools
AI Projects, Apps, & Other Tools
Uncategorized
Uncategorized
Uncategorized
5
Uncategorized
```

- [x] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors on `src/utils/categories.js`.

- [x] **Step 4: Commit**

```bash
git add src/utils/categories.js
git commit -m "feat: add category label utility for powered-by dashboard"
```

---

### Task 2: Data fetching module

**Files:**
- Create: `src/data/fetchProjects.js`

**Interfaces:**
- Consumes: `getPrimaryCategory` from `../utils/categories.js` (Task 1).
- Produces: `async function fetchProjects(): Promise<Project[]>` where each `Project` is the raw API object plus an added `primaryCategory: string` field. Only published + consented projects are included. Task 5 imports `fetchProjects` by name.

- [x] **Step 1: Write `src/data/fetchProjects.js`**

```js
import { getPrimaryCategory } from '../utils/categories.js'

const API_URL = 'https://www.sefaria.org/api/powered-by'

export async function fetchProjects() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`)
  }

  const data = await response.json()

  return data.projects
    .filter((project) => project.is_published && project.consent_to_display)
    .map((project) => ({
      ...project,
      primaryCategory: getPrimaryCategory(project.project_category),
    }))
}
```

- [x] **Step 2: Verify it manually against the real API**

Run:

```bash
node --input-type=module -e "
import { fetchProjects } from './src/data/fetchProjects.js'

const projects = await fetchProjects()
console.log('count:', projects.length)
console.log('all published:', projects.every((p) => p.is_published))
console.log('all consented:', projects.every((p) => p.consent_to_display))
console.log('all have primaryCategory string:', projects.every((p) => typeof p.primaryCategory === 'string'))
console.log('sample:', projects[0].project_name, '->', projects[0].primaryCategory)
"
```

Expected: `count` is a number close to 36 (may grow over time — that's fine), and the three `all ...` lines print `true`.

- [x] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors on `src/data/fetchProjects.js`.

- [x] **Step 4: Commit**

```bash
git add src/data/fetchProjects.js
git commit -m "feat: add fetchProjects data module for the powered-by API"
```

---

### Task 3: ProjectCard component

**Files:**
- Create: `src/components/ProjectCard.jsx`

**Interfaces:**
- Consumes: a single `project` prop shaped like the objects returned by `fetchProjects()` (Task 2) — uses `project.id`, `project.project_name`, `project.project_desc`, `project.primaryCategory`, `project.project_link`, `project.image_url`.
- Produces: default export `ProjectCard`, consumed by `ProjectGrid` (Task 4) as `<ProjectCard project={...} />`. Renders a `.project-card` div with an optional `.project-card-image`.

- [x] **Step 1: Write `src/components/ProjectCard.jsx`**

```jsx
function ProjectCard({ project }) {
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
      <p>{project.project_desc}</p>
      <a href={project.project_link} target="_blank" rel="noreferrer">
        Visit project
      </a>
    </div>
  )
}

export default ProjectCard
```

- [x] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors on `src/components/ProjectCard.jsx`.

(Visual verification of this component happens once it's wired into the running app in Task 5 — there is no isolated component-preview tool in this project, so checking it standalone would just duplicate that work.)

- [x] **Step 3: Commit**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat: add ProjectCard component"
```

---

### Task 4: ProjectGrid component

**Files:**
- Create: `src/components/ProjectGrid.jsx`

**Interfaces:**
- Consumes: default export `ProjectCard` from `./ProjectCard.jsx` (Task 3).
- Produces: default export `ProjectGrid`, accepting a `projects` prop (array). Consumed by `Dashboard` (Tasks 5 and 7) as `<ProjectGrid projects={...} />`. Renders `.project-grid` containing one `ProjectCard` per item, keyed by `project.id`, or a `.empty-state` message when `projects.length === 0`.

- [x] **Step 1: Write `src/components/ProjectGrid.jsx`**

```jsx
import ProjectCard from './ProjectCard.jsx'

function ProjectGrid({ projects }) {
  if (projects.length === 0) {
    return <p className="empty-state">No projects match your search.</p>
  }

  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

export default ProjectGrid
```

- [x] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors on `src/components/ProjectGrid.jsx`.

- [x] **Step 3: Commit**

```bash
git add src/components/ProjectGrid.jsx
git commit -m "feat: add ProjectGrid component"
```

---

### Task 5: Dashboard skeleton — fetch, loading/error states, wire into App

**Files:**
- Create: `src/components/Dashboard.jsx`
- Modify: `src/App.jsx` (currently renders only `<Title />`)

**Interfaces:**
- Consumes: `fetchProjects` from `../data/fetchProjects.js` (Task 2), default export `ProjectGrid` from `./ProjectGrid.jsx` (Task 4).
- Produces: default export `Dashboard` (no props), consumed by `App.jsx`. This task intentionally does NOT yet include search/category filtering — that's added in Task 7, so this task's deliverable (a working fetch + render cycle) can be verified in isolation first.

- [x] **Step 1: Write `src/components/Dashboard.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import ProjectGrid from './ProjectGrid.jsx'

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading projects…</p>
  if (error) return <p>Couldn't load projects right now.</p>

  return <ProjectGrid projects={projects} />
}

export default Dashboard
```

- [x] **Step 2: Modify `src/App.jsx` to render Dashboard**

Current content:

```jsx
import Title from './Title.jsx'

function App() {
  return (
    <>
      <Title />
    </>
  )
}

export default App
```

New content:

```jsx
import Title from './Title.jsx'
import Dashboard from './components/Dashboard.jsx'

function App() {
  return (
    <>
      <Title />
      <Dashboard />
    </>
  )
}

export default App
```

- [x] **Step 3: Manually verify in the browser**

Run: `npm run dev`, open the printed local URL (typically `http://localhost:5173`).

Expected: page briefly shows "Loading projects…", then renders a grid of project cards (name, category, description, "Visit project" link — image only on the few entries where `image_url` is set). Open the browser's Network tab and confirm one request to `https://www.sefaria.org/api/powered-by` succeeded (status 200).

- [x] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 5: Commit**

```bash
git add src/components/Dashboard.jsx src/App.jsx
git commit -m "feat: wire Dashboard into App with fetch + loading/error states"
```

---

### Task 6: Controls component (search input, category dropdown, count)

**Files:**
- Create: `src/components/Controls.jsx`

**Interfaces:**
- Consumes: no other project files — pure presentational component.
- Produces: default export `Controls`, accepting props `searchText` (string), `selectedCategory` (string), `categories` (array of strings, the dropdown options excluding `"All"`), `count` (number), `onSearchChange` (function, called with new string value), `onCategoryChange` (function, called with new string value). Consumed by `Dashboard` in Task 7.

- [x] **Step 1: Write `src/components/Controls.jsx`**

```jsx
function Controls({
  searchText,
  selectedCategory,
  categories,
  count,
  onSearchChange,
  onCategoryChange,
}) {
  return (
    <div className="dashboard-controls">
      <input
        type="text"
        placeholder="Search projects..."
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select
        value={selectedCategory}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="All">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <span className="project-count">{count} projects</span>
    </div>
  )
}

export default Controls
```

- [x] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors on `src/components/Controls.jsx`.

(Interactive verification happens in Task 7, once `Dashboard` actually owns and passes the state this component needs to do anything visible.)

- [x] **Step 3: Commit**

```bash
git add src/components/Controls.jsx
git commit -m "feat: add Controls component (search, category filter, count)"
```

---

### Task 7: Wire search, category filter, and sorting into Dashboard

**Files:**
- Modify: `src/components/Dashboard.jsx` (from Task 5)

**Interfaces:**
- Consumes: `KNOWN_CATEGORIES`, `UNCATEGORIZED` from `../utils/categories.js` (Task 1); default export `Controls` from `./Controls.jsx` (Task 6).
- Produces: same default export `Dashboard`, now fully matching the spec (search + category filter + A–Z sort + live count).

- [x] **Step 1: Replace `src/components/Dashboard.jsx` with the full version**

```jsx
import { useEffect, useState } from 'react'
import { fetchProjects } from '../data/fetchProjects.js'
import { KNOWN_CATEGORIES, UNCATEGORIZED } from '../utils/categories.js'
import Controls from './Controls.jsx'
import ProjectGrid from './ProjectGrid.jsx'

const FILTER_CATEGORIES = [...KNOWN_CATEGORIES, UNCATEGORIZED]

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading projects…</p>
  if (error) return <p>Couldn't load projects right now.</p>

  const search = searchText.toLowerCase()

  const visibleProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.project_name.toLowerCase().includes(search) ||
        project.project_desc.toLowerCase().includes(search) ||
        project.project_category.toLowerCase().includes(search)

      const matchesCategory =
        selectedCategory === 'All' || project.primaryCategory === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.project_name.localeCompare(b.project_name))

  return (
    <>
      <Controls
        searchText={searchText}
        selectedCategory={selectedCategory}
        categories={FILTER_CATEGORIES}
        count={visibleProjects.length}
        onSearchChange={setSearchText}
        onCategoryChange={setSelectedCategory}
      />
      <ProjectGrid projects={visibleProjects} />
    </>
  )
}

export default Dashboard
```

- [x] **Step 2: Manually verify in the browser**

Run: `npm run dev`, open the local URL.

Check each of these scenarios:
1. Type a word that appears in some project's name (e.g. part of a real project's title) into the search box — grid narrows to matches, count updates.
2. Type a word that appears only in a description, not any name — confirm it still matches (proves description search works).
3. Clear the search box — full list returns.
4. Select a specific category from the dropdown — grid narrows to only that category's cards, count updates.
5. Select "All categories" — full list returns.
6. Type a search string that matches nothing (e.g. `zzzzznomatch`) — confirm the "No projects match your search." message appears instead of an empty grid.
7. Confirm the visible cards are sorted alphabetically by name.

- [x] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add src/components/Dashboard.jsx
git commit -m "feat: add search, category filter, and sorting to Dashboard"
```

---

### Task 8: Visual styling pass

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: the class names already used by Tasks 3, 4, and 6: `.project-card`, `.project-card-image`, `.project-card-category`, `.project-grid`, `.empty-state`, `.dashboard-controls`, `.project-count`.
- Produces: no new interfaces — this task only adds CSS rules for the class names above, using the existing CSS custom properties already defined in `:root` (`--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-bg`, `--shadow`, etc.), so the styling automatically respects the existing light/dark mode support.

- [x] **Step 1: Append styling rules to `src/index.css`**

Add these rules at the end of the existing file (after the `code, .counter` block):

```css
.dashboard-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin: 24px 0;
}

.dashboard-controls input,
.dashboard-controls select {
  font: inherit;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-h);
}

.project-count {
  color: var(--text);
  font-size: 14px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  padding: 0 24px 32px;
  text-align: left;
}

.project-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-card-image {
  width: 100%;
  max-height: 120px;
  object-fit: contain;
}

.project-card-category {
  display: inline-block;
  align-self: flex-start;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}

.empty-state {
  padding: 48px 24px;
  color: var(--text);
}
```

- [x] **Step 2: Manually verify in the browser**

Run: `npm run dev` (if not already running from Task 7).

Check: cards display in a responsive multi-column grid that reflows to fewer columns on a narrower window, category badges are visibly styled (not plain text), controls are centered above the grid, and the empty-state message is visually distinct (padded, not just squeezed against other content). Toggle the OS/browser dark mode setting and confirm colors still look correct (this is what the existing `var(--text)`, `var(--accent)`, etc. custom properties are for).

- [x] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add dashboard layout and card styling"
```

---

## Self-Review Notes

- **Spec coverage:** data source + fetch (Task 2, 5), defensive `is_published`/`consent_to_display` filtering (Task 2), category derivation + legacy-label + `Other:` handling (Task 1), component tree `App → Dashboard → Controls`/`ProjectGrid → ProjectCard` (Tasks 3-7), loading/error/success states (Task 5), search across name/description/category (Task 7), single-category-at-a-time dropdown filter (Task 6-7), A-Z sort (Task 7), empty-results message (Task 4, exercised in Task 7), Card Grid visual layout (Task 8), no new dependencies (all tasks). All spec sections are covered.
- **Type/signature consistency checked:** `fetchProjects()` (Task 2) returns objects with `primaryCategory` — used identically in `ProjectCard` (Task 3, `project.primaryCategory`) and `Dashboard`'s filter (Task 7, `project.primaryCategory`). `getPrimaryCategory`/`KNOWN_CATEGORIES`/`UNCATEGORIZED` names match between Task 1's definition and Task 7's import. `ProjectGrid`'s `projects` prop name matches how `Dashboard` passes it in both Task 5 and Task 7. `Controls`' callback prop names (`onSearchChange`, `onCategoryChange`) match what `Dashboard` passes in Task 7.
