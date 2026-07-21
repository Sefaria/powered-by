# Powered by Sefaria Dashboard — v1 Design

## Goal

A single-page React dashboard that lets a visitor search, filter, sort, and count
the community projects built on Sefaria's API/data, replacing the current static
prose list at developers.sefaria.org/docs/powered-by-sefaria with a data-centric,
visual experience.

This is also a learning project: the author is new to React, so the design favors
well-known, teachable patterns (lifting state up, simple `useState`/`useEffect`)
over more advanced abstractions (custom hooks, external state libraries), which
are noted as future refactors rather than v1 requirements.

## Data source

Live JSON API: `https://www.sefaria.org/api/powered-by`

Response shape:

```json
{ "projects": [ { ...one object per project... } ] }
```

As of 2026-07-21 this returns 36 project objects. Relevant fields per project
(the API includes more fields than this; only the ones used by v1 are listed):

| Field | Type | Notes |
|---|---|---|
| `id` | number | stable unique identifier, used as React `key` |
| `project_name` | string | display name |
| `project_desc` | string | short description |
| `project_category` | string | **messy, see below** |
| `project_link` | string (URL) | outbound link |
| `image_url` | string (URL) or `null` | logo/screenshot, often `null` |
| `is_published` | boolean | must be `true` to display |
| `consent_to_display` | boolean | must be `true` to display |

### Known data quality issue: `project_category`

This field is **not a clean single value**. It is a concatenation of one or more
known category labels joined by a plain space (no delimiter of its own), and can
include a free-text tag not in the standard set (e.g. `"Other: Davening
Toolkit"`). Observed real examples:

```
"Learning & Study Tools"
"Learning & Study Tools AI Projects, Apps, & Other Tools"
"Learning & Study Tools AI Projects, Apps, & Other Tools Other: Davening Toolkit"
```

**Correction from an earlier draft of this spec:** the known label set is
*not* the 6 categories listed on developers.sefaria.org. Verified directly
against the live API response (all 36 entries decompose cleanly against this
set, with zero unmatched leftover text), the actual submission-form category
labels are:

1. `AI Projects, Apps, & Other Tools` (one combined label — the docs site
   splits this into two separate categories, the API does not)
2. `Learning & Study Tools`
3. `Community, Interaction, & Social`
4. `Visualization & Data Analysis`
5. `Extensions, API Integrations, & GitHub Code` (one older entry uses the
   legacy wording `Extensions and API Integrations` for the same category —
   normalize this variant to the label above)

Plus free-text `Other: <anything>`, which does not map to a fixed label.

**Handling:** since the field can't be reliably split on a delimiter, derive one
**primary category** per project by scanning `project_category` for whichever
of the five known labels (treating the legacy variant as equivalent to label 5)
occurs at the earliest string position. That primary category is what's
displayed on the card and what the category filter matches against. A project
whose `project_category` is empty or matches none of the five (e.g. only
`"Other: ..."`) has no primary category and is labeled `"Uncategorized"` for
display/filter purposes. (Decision: a project is only ever categorized under
this one primary category, even if it self-described multiple — see Open
Questions if this needs revisiting later.)

### Defensive filtering

On every fetch, drop any project where `is_published` is `false` or
`consent_to_display` is `false`, before it ever reaches display or search/filter
logic. As of 2026-07-21, all 36 entries pass this check (0 filtered out) — this
is a forward-looking safeguard for future submissions, not a fix for a current
problem.

## Component architecture

```
App
 └── Dashboard
      ├── Controls
      └── ProjectGrid
           └── ProjectCard  (one per visible project)
```

- **`App`** — unchanged in role, renders `<Title />` then `<Dashboard />`.
- **`Dashboard`** — owns all state and logic:
  - `projects` (raw fetched array), `loading` (bool), `error` (string or null)
  - `searchText` (string), `selectedCategory` (string, default `"All"`)
  - Fetches from the API once on mount (`useEffect` with an empty dependency
    array).
  - Applies defensive filtering, then derives primary category per project.
  - Computes the visible list each render: filter by `searchText` (case
    insensitive match against `project_name`, `project_desc`, and raw
    `project_category`) and by `selectedCategory` (exact match against derived
    primary category, or no filter if `"All"`), then sort by `project_name`
    A–Z. This is a plain derived value computed inline in the render — no
    separate "filtered" state, to avoid state getting out of sync with its
    source.
  - Passes the visible list and count down to `Controls` and `ProjectGrid`.
- **`Controls`** — presentational. Search `<input>`, category `<select>`
  (options: "All" + the 5 known category labels + "Uncategorized"), and a
  "`N` projects" count display. Calls `onSearchChange`/`onCategoryChange`
  callbacks passed as props; owns no state itself.
- **`ProjectGrid`** — presentational. Given the visible projects array, renders
  one `ProjectCard` per item in a responsive grid (per the approved Card Grid
  mockup). If the array is empty, renders a "No projects match your search"
  message instead.
- **`ProjectCard`** — presentational. Given one project, renders
  `project_name`, `project_desc`, primary category (as a small badge/label),
  `image_url` if present (fallback to a text-only card layout if `null`), and
  `project_link` as an outbound link (`target="_blank" rel="noreferrer"`,
  matching the existing pattern in `Title.jsx`).

## Data flow / loading states

Fetching is asynchronous, so `Dashboard` must render three distinct states:

1. **Loading** — `loading === true`: show a simple "Loading projects…" message.
2. **Error** — fetch failed or rejected: show a friendly error message (e.g.
   "Couldn't load projects right now.").
3. **Success** — `loading === false`, `error === null`: render `Controls` +
   `ProjectGrid` as described above.

No retry/backoff logic in v1 — a failed fetch just shows the error message.
Reloading the page re-attempts the fetch.

## File structure additions

```
src/
  components/
    Dashboard.jsx
    Controls.jsx
    ProjectGrid.jsx
    ProjectCard.jsx
```

No new dependencies are needed — fetching uses the browser's built-in `fetch`,
already implicitly available via `globals.browser` in the ESLint config.

## Testing

Manual verification in the browser during/after each build step (search
narrows results, category filter narrows results, count updates, empty-result
state shows, loading/error states can be observed by throttling/blocking the
request). Automated tests (Vitest + React Testing Library) are a reasonable
follow-up once the app works, not a v1 blocker.

## Out of scope for v1

- Multi-category matching per project (a project only shows under its single
  derived primary category — see Open Questions).
- Sorting by anything other than name A–Z.
- Multi-select category filtering.
- Featured/highlighted projects (the `featured` field exists in the API but is
  unused in v1).
- Any write/submission flow — this dashboard is read-only display of existing
  API data.
- Automated test suite.

## Open questions / future refactors

- If it later turns out users want a project to appear under *every* category
  it mentions (not just its primary one), the category-matching logic in
  `Dashboard` will need to change from an exact match to a substring-contains
  check — flagged here since it was a close call during design, not because
  it's expected to change soon.
- Once comfortable with `useState`/`useEffect`/props, the filter/sort/fetch
  logic in `Dashboard` could be extracted into a custom hook (e.g.
  `useProjectData`) as a refactor — intentionally deferred so v1 teaches one
  concept at a time.
