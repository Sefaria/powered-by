# Tabbed Sidebar Navigation

## Purpose

Add a two-tab navigation structure to the dashboard: "Projects" (the existing project grid/search/filter view) and "Charts and Analytics" (a placeholder for now). Navigation is presented as a sidebar on the left of the page.

## Approach

In-page tab switching via React state — no router, no new dependency, no URL change. Matches the current app's simplicity. Downside (accepted): refreshing or sharing a link always lands on the Projects tab, and switching tabs remounts content (see State Reset below).

## Layout

- `Title` remains a persistent top bar, unchanged, shown above everything on every tab.
- Below the header, a flex row: a left `Sidebar` and a right content area that fills the remaining space.

## Components

- `App.jsx` — layout owner. Holds `activeTab` state (`'projects' | 'charts'`), initialized to `'projects'`. Renders `Title`, then `Sidebar` + the active tab's content.
- `Sidebar.jsx` (new) — props: `tabs` (array of `{ id, label }`), `activeTab`, `onSelectTab`. Renders a vertical list of buttons; the active tab is visually highlighted; clicking a button calls `onSelectTab(id)`.
- `ChartsAndAnalytics.jsx` (new) — placeholder component. Renders placeholder text (e.g. "Charts and analytics coming soon."). No data fetching, no logic.
- `Dashboard.jsx` — unchanged, rendered when `activeTab === 'projects'`.

## Data Flow

Single source of truth: `activeTab` lives in `App.jsx` and is passed down to `Sidebar` (to know which tab is active) and used directly in `App.jsx` to decide which content component to render.

## Styling

Add flex layout to `App.css`:
- Sidebar: fixed width (~180px), left-aligned, full height of the content area below the header.
- Content area: flexes to fill remaining horizontal space.

## State Reset (accepted trade-off)

Switching away from Projects and back remounts `Dashboard`, resetting its search text and category filter. This is acceptable for now; not in scope to fix.

## Testing

Manual only:
1. App loads with Projects tab active by default — grid, search, and filters behave exactly as before.
2. Click "Charts and Analytics" — placeholder text shows, no console errors.
3. Click back to "Projects" — grid reloads (search/filter state reset, per above).
