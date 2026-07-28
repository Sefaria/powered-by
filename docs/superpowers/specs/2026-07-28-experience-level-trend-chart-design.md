# Experience-level submissions trend chart

## Goal

Add a third chart to the Charts and Analytics page showing how submissions from
each technical-experience level (No Experience, Beginner, Intermediate, Advanced)
have changed over time, as a line chart. "Experience Unspecified" submissions are
excluded. Covers all time, not just the last 12 months.

## Data source

Each project from the API has a `technical_experience` field with raw values:
`''`, `'None'`, `'<5 years'`, `'5-10 years'`, `'10+ years'`. These map 1:1 to the
friendly labels already present in each project's `tags` array (`Experience
Unspecified`, `No Experience`, `Beginner`, `Intermediate`, `Advanced`), confirmed
by comparing value counts against a live API pull.

## New file: `src/utils/experience.js`

Mirrors the existing `src/utils/categories.js` pattern.

```js
export const EXPERIENCE_LEVELS = ['No Experience', 'Beginner', 'Intermediate', 'Advanced']

const RAW_TO_LABEL = {
  'None': 'No Experience',
  '<5 years': 'Beginner',
  '5-10 years': 'Intermediate',
  '10+ years': 'Advanced',
}

// Returns null for unspecified/blank experience (excluded from this chart).
export function getExperienceLevel(rawExperience) {
  return RAW_TO_LABEL[rawExperience] ?? null
}
```

## Extend `src/utils/submissionsTrend.js`

Add `getSubmissionsTrendByExperience(projects, referenceDate = new Date())`,
reusing the existing `parseTagMonth` / `monthKey` / `MONTH_NAMES` helpers already
in this file.

Behavior:
- Parse each project's submission month from `project.tags[0]` (same as the
  existing trend function).
- Determine the month range as the earliest parseable submission month through
  `referenceDate`'s month (all-time, not capped at 12 months). If no project has
  a parseable date, return `[]`.
- For each month in that range, count submissions per experience level (only for
  projects whose `getExperienceLevel(project.technical_experience)` is non-null).
- Return an array ordered oldest to newest:
  `{ month: 'Jan 2026', 'No Experience': 2, Beginner: 1, Intermediate: 0, Advanced: 1 }`.

## Chart UI: `src/components/ChartsAndAnalytics.jsx`

- Fetch the new trend data alongside the existing two (`trend`, `keywordCounts`)
  in the same `useEffect`/`fetchProjects` call; add a third loading/error-covered
  piece of state.
- New section, ordered last: `<h2>Submissions by experience level</h2>` followed
  by a Recharts `ResponsiveContainer` > `LineChart`.
- One `Line` per entry in `EXPERIENCE_LEVELS`, each `dataKey` matching that label,
  2px `strokeWidth`, small dots (`r={3}`).
- Colors, in fixed order matching `EXPERIENCE_LEVELS` (validated with
  `dataviz`'s `validate_palette.js`, all-pairs mode, against this site's
  `--bg` surface `#fbfbfa`):
  - No Experience: `#2a78d6` (blue)
  - Beginner: `#eb6834` (orange)
  - Intermediate: `#1baf7a` (aqua)
  - Advanced: `#4a3aa7` (violet)
- `CartesianGrid`, `XAxis dataKey="month"`, `YAxis allowDecimals={false}`,
  `Tooltip`, and a `Legend`.
- The aqua (Intermediate) line falls under 3:1 contrast against the page
  background — per the dataviz skill's relief rule, add a direct label at the
  last data point of each line (small text showing the experience level name),
  so the series stays readable without relying on hover.

## Out of scope

- No filter controls to toggle experience levels on/off.
- No dark mode handling — this site is light-mode only (`color-scheme: light`,
  no dark CSS anywhere in `index.css`).
