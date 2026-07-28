# Experience-Level Submissions Trend Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third chart to the Charts and Analytics page: a line chart of submissions per month, broken out by technical-experience level (No Experience, Beginner, Intermediate, Advanced), covering all time.

**Architecture:** Two small pure-function data modules (`src/utils/experience.js` for the raw-value → label mapping, an addition to `src/utils/submissionsTrend.js` for the monthly-bucketed-by-level aggregation) feeding a new Recharts `LineChart` section in `src/components/ChartsAndAnalytics.jsx`. Follows the existing `categories.js` / `getSubmissionsMonthlyTrend` patterns already in the codebase.

**Tech Stack:** React 19, Vite, Recharts 3. No test framework is currently installed in this repo; this plan adds Node's built-in `node:test` runner (zero new dependencies) for the two pure-function data modules, wired up via a new `npm test` script.

## Global Constraints

- Data source: `project.technical_experience` raw values are `''`, `'None'`, `'<5 years'`, `'5-10 years'`, `'10+ years'`, mapping to labels `Experience Unspecified` (excluded), `No Experience`, `Beginner`, `Intermediate`, `Advanced`.
- Chart covers all time (earliest parseable submission month through the current month), not capped at 12 months.
- Line colors, in fixed order, validated with the dataviz skill's palette validator against this site's `#fbfbfa` surface: No Experience `#2a78d6`, Beginner `#eb6834`, Intermediate `#1baf7a`, Advanced `#4a3aa7`.
- The Intermediate (aqua) line is under 3:1 contrast against the page background — ship a direct label at the last point of each line (relief rule), not just a hover tooltip.
- Follow existing file patterns: `src/utils/categories.js` for the mapping-module shape, `src/utils/submissionsTrend.js` for the month-bucketing helpers (`parseTagMonth`, `monthKey`, `MONTH_NAMES` are already defined there and must be reused, not duplicated).

---

### Task 1: Experience-level mapping utility

**Files:**
- Create: `src/utils/experience.js`
- Test: `src/utils/experience.test.js`
- Modify: `package.json` (add `"test": "node --test src"` script)

**Interfaces:**
- Produces: `EXPERIENCE_LEVELS` (array of 4 strings, fixed order: `['No Experience', 'Beginner', 'Intermediate', 'Advanced']`) and `getExperienceLevel(rawExperience: string | undefined): string | null` — both consumed by Task 2.

- [ ] **Step 1: Add the test script to package.json**

Edit `package.json`, in `"scripts"`, add:

```json
"test": "node --test src"
```

- [ ] **Step 2: Write the failing test**

Create `src/utils/experience.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXPERIENCE_LEVELS, getExperienceLevel } from './experience.js'

test('EXPERIENCE_LEVELS is the fixed four-level order', () => {
  assert.deepEqual(EXPERIENCE_LEVELS, ['No Experience', 'Beginner', 'Intermediate', 'Advanced'])
})

test('getExperienceLevel maps known raw values to labels', () => {
  assert.equal(getExperienceLevel('None'), 'No Experience')
  assert.equal(getExperienceLevel('<5 years'), 'Beginner')
  assert.equal(getExperienceLevel('5-10 years'), 'Intermediate')
  assert.equal(getExperienceLevel('10+ years'), 'Advanced')
})

test('getExperienceLevel returns null for unspecified experience', () => {
  assert.equal(getExperienceLevel(''), null)
  assert.equal(getExperienceLevel(undefined), null)
})

test('getExperienceLevel returns null for an unrecognized raw value', () => {
  assert.equal(getExperienceLevel('not a real value'), null)
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `src/utils/experience.js` does not exist (module not found).

- [ ] **Step 4: Write the implementation**

Create `src/utils/experience.js`:

```js
export const EXPERIENCE_LEVELS = ['No Experience', 'Beginner', 'Intermediate', 'Advanced']

const RAW_TO_LABEL = {
  None: 'No Experience',
  '<5 years': 'Beginner',
  '5-10 years': 'Intermediate',
  '10+ years': 'Advanced',
}

// Returns null for unspecified/blank/unrecognized experience.
export function getExperienceLevel(rawExperience) {
  return RAW_TO_LABEL[rawExperience] ?? null
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 4 tests in `src/utils/experience.test.js` green.

- [ ] **Step 6: Commit**

```bash
git add package.json src/utils/experience.js src/utils/experience.test.js
git commit -m "feat: add technical-experience level mapping utility"
```

---

### Task 2: Monthly submissions-by-experience-level aggregation

**Files:**
- Modify: `src/utils/submissionsTrend.js` (add `getSubmissionsTrendByExperience`, reuse existing `parseTagMonth`, `monthKey`, `MONTH_NAMES`)
- Test: `src/utils/submissionsTrend.test.js` (new file — no existing tests for this module)

**Interfaces:**
- Consumes: `EXPERIENCE_LEVELS`, `getExperienceLevel` from `./experience.js` (Task 1).
- Produces: `getSubmissionsTrendByExperience(projects: Array<{tags?: string[], technical_experience?: string}>, referenceDate?: Date): Array<{month: string, 'No Experience': number, Beginner: number, Intermediate: number, Advanced: number}>` — consumed by Task 3. Ordered oldest to newest, one entry per calendar month from the earliest parseable submission through `referenceDate`'s month. Returns `[]` if no project has a parseable submission month.

- [ ] **Step 1: Write the failing tests**

Create `src/utils/submissionsTrend.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getSubmissionsTrendByExperience } from './submissionsTrend.js'

const referenceDate = new Date(2026, 6, 15) // July 2026

test('getSubmissionsTrendByExperience returns [] when no project has a parseable date', () => {
  const projects = [
    { tags: ['Date unspecified'], technical_experience: 'None' },
    { tags: [], technical_experience: 'Beginner' },
  ]
  assert.deepEqual(getSubmissionsTrendByExperience(projects, referenceDate), [])
})

test('getSubmissionsTrendByExperience spans from the earliest submission through referenceDate, zero-filled', () => {
  const projects = [
    { tags: ['May 2026'], technical_experience: 'None' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})

test('getSubmissionsTrendByExperience buckets each level independently per month', () => {
  const projects = [
    { tags: ['May 2026'], technical_experience: 'None' },
    { tags: ['May 2026'], technical_experience: '<5 years' },
    { tags: ['May 2026'], technical_experience: '<5 years' },
    { tags: ['Jul 2026'], technical_experience: '5-10 years' },
    { tags: ['July 2026'], technical_experience: '10+ years' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'May 2026', 'No Experience': 1, Beginner: 2, Intermediate: 0, Advanced: 0 },
    { month: 'Jun 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 1, Advanced: 1 },
  ])
})

test('getSubmissionsTrendByExperience excludes unspecified experience from counts but keeps the month', () => {
  const projects = [
    { tags: ['July 2026'], technical_experience: '' },
  ]
  const result = getSubmissionsTrendByExperience(projects, referenceDate)

  assert.deepEqual(result, [
    { month: 'Jul 2026', 'No Experience': 0, Beginner: 0, Intermediate: 0, Advanced: 0 },
  ])
})
```

Note: `{ tags: ['Jul 2026'], ... }` (abbreviated month name) is intentionally invalid per `parseTagMonth`'s `MONTH_NAMES` matching (it expects the full name, e.g. `'July'`) — that entry will fail to parse and be skipped. This is deliberate: it confirms unparseable tags are silently ignored rather than crashing, matching existing `getSubmissionsMonthlyTrend` behavior. Only the `'July 2026'` entry contributes to the Jul 2026 bucket in that test.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getSubmissionsTrendByExperience` is not exported from `src/utils/submissionsTrend.js`.

- [ ] **Step 3: Write the implementation**

In `src/utils/submissionsTrend.js`, add the import at the top of the file:

```js
import { EXPERIENCE_LEVELS, getExperienceLevel } from './experience.js'
```

Then append below the existing `getSubmissionsMonthlyTrend` function:

```js
// Builds every calendar month from start through end (inclusive), oldest first.
function monthsBetween(start, end) {
  const months = []
  let cursor = new Date(start.year, start.monthIndex, 1)
  const endDate = new Date(end.year, end.monthIndex, 1)

  while (cursor.getTime() <= endDate.getTime()) {
    months.push({ year: cursor.getFullYear(), monthIndex: cursor.getMonth() })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  return months
}

export function getSubmissionsTrendByExperience(projects, referenceDate = new Date()) {
  const parsed = projects
    .map((project) => ({
      month: parseTagMonth(project.tags?.[0]),
      level: getExperienceLevel(project.technical_experience),
    }))
    .filter((entry) => entry.month !== null)

  if (parsed.length === 0) return []

  const earliest = parsed.reduce((earliestSoFar, entry) => {
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    return key < monthKey(earliestSoFar.year, earliestSoFar.monthIndex) ? entry.month : earliestSoFar
  }, parsed[0].month)

  const end = { year: referenceDate.getFullYear(), monthIndex: referenceDate.getMonth() }
  const months = monthsBetween(earliest, end)

  const counts = new Map(
    months.map(({ year, monthIndex }) => [
      monthKey(year, monthIndex),
      Object.fromEntries(EXPERIENCE_LEVELS.map((level) => [level, 0])),
    ]),
  )

  for (const entry of parsed) {
    if (entry.level === null) continue
    const key = monthKey(entry.month.year, entry.month.monthIndex)
    if (counts.has(key)) {
      counts.get(key)[entry.level] += 1
    }
  }

  return months.map(({ year, monthIndex }) => ({
    month: `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`,
    ...counts.get(monthKey(year, monthIndex)),
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests in both `src/utils/experience.test.js` and `src/utils/submissionsTrend.test.js` green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/submissionsTrend.js src/utils/submissionsTrend.test.js
git commit -m "feat: add monthly submissions trend broken out by experience level"
```

---

### Task 3: Wire the line chart into Charts and Analytics

**Files:**
- Modify: `src/components/ChartsAndAnalytics.jsx`

**Interfaces:**
- Consumes: `getSubmissionsTrendByExperience(projects, referenceDate?)` from Task 2 and `EXPERIENCE_LEVELS` from Task 1.

- [ ] **Step 1: Fetch the new trend data**

In `src/components/ChartsAndAnalytics.jsx`, update the imports at the top:

```js
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchProjects } from '../data/fetchProjects.js'
import { getSubmissionsMonthlyTrend, getSubmissionsTrendByExperience } from '../utils/submissionsTrend.js'
import { getKeywordCounts } from '../utils/keywords.js'
import { EXPERIENCE_LEVELS } from '../utils/experience.js'
```

Add a third piece of state and fetch it alongside the other two:

```js
function ChartsAndAnalytics() {
  const [trend, setTrend] = useState(null)
  const [keywordCounts, setKeywordCounts] = useState(null)
  const [experienceTrend, setExperienceTrend] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
      .then((projects) => {
        setTrend(getSubmissionsMonthlyTrend(projects))
        setKeywordCounts(getKeywordCounts(projects))
        setExperienceTrend(getSubmissionsTrendByExperience(projects))
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="charts-and-analytics">Couldn't load chart data right now.</p>
  if (!trend || !keywordCounts || !experienceTrend) return <p className="charts-and-analytics">Loading chart…</p>
```

- [ ] **Step 2: Add the experience-level line chart section**

Above the module, add the fixed color mapping (matches `EXPERIENCE_LEVELS` order, validated against the site's `#fbfbfa` background per the design spec):

```js
const EXPERIENCE_COLORS = {
  'No Experience': '#2a78d6',
  Beginner: '#eb6834',
  Intermediate: '#1baf7a',
  Advanced: '#4a3aa7',
}
```

Below the existing "Keyword frequency" `ResponsiveContainer` block (before the closing `</div>`), add:

```jsx
      <h2>Submissions by experience level</h2>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={experienceTrend}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {EXPERIENCE_LEVELS.map((level) => (
            <Line
              key={level}
              type="monotone"
              dataKey={level}
              name={level}
              stroke={EXPERIENCE_COLORS[level]}
              strokeWidth={2}
              dot={{ r: 3 }}
              label={(props) =>
                props.index === experienceTrend.length - 1 ? (
                  <text
                    x={props.x + 6}
                    y={props.y}
                    dy={4}
                    fill={EXPERIENCE_COLORS[level]}
                    fontSize={12}
                  >
                    {level}
                  </text>
                ) : null
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
```

- [ ] **Step 3: Run the linter**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open the app, click into the "Charts and Analytics" tab.
Expected:
- A third chart titled "Submissions by experience level" renders below "Keyword frequency".
- Four lines are visible, one per experience level, with a legend.
- Each line has a small text label with its level name near its rightmost (most recent) point.
- Hovering the chart shows a tooltip with per-month counts for all four levels.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChartsAndAnalytics.jsx
git commit -m "feat: add experience-level submissions trend chart"
```
