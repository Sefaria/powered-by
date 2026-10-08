# Powered by Sefaria Redesign: Prompt and Implementation Spec for Claude Code


## Spec

### 1. Product summary

**What it is:** a browsable showcase of community projects built on Sefaria's free texts, API and data.

**Audiences:**

- donors
- developers looking for inspiration
- Sefaria stakeholders
- general visitors

Anyone landing on the page must understand within seconds what it is.

**Routes:**

| Route | Purpose | Linked from site? |
|---|---|---|
| `/` | Browse projects (grid or list), search and filter, open a project | yes |
| `/?project=<id>` | Same page with that project's detail dialog open (shareable deep link) | yes, implicitly |
| `/charts` | "Powered by Sefaria in numbers": analytics charts | **no**. It's unlisted, `noindex, nofollow`, and not in the sitemap or any nav. |

**There is no admin UI in this app.** Tag editing and internal fields live in the existing Django admin on the Sefaria side (see §13).

**Hosting:** a static build on a self-hosted Coolify instance. The SPA fallback must serve `index.html` for `/charts` (and any unknown path → client-side 404). Configure this in Coolify, or add an nginx `try_files $uri /index.html;`. Document it in the README.

### 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Language | **TypeScript**, `strict: true` | Convert everything. No `any` in app code. |
| Framework | React 19 + Vite 8 (keep) | Node version per `.nvmrc` (22) |
| Routing | `react-router` v7 (library mode) | Two routes plus a 404. `/charts` is lazy-loaded (`React.lazy`) so chart code isn't in the main bundle. |
| Styling | CSS Modules + a global `tokens.css` of CSS custom properties | No Tailwind, no CSS-in-JS. Components may only use tokens: no raw hex or px in modules except where this spec gives an exact one-off value. |
| Icons | `lucide-react` | Tree-shaken named imports. Stroke 2, sizes 18 and 24 (12 for tiny badges). Custom topic icons go in `src/components/icons/` (see §4.6). |
| Charts | `recharts` (keep), wrapped in our own components | Or hand-rolled SVG if simpler. Either way consumers only use our wrappers (§9). |
| Data fetching | Plain `fetch` + one small hook (or TanStack Query if you justify it) | One request. The dataset is ~150 rows, so filtering happens client-side. |
| Unit and component tests | **Vitest** + React Testing Library + `vitest-axe` | Replace `node --test`. |
| E2E | **Playwright** + `@axe-core/playwright` | Desktop (1440×900) and mobile (390×844) projects |
| Lint and format | ESLint (flat config, typescript-eslint, react-hooks, jsx-a11y) + Prettier | |
| CI | GitHub Actions: `lint` → `typecheck` → `test` → `build` → `e2e` | Extend the existing `.github/workflows/ci.yml`. |

Remove: the `/src/components/charts/*` implementations (rebuild them), the iframe preview (`projectPreview.js` and its test), `Sidebar.jsx` tabs, `Title.jsx`, `Pagination.jsx`, and all of `App.css` and `index.css`.

### 3. Suggested structure

```
src/
  app/            App.tsx, routes.tsx, NotFound.tsx
  styles/         tokens.css, reset.css, global.css
  lib/            api.ts, project.ts (types + normalize), categories.ts, endpoints.ts,
                  reach.ts, tech.ts, experience.ts, sort.ts, filter.ts, url.ts, format.ts
                  + __tests__/ for every module
  hooks/          useProjects.ts, useProjectQueryState.ts, useMediaQuery.ts
  components/
    ui/           Button, IconButton, Tag, SegmentedControl, SearchField, Select, Checkbox,
                  Dialog, Sheet, VisuallyHidden, EmptyState, Skeleton, ExternalLink
    icons/        CategoryIcon.tsx (+ custom topic icons)
    layout/       SiteHeader, Hero, SiteFooter, Container
  features/
    browse/       BrowsePage, FilterPanel, FilterSheet, ResultsToolbar, ActiveFilters,
                  ProjectGrid, ProjectCard, ProjectList, ProjectListRow, ShowMore
    project/      ProjectDialog, ProjectDetail (content only; reused at all sizes)
    charts/       ChartsPage, ChartCard, HBarChart, StackedBarChart, YearBarChart,
                  CumulativeLineChart, DataTable, selectors.ts (+ tests)
  assets/         samekh-developers.png (or .svg, see §4.7)
```

Composition rules:

- `ui/` components know nothing about projects.
- `features/` compose `ui/`.
- `ProjectDetail` renders the same content inside a centred dialog (desktop) and a full-screen dialog (mobile). The breakpoint switches the container, not the content.

### 4. Design tokens (Sefaria Product Design, DevPortal theme)

Put all of these in `src/styles/tokens.css` as custom properties using these **semantic names**. Components reference the semantic tokens only, never primitives.

#### 4.1 Color

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#121212` | body text, titles |
| `--text-secondary` | `#575757` | descriptions, labels, metadata (7.23:1 on white) |
| `--text-muted` | `#707070` | placeholders only |
| `--text-inverse` | `#ffffff` | on purple, navy, inverse |
| `--text-link` / `--text-link-hovered` | `#18345d` / `#132b4c` | links |
| `--surface-page` | `#ffffff` | page |
| `--surface-subtle` | `#fafafa` | quiet panels (CTA block, chart page bg) |
| `--surface-hover` | `#eeeeee` | hovered rows, topic tags, icon-button fill |
| `--surface-selected` | `#f2f5fa` | selected filter row, API resource tag |
| `--border-default` | `#ededec` | card and divider borders (decorative) |
| `--border-strong` | `#653259` | **inputs, selects, toggles**: any edge that must read as a control |
| `--action-primary` / `-hover` | `#18345d` / `#132b4c` | default primary buttons (navy) |
| `--module-primary` | `#7c416f` | DevPortal purple: hero, footer, icon tiles, pressed toggle, **project CTA** |
| `--module-primary-hover` | `#653259` | hover for purple fills (reuses purple-800) |
| `--icon-default` / `--icon-muted` | `#121212` / `#6f6f6f` | icons |
| `--feedback-warning` | `#e6b624` | icon only, never text |
| `--focus-ring` | `#1976d2` | `outline: 2px solid var(--focus-ring); outline-offset: 2px` on `:focus-visible`, globally |
| `--scrim` | `rgba(15, 34, 59, 0.6)` | dialog and sheet backdrop |

Chart ramps (charts only):

- purple sequential: `#e1bed8 #b36fa2 #7c416f #38192f`
- neutral series: `#999999`

#### 4.2 Typography

- **Content serif:** `"Adobe Garamond Pro", "EB Garamond", Garamond, Georgia, serif`. Used for the H1, card titles, dialog title and section display text. Use Sefaria's existing licensed Adobe Garamond source if available; otherwise load EB Garamond 400/500 from Google Fonts. Ask Sarah which.
- **System sans:** `Roboto, "Helvetica Neue", Arial, sans-serif`, at 400/500/600 from Google Fonts. Used for all UI and body copy.
- **Mono:** `"Roboto Mono", ui-monospace, Menlo, monospace`. Used for API endpoint tags only.
- Letter-spacing 0 everywhere. The old site's font (EB Garamond for everything) and 0.18px tracking are gone.

| Role | Font | Size / line-height | Weight |
|---|---|---|---|
| Hero H1 | serif | 56/1.1 desktop, 40/1.1 ≤720px | 400 |
| Dialog title | serif | 40/1.15 desktop, 34 mobile | 500 |
| Charts page H1 | serif | 40 | 500 |
| Card title | serif | 24/1.25 (list row: 20) | 500 |
| Body large (hero, dialog description, backstory) | sans | 18/1.6 (hero mobile 17) | 400 |
| Body | sans | 16/1.5 | 400 |
| Button | sans | 16 (CTA 18) | 600 |
| Label / eyebrow / metadata / tag | sans | 14/18 | 400–600 |
| Chart axis labels | sans | 12/16 | 400 |

Minimum text size is 14px; 12px is allowed only for chart axis labels.

#### 4.3 Spacing, radius, borders, elevation

- **Spacing scale:** 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. Name them `--space-2xs` … `--space-7xl`, or `--space-1..12`, but name them.
- **Radius** (from the dimension scale): 4 (tags, category chips, small badges), 8 (buttons, inputs, icon tiles), 12 (cards, panels), 16 (dialog, sheet top corners), pill 16–18 (topic tags).
- **Borders:** 1px default; 1.5px for outlined buttons (`box-shadow: inset 0 0 0 1.5px`).
- **Elevation:** prefer borders.
  - `--shadow-small`: card hover. `0 8px 16px rgba(31,31,31,.05), 0 1px 2px rgba(31,31,31,.04), 0 0 10px -1px rgba(83,83,83,.04)`
  - `--shadow-large`: sheet. `0 16px 32px rgba(13,3,32,.16), 0 1px 2px rgba(0,0,0,.08)`
  - `--shadow-xlarge`: dialog. `0 40px 80px rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.08)`

#### 4.4 Breakpoints (mobile first)

| Name | Min width | What changes |
|---|---|---|
| base | 0 | single column; filters in a bottom sheet; dialog is full-screen; toggle is icon-only |
| `sm` | 640 | dialog becomes a centred modal (max-width 760) |
| `lg` | 1024 | filter sidebar appears (248–280 px), "Filters" button disappears; toggle shows text labels |

Content container: `max-width: 1280px`, side padding 24px (16px below 640).

#### 4.5 Touch targets

**Every interactive element is at least 44×44 px.** Specifically:

- Buttons and inputs are 44–48 px tall.
- Dialog close is 48×48 with a `--surface-hover` fill.
- Mobile sheet rows are 52 px; mobile list rows are 72 px.
- The project CTA is 56 px.
- If the visual is smaller, the hit area must still be 44.

#### 4.6 Icons

Lucide is mapped per category. Each icon renders inside a `--module-primary` tile with a white icon: 40px tile and 24px icon on cards, 32px tile and 18px icon in list rows.

| Category (API label) | Short label (UI) | Lucide |
|---|---|---|
| Learning & Study Tools | Learning & Study | `BookOpen` |
| AI Projects, Apps, & Other Tools | AI & Apps | `Sparkles` |
| Community, Interaction, & Social | Community & Social | `Users` |
| Visualization & Data Analysis | Visualization & Data | `ChartColumn` |
| Extensions, API Integrations, & GitHub Code (+ legacy "Extensions and API Integrations") | Extensions & API | `Plug` |
| (none matched) | Uncategorized | `Folder` |
| "All projects" filter row | All projects | `LayoutGrid` |

Other icons:

- UI: `Search`, `X`, `LayoutGrid`, `List`, `ListFilter`, `ArrowUpRight` (external), `ExternalLink` (list row), `CodeXml` (source code), `Braces` (API tag), `ChevronRight`, `ArrowLeft`, `Menu`, `TriangleAlert`.
- **Custom Jewish-topic icons:** Tanakh, Gemara, Tefillah, Zmanim, Kabbalah. These are drawn in Lucide style (24 grid, 2px stroke, round caps and joins). Halakha uses Lucide `Scale`. Ship them as React components in `components/icons/topics/`. They're not used on cards yet; build them for future topic filters. Exact paths are on the design canvas's Spec board, or redraw to the same spec.

Sefaria's design system says icons should come from its Figma library. Mark these as "Lucide direct, not yet in Sefaria icon library" in the PR.

#### 4.7 Logo

- The header uses **only the samekh**: a white samekh on a DevPortal-purple rounded square (radius 8), 40px desktop and 36px mobile, inside a ≥44px link to `https://developers.sefaria.org`, with `alt="Developers on Sefaria"`.
- **Source:** crop the samekh from `src/assets/developers_logo.png` (it starts at roughly x 33–85, y 20–87 of the 646×118 image) and centre it on a 96×96 tile of the same purple. If an SVG of the samekh exists in Sefaria-Project (`static/img/samech-logo.svg`), prefer it, render it in white on a `--module-primary` tile, and say so in the PR.
- Never redraw, recolor or re-set the wordmark.
- Favicon: keep `public/favicon.png` (purple samekh). Also fix the broken `<link rel="icon">` in the current `index.html`: its `href` is empty.

### 5. Data layer

#### 5.1 Source

- **API:** `GET https://www.sefaria.org/api/powered-by` returns `{ projects: RawProject[] }`.
- Fetch once. Show a skeleton while loading. On error, show an `EmptyState` ("We couldn't load projects right now." plus a **Try again** button).

`RawProject` fields seen in production:

```ts
id: number; project_name: string; project_desc: string | null; project_why: string | null;
project_link: string | null; project_source_code: string | null;
project_category: string | null;      // free text, may contain several known labels, with or without commas
tags: string[];                        // admin topic tags, may include junk (dates, "not vibe-coded")
sefaria_tools_used: (string|unknown)[];// mix of resource names ("Sefaria API","Documentation") and endpoints ("/api/v3/texts/")
tech_used_raw: string | null;          // free text
technical_experience: string | null;   // "", "None", "<5 years", "5-10 years", "10+ years"
project_reach: string | null;          // free text: "~100", "10", "<10", "1000", "None, it's mostly a proof of concept", ""
vibe_coded: boolean; is_buggy: boolean; status: "unknown"|"live"|"dead"; featured: boolean;
submission_source: "formstack"|"manual"|"in_the_wild"; submission_date: string | null; created_at: string;
image_url: string | null; has_pbs_logo: boolean; is_published: boolean; consent_to_display: boolean;
```

#### 5.2 Normalise into a domain `Project` type (in `lib/project.ts`, pure, unit tested)

```ts
type CategoryId = 'learn' | 'ai' | 'community' | 'viz' | 'ext' | 'none';
interface Project {
  id: number; name: string; description: string; backstory: string | null;
  url: string | null;            // safe http(s) only (keep isSafeUrl logic)
  domain: string | null;         // hostname without "www."
  sourceUrl: string | null;      // safe http(s) only
  categories: CategoryId[];      // order of appearance in the raw string; [ 'none' ] if no match
  topics: string[];              // cleaned tags, see below
  resources: string[];           // sefaria_tools_used, strings only, deduped, trimmed, trailing "/" removed
  builtWith: string | null;      // tech_used_raw trimmed
  reach: ReachBucket | null;     // see 5.3
  submittedAt: Date | null;
  // analytics-only (never rendered in the project UI):
  experience: ExperienceLevel | null; vibeCoded: boolean; techMentions: string[];
}
```

Rules:

- **Visibility:** keep only `is_published && consent_to_display`.
- **Categories:** port `getCategories`, including the legacy label map.
- **Topics:**
  - Trim each tag and dedupe case-insensitively.
  - Alias `Kaballah` → `Kabbalah`.
  - Drop tags that are dates (`/^(January|…|December) \d{4}$/`) and meta tags (`not vibe-coded`, `No Experience`, `Experience Unspecified`).
  - `English` is a language, not a topic: keep it in data but don't show it on cards. Show it in the detail view only if no other topics exist.
- **Sort:**
  - *Newest*: `submittedAt` desc, with undated projects last, A–Z among themselves. This is the default.
  - *A–Z*: `localeCompare`.
- **Search:** case-insensitive substring over name, description, topics, short category labels and resources. Debounce input by 150 ms.
- **Category filter:** single-select. A project matches if `categories` includes the selected id. Counts in the filter UI are computed from the **current search results**, so they update as you type.
- **Open source only:** `sourceUrl !== null`.

#### 5.3 Reach

`lib/reach.ts` exports `parseReach(raw): ReachBucket | null` and `formatReach(bucket): string`.

| Raw | Bucket | Label |
|---|---|---|
| contains "proof of concept" (case-insensitive) | `poc` | Proof of concept |
| `<10`, `< 10`, numeric < 10 | `lt10` | Fewer than 10 users |
| ~10 … <100 (e.g. "10", "~50") | `10` | About 10 users |
| ~100 … <1000 ("100", "~100", "300") | `100` | About 100 users |
| ≥ 1000 | `1000` | 1,000+ users |
| "", null, "None", unparseable | `null` | (row hidden) |

Unit-test every row, including `"~100"`, `"100"`, `"1000"`, `"None, it's mostly a proof of concept"`.

#### 5.4 Fields never shown in the project UI

These must not appear on cards or in the detail dialog:

- `technical_experience`
- `vibe_coded`
- `is_buggy`
- `status`
- `featured`
- `submission_source`
- `created_at`
- `image_url`
- `has_pbs_logo`

Use no Formstack or "Added to database" wording anywhere. The only date shown is **"Submitted"** = `submission_date` formatted `MMM d, yyyy` in UTC (`Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })`).

Note: `technical_experience` and `vibe_coded` are still needed in the API response, because `/charts` aggregates them client-side.

#### 5.5 URL state (`useProjectQueryState`)

Sync these to query params with `replaceState` (no history spam), omitting defaults:

- `q`
- `category`
- `open=1` (open source only)
- `sort` (`new` | `az`)
- `view` (`grid` | `list`)
- `project` (open dialog id)

Opening a project pushes history, so **Back closes the dialog**. Also persist `view` to `localStorage` (wrapped in try/catch) as the default for the next visit.

### 6. Global layout

#### 6.1 SiteHeader (sticky: no; height 64 desktop, 56 mobile; white; bottom border `--border-default`)

**Left:**

- the samekh logo link (§4.7)
- a 1×24 px vertical divider (`#cccccc`)
- the text link **"Powered by Sefaria"** (14/600, `--module-primary`), linking to `/`

**Right, ≥1024 (each 44px tall):**

- **"Sefaria.org"** + `ArrowUpRight`, linking to https://www.sefaria.org
- **"Docs"** + `ArrowUpRight`, linking to https://developers.sefaria.org
- **"Donate"** + heart icon, linking to https://www.sefaria.org/donate. Styled as an outlined button: white fill, 1.5px `--module-primary` outline, purple text, `--surface-hover` on hover.

Links to other sites open in a new tab with `rel="noreferrer"`. Their accessible name says so via visually hidden text "(opens in a new tab)".

**Below 1024:** a 48×48 `Menu` icon button opens a small right-aligned menu (or sheet) with the same three links as 48px rows. Escape and outside-click close it, and focus returns to the trigger.

#### 6.2 Hero

**Container:**

- `--module-primary` background, white text.
- Padding: 72px top and bottom (desktop); 56/48 px top/bottom and 24 px sides (mobile).

**Decoration:** a constellation of thin connected lines and dots behind the text, evoking Sefaria's linked texts.

- An absolutely positioned decorative SVG, `aria-hidden`, `pointer-events: none`.
- Lines: white, 1.5px stroke, opacity .2. Dots: white, opacity .4, r 3 (r 6 for 3 hub nodes).
- Anchored to the right ~64% of the hero on desktop, and top-right ~420×320 px on mobile, clipped by `overflow: hidden`.
- It's a single SVG of ~17 nodes and ~25 edges; recreate it, as exact coordinates don't matter.
- **No other decoration:** no floating cards, no stats row. The only other element is the quote below.

**Copy (exact):**

- Eyebrow (14/600, uppercase, with a 24×2 white rule before it): **COMMUNITY SHOWCASE**
- H1: **Built on the open Jewish library.**
- Desktop paragraph (max-width 600): **Sefaria is the hub for Torah innovation. Our entire library of Jewish texts is free for anyone to build with, and this is what people around the world have made: apps, study tools, AI assistants, and research.**
- Mobile paragraph (below 640): **Sefaria is the hub for Torah innovation. Our entire library of Jewish texts is free to build with. Explore the apps, study tools, AI assistants, and research people have made.**

**Talmud quote (an epigraph in the corner).** Keep it small and quiet: **no box, no fill, no border**.

- **≥1100px:** absolutely positioned in the hero's bottom-right corner (`right: 48px; bottom: 40px`), over the constellation.
- **Below 1100px:** in normal flow under the buttons (`margin-top: 24px`).
- Right-aligned throughout.

Content:

- `<figure>` → `<blockquote>` holding the Hebrew `<p lang="he" dir="rtl">` **אי אפשר לבית מדרש בלא חידוש**, white, 30px desktop and 26px mobile, line-height 1.25. Set it in the Hebrew content font `"Taamey Frank CLM", "Times New Roman", serif`. The design system ships `Amiri-Taamey-Frank-merged.ttf`: self-host it with `@font-face` and `font-display: swap`.
- `<figcaption>`: one line that may wrap, 14/20, `rgba(255,255,255,.85)`. It holds the English **There cannot be a study hall without innovation.** (adapted from the William Davidson translation, "without a novelty"), then a ≥44px-tall link **"Chagigah 3a" ↗**, white 500, underlined with `text-decoration-color: rgba(255,255,255,.5)` and `text-underline-offset: 4px`, to `https://www.sefaria.org/Chagigah.3a.15?lang=bi`, opening in a new tab.
- Make sure it never overlaps the copy or buttons at any width between 1100 and 1440. Add a Playwright visual check.

**Buttons:** 48 px tall; side by side on desktop, full width and stacked on mobile.

- **"Explore {N} projects"**: white fill, purple text. Scrolls to and focuses the results heading. N is the live count.
- **"Build with Sefaria" ↗**: transparent, 1.5px white outline. Links to https://developers.sefaria.org.

#### 6.3 SiteFooter

**Container:** `--module-primary` background, white text, 48px padding.

**Left column:**

- **"Powered by Sefaria"** in serif, 24px.
- Body text: "A showcase of independent projects built with Sefaria's free texts, API, and data. Each project is created and maintained by its own developers."

**Links (44px tall, white):**

- **Sefaria.org**
- **Developer Portal**: developers.sefaria.org
- **Sefaria on GitHub**: https://github.com/Sefaria
- **Submit a project**: `https://developers.sefaria.org/docs/powered-by-sefaria`. ⚠️ Confirm the real submission form URL with Sarah.
- **Donate**: https://www.sefaria.org/donate

**Layout:** on mobile the links are stacked 48px rows with 1px `rgba(255,255,255,.2)` dividers. **No link to /charts.**

### 7. Browse page (`/`)

Layout below the hero, inside the container:

- **≥1024:** a `flex-wrap` row with gap 40. `FilterPanel` takes `flex: 1 1 248px; max-width: 280px`. Results take `flex: 999 1 560px; min-width: 0`.
- **<1024:** results only.

#### 7.1 FilterPanel (desktop) / FilterSheet (mobile)

**Section "CATEGORY"** (14/600 uppercase `--text-secondary` legend):

- Single-select radio rows, 44px (52px in the sheet). Each row shows the category icon (18px, purple), the short label, and a right-aligned count (14px, `--text-secondary`).
- Rows: All projects, Learning & Study, AI & Apps, Extensions & API, Visualization & Data, Community & Social, Uncategorized.
- Selected row: `--surface-selected` background and weight 600.
- Implement as a real radio group (`fieldset` + `legend` + inputs, visually styled), not buttons, so arrow keys work.

**Section "CODE":** a checkbox **"Open source only"** (20px box, `accent-color: var(--module-primary)`, 44px row).

**FilterSheet** (mobile and tablet):

- A bottom sheet built on the shared `Dialog` primitive.
- 16px top radius, height up to 90vh, a drag-handle visual (40×4, `#cccccc`; decorative only).
- Header: title "Filters" (serif 26) and a 48×48 close button with a `--surface-hover` fill.
- Scrollable body.
- Sticky footer:
  - text button **"Clear all"**
  - primary navy button **"Show {N} projects"** (52px, flex-grow), where N is the live result count with the pending selection
- Selection applies on "Show"; closing without "Show" discards it.

#### 7.2 ResultsToolbar

One row on desktop that wraps on mobile:

- **SearchField:** 48px tall, `Search` icon inside on the left, 1px `--border-strong`, radius 8, placeholder "Search by name, topic, or description". Has a visually hidden label "Search projects" and a clear (X) button when non-empty (44px hit area). Full width on mobile.
- **"Filters" button** (<1024 only): outlined navy, `ListFilter` icon, label "Filters" or "Filters · {n}" when filters are active. Opens the FilterSheet.
- **Sort `Select`:** 44px, `--border-strong`. Options "Newest", "A–Z". Visible "Sort" label on desktop, visually hidden on mobile.
- **View `SegmentedControl`:** "Show projects as", two `aria-pressed` buttons, Grid (`LayoutGrid`) and List (`List`).
  - 44px tall, 1px `--border-strong` outline around the group.
  - Pressed: `--module-primary` fill, white. Unpressed: white, `--text-secondary`, `--surface-hover` on hover.
  - Text labels "Grid" / "List" show ≥1024; icon-only below, with `aria-label`.

Below the toolbar:

- **Summary line**, `aria-live="polite"`, 14px `--text-secondary`. Reads "Showing 24 of 133 projects · newest first", or with filters "{n} projects match".
- **ActiveFilters chips** (mobile and tablet; optional on desktop): e.g. "AI & Apps ×". Category chip style, 36px tall, ≥44px hit area. Removing a chip clears that filter.

#### 7.3 Grid view (default)

- **Grid:** `repeat(auto-fill, minmax(min(280px, 100%), 1fr))`, gap 24 (16 on mobile).
- **Card:** white, 1px `--border-default`, radius 12, padding 24 (20 on mobile), column gap 16. Content, top to bottom:
  1. The category icon tile (40px) plus the short label of the **first** category (14px, `--text-secondary`). When the list is filtered by a category, show **that** category instead.
  2. The title (serif 24/500).
  3. The description, 16/1.5 `--text-secondary`, **clamped to 2 lines**.
  4. Up to 3 topic tags. **The tag row is always a single line:** `display:flex; flex-wrap:wrap; height:28px; overflow:hidden`, with tags `white-space:nowrap; flex-shrink:0`. Tags that don't fit are hidden whole, never cut and never wrapped. No "+n" counter.
- Closed cards show **nothing else**: no links, dates, tech or resources.
- **Whole card clickable:** the title is a `<button>` (or `<a href="?project=id">`) with a `::after` overlay covering the card. No nested interactive elements.
- Hover: border `#c9d5e6` and `--shadow-small`. Focus-visible ring on the card outline.

#### 7.4 List view

- **≥640, table:** `<table>` in a horizontally scrollable wrapper (min-width 760), 1px border, radius 12.
  - Header row (`--surface-subtle`, 14/600, `--text-secondary`): Project | Category | Topics | Submitted | (visually hidden "Visit").
  - The Project cell holds a 32px icon tile, the name as a button that opens the dialog (16/600), and the description on one line with ellipsis (14px).
  - Topics follow the same single-line rule (24px tags).
  - The last cell is a 44×44 `ExternalLink` icon link to the project, labelled "Visit {name} (opens in a new tab)".
  - Row hover: `--surface-subtle`.
- **<640, rows:** a `<ul>` of 72px rows. Each row has the icon tile (32), the name (serif 20/500), a subline "{Category} · {topic, topic}" (14px, ellipsis), and a `ChevronRight`. The whole row is one tap target that opens the dialog.

#### 7.5 Pagination

- **"Show more projects"**: an outlined navy button, 48px, centred. It appends the next 24.
- After appending, move focus to the first newly shown card.
- Hide the button when everything is shown.
- Page size is 24, and resets when filters change.

#### 7.6 States

- **Loading:** 6 skeleton cards (or rows), with `aria-busy` on the results region.
- **Empty:** the `EmptyState` panel (`--surface-subtle`, radius 12, 64px padding, centred):
  - "No projects match that search." (serif 24)
  - "Try a different word, or clear your filters." (16, `--text-secondary`)
  - **Clear filters** button
- **Error:** see §5.1.

### 8. Project detail dialog (`?project=<id>`)

**Container:** use native `<dialog>` with `showModal()`. This gives a focus trap, Escape to close, and top layer.

- Lock body scroll, restore focus to the invoking card on close, and close on a backdrop click.
- Label it with `aria-labelledby` pointing to the title.
- Backdrop: `--scrim`.
- **≥640:** centred, `max-width: 760px`, `max-height: calc(100vh - 64px)`, radius 16, `--shadow-xlarge`, body scrolls.
- **<640:** full-screen (100dvh, radius 0). Sticky header, scrollable body, **sticky bottom CTA bar**.

**Header** (sticky inside the dialog, bottom border):

- Category chips, all categories in order: 32px tall, radius 4, white fill, 1px `--border-strong` inset, `--module-primary` 14/600 text, plus the icon.
- **Close button:** 48×48, `--surface-hover` fill, radius 8, `X` 24px, `aria-label="Close"`.

**Body** (padding 32 desktop, 24/16 mobile; gap 32/28), in this order:

1. **Title:** serif 40/500 (34 mobile).
2. **Description:** 18/1.6 `--text-primary`.
3. **CTA block** (`--surface-subtle` panel, radius 12, padding 24; on mobile the primary CTA moves to the sticky footer):
   - **Primary CTA:** a full-width link, 56px, radius 8, **`--module-primary` fill**, white 18/600 text, label **"Open {project name}"** + `ArrowUpRight`. Hover `--module-primary-hover`. Opens a new tab. Only rendered if `url` is non-null.
   - Helper text, 14px `--text-secondary`: "Opens {domain} in a new tab" (mobile footer: "{domain} · opens in a new tab").
   - **"View source code"** (only if `sourceUrl`): outlined, 1.5px `--module-primary` inset, purple text, `CodeXml` icon, 44px.
   - **This purple CTA deliberately departs from the design system**, whose primary buttons are navy. Mention it in the PR.
4. **"Project Backstory"** (only if `backstory`): an `h3` label in 14/600 `--text-secondary`, then the text in 18/1.6 `--text-primary`. Plain upright text. **No quotation marks, no italics, no attribution line.**
5. **Details** `<dl>` (top border, padding-top 24, row gap 24; each `dt` is 14/600 `--text-secondary`):
   - **Sefaria resources used:** one tag per resource. Monospace 14, `--surface-selected` fill, `--text-link` text, radius 4, 32px, `Braces` 14px icon.
   - **Built with:** plain text, 16/1.5.
   - **Topics:** pill tags, 32px, `--surface-hover` fill, `--text-secondary`.
   - **Reported reach:** e.g. "About 100 users", then a 14px `--text-secondary` suffix "· approximate, self-reported". Hidden when null.
   - **Submitted:** formatted date. Hidden when null.

**Rules:**

- Omit any section whose data is empty; never render an empty label.
- **No iframe or live preview anywhere.**
- An unknown `?project=` id silently removes the param.

**Tag types must be visually distinct** (spec board "Four tag types, four shapes"):

| Type | Shape |
|---|---|
| Category | outlined purple rectangle + icon |
| Topic | grey pill |
| Sefaria resource | blue-tinted mono chip + braces icon |
| Built with | plain text |

Build one `Tag` component with `variant: 'category' | 'topic' | 'resource'`.

### 9. Charts page (`/charts`, unlisted)

**Page setup:**

- `<meta name="robots" content="noindex, nofollow">` (set via `react-helmet-async` or a small effect).
- Document title: "Powered by Sefaria in numbers".
- Not linked anywhere. Lazy-loaded route.
- Same `SiteHeader`, plus an **"All projects"** link (`ArrowLeft`) on the right. Page background `--surface-subtle`.
- H1 (serif 40): **Powered by Sefaria in numbers**
- Notice pill (white, 1px border, radius 8, `TriangleAlert` icon in `--feedback-warning`): **"We're revising how this data is collected, so some figures may be out of date."**

**Grid:** `repeat(auto-fit, minmax(min(560px, 100%), 1fr))`, gap 24.

**`ChartCard`:**

- White, 1px border, radius 12, padding 24.
- Header: title in 18/600, subtitle in 14 `--text-secondary`.
- Below the header: the chart, a legend when there are two or more series, and a footnote in 14/21 `--text-secondary`.
- Every chart has a **"Show as table"** disclosure (`<details>`) rendering a `DataTable` of the same numbers. This is the accessible alternative.
- Bars are `--module-primary` with 4px rounded data ends and a 2px gap between stacked segments.
- Hover tooltips are allowed, but values must never be reachable only by hover. Hover darkens a bar to `--module-primary-hover`.

All aggregation lives in `features/charts/selectors.ts` as pure functions with unit tests, computed from the normalised projects. **"Most recent completed month"** = the month before today (UTC). Port this from `submissionsTrend.js`.

**Charts, in order:**

1. **Submissions by year.**
   - Vertical bars per year from the earliest year to the current year, including zero years. The value goes above each bar; labels are `'12`…`'26`.
   - Header right: **"Total" + all-time count** (serif 40). This counts all visible projects, dated or not.
   - Footnote: "Total is the all-time count. {k} projects have no submission date and aren't plotted."
2. **Projects over time.**
   - Cumulative line of dated projects by year: 2px purple line, end-point dot, end value labelled.
   - **Annotations are numbered markers on the line with the notes listed *below* the chart**, never as text on the chart.
   - Notes are config in `selectors.ts` (or `chartNotes.ts`). The last note is always "Tracking began {DATE}. Earlier projects were added by hand, using their last commit or site date." ⚠️ Get the date and note text from Sarah.
3. **Submissions by experience level.**
   - Stacked monthly bars from the earliest month with a known level through the most recent completed month.
   - Series in ordinal order, light to dark: No experience `#e1bed8`, Beginner `#b36fa2`, Intermediate `#7c416f`, Advanced `#38192f`. The mapping is: `None` → No experience, `<5 years` → Beginner, `5-10 years` → Intermediate, `10+ years` → Advanced.
   - The legend sits above the chart; month totals go above the bars.
   - Footnote: "Only the {n} dated projects that reported experience are shown. Experience levels: No experience, Beginner (<5 years), Intermediate (5–10), Advanced (10+)."
4. **Vibe-coded vs. not, tracked since July 2026.**
   - Stacked monthly bars over the trailing 12 completed months. Vibe-coded `#7c416f`, Not vibe-coded `#999999`.
   - Footnote: "\"Vibe-coded\" is a newly tracked field, so months before July 2026 may be undercounted or unreported rather than confirmed not vibe-coded."
5. **Projects by Tag** (renamed from "Keyword frequency").
   - Horizontal bars, top 10 topics by project count, using the cleaned topics from §5.2.
   - **Exclude `English`.** Footnote: "Language tag \"English\" ({n}) hidden so it doesn't swamp the topics."
   - Bars, not a pie: ten categories read badly as a pie.
6. **Sefaria resources used.**
   - Horizontal bars of projects per resource group. Group endpoints with `normalizeEndpoint`, then map to friendly groups:
     - Texts: `/api/texts*`, `/api/v3/texts`, `/api/text`, "Text"
     - Index & structure: `/api/index`, `/api/v2/raw/index`, `/api/v2/index`, `/api/shape`, `/api/counts`
     - Calendars
     - Links & related: `/api/links`, `/api/related`
     - Search: `/api/search*`
     - Dictionary (words): `/api/words*`
     - Documentation
     - Name lookup: `/api/name`
     - Sefaria-Export
     - Sefaria MCP
     - Manuscripts
   - Exclude the generic "Sefaria API" and anything unmapped.
   - **No "Other" bar.** Footnote: "Endpoint versions grouped (e.g. /api/texts and /api/v3/texts → Texts)."
7. **Built with.**
   - Horizontal bars, top 8 from `tech_used_raw`. Port `techUsed.js`, including the "Claude Code" special case, and relabel `Sefaria MCP` → `MCP`, because the pattern matches any MCP.
   - Footnote: "From {n} projects that described their stack. Matched from free text, so a project can count toward several."
8. **Reported reach.**
   - Horizontal bars per reach bucket (§5.3), in order: Proof of concept, Under 10, About 10, About 100, 1,000+.
   - Footnote: "Self-reported by {n} of {total} projects; the rest left it blank."

Reference values from production data on 2026-10-08, useful as test fixtures:

- 133 visible projects; 23 undated; 2026 has 58 submissions.
- Top tags: AI 35, Gemara 18, Tanakh 13, Hebrew 13.
- Texts group 38.
- Reach reported by 11 projects.
- Experience reported by 34 dated projects.

Snapshot the API response into `src/lib/__fixtures__/projects.json` for tests.

### 10. Accessibility checklist (must pass; Penina will QA against this)

- [ ] Every page has one `h1` and a logical heading order. Landmarks: `header`, `nav` (labelled), `main`, `footer`. A skip link "Skip to projects" is the first focusable element.
- [ ] Every control is a native element: `button`, `a[href]`, `input`/`select` with a `<label>`. No click handlers on divs or spans. Icon-only buttons have `aria-label`.
- [ ] The touch target is **≥44×44** on every interactive element at every breakpoint. Add a Playwright test that asserts bounding boxes of all `button, a, input, select, [role=radio]` in the viewport at 390px are ≥44 in both dimensions, or ≥44 tall for full-width text links.
- [ ] Contrast: text ≥4.5:1 (≥3:1 at 24px+). UI component boundaries ≥3:1. The pairs in §4.1 already pass; don't introduce new ones without checking.
- [ ] Focus is visible everywhere (the global ring), never removed. The dialog and sheet trap focus, close on Escape, and return focus.
- [ ] State is never shown by color alone: pressed toggles use `aria-pressed` plus fill, the selected filter uses a radio plus fill and weight, and chart series have a legend plus table.
- [ ] `aria-live` summary for result counts. Search input `type="search"`.
- [ ] External links announce "(opens in a new tab)".
- [ ] Reduced motion: honour `prefers-reduced-motion` (no smooth scroll or transitions).
- [ ] Zoom to 200% and a 320px width work with no horizontal page scroll (only the list table scrolls inside its own wrapper).
- [ ] axe: zero violations on `/`, `/?project=<id>`, the filter sheet open, and `/charts`, at both viewports.

### 11. Performance and quality targets

- Lighthouse (mobile) on `/`: Performance ≥90, Accessibility 100, Best Practices ≥95, SEO ≥95. Note `/charts` is intentionally noindex.
- The main JS bundle excludes recharts (lazy route). Fonts use `display=swap` and preconnect.
- No layout shift on load: skeleton dimensions match the real cards.
- `<title>`: "Powered by Sefaria: projects built on the open Jewish library".
- Add a meta description and Open Graph tags (title, description, a 1200×630 OG image. Ask Sarah for the image, or generate a simple purple samekh card).

### 12. Tests to write (minimum)

**Unit (Vitest), `lib/` and `selectors`:**

- normalize (visibility filter, categories incl. legacy and none, topic cleaning, resource dedupe, safe URLs, domain)
- `parseReach`/`formatReach` (every row of §5.3)
- sort (undated last)
- filter and search (all fields; counts reflect search)
- URL state round-trip
- every chart selector against the fixture (totals above)
- endpoint normalisation (port the existing tests)
- tech parsing

**Component (RTL + vitest-axe):**

- `ProjectCard` renders exactly icon, label, title, description and tags; the tags container has a single-line clamp.
- `ProjectDetail` omits empty sections, never renders hidden fields (assert "Technical", "Formstack", "vibe" are absent), and shows "Reported reach".
- `Dialog` focus trap, Escape, focus return.
- `SegmentedControl` `aria-pressed`.
- `FilterSheet` applies on Show and discards on close.

**E2E (Playwright, desktop and mobile):**

- search → filter → toggle list → open project (deep link updates) → Back closes the dialog
- the mobile filter sheet flow
- Show more
- `/charts` renders all 8 charts and has a noindex meta
- the touch-target audit
- axe on every state

### 13. Out of scope here (Django / Sefaria side): list these in the PR as follow-ups

- **Django admin** for Powered-by projects: `list_display`, `list_filter` (published, consent, featured, status, source, vibe_coded), `search_fields`, and an editable tags field. Tag editing lives **only** there.
- **API:** keep `technical_experience` and `vibe_coded` in `/api/powered-by` (needed by `/charts`), and consider adding a cleaned `tags` array server-side. Reach is now public.
- **Data hygiene:** merge `Kaballah`/`Kabbalah`; remove junk tags (dates, "not vibe-coded", experience values used as tags).

### 14. PR template

```
## Powered by Sefaria redesign
Implements docs/REDESIGN_SPEC.md.

### What changed
- Rewritten in TypeScript … (summary)
### Screenshots
Desktop 1440 + mobile 390 for: browse grid, browse list, filters (sidebar / sheet), project dialog, empty state, /charts.
### Acceptance criteria
- [ ] Usable end to end on mobile and desktop (search, scroll, open cards, close dialog)
- [ ] Touch targets ≥44px and contrast meet WCAG A/AA (axe + target-size test green)
- [ ] Typography, spacing, radius, icons follow the Sefaria design system (DevPortal theme) and Lucide
- [ ] Grid/list toggle; minimal closed cards; single-line tag rows; iframe removed; internal fields hidden; four distinct tag types
- [ ] Tagline, explainer, Chagigah 3a quote (Hebrew + English, linked), Sefaria.org, Docs/Developer Portal, Donate, Submit links in place
- [ ] Reported reach shown on project detail
- [ ] /charts unlisted + noindex with the 8 charts and the fixes in §9
- [ ] No admin UI in this app (moved to Django admin; follow-ups listed)
### Deliberate departures from the design system
- Project CTA uses module-primary (purple) instead of action-primary (navy)
- Lucide icons used directly; custom topic icons not yet in Sefaria's icon library
### Follow-ups (Sefaria / Django)
…
### QA
@Penina: ready for QA. Please don't deploy until you've signed off; you trigger the manual deploy.
```

### 15. Open questions (Claude Code: ask before guessing)

1. The real **project submission form URL** for "Submit a project".
2. The **font source** for Adobe Garamond Pro: Sefaria-hosted, or fall back to EB Garamond?
3. An **SVG of the samekh mark**, if one is available.
4. **Chart notes and the tracking start date** for "Projects over time".
5. An **OG/share image**.
6. Licensing check: confirm the Taamey Frank / Amiri merged font may be self-hosted on powered-by.sefaria.org. It ships with Sefaria's design system.