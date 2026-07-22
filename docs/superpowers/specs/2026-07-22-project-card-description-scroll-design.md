# ProjectCard Description Scroll — Design (supersedes description-truncation design)

**Goal:** Replace the earlier expand-in-place + "view more" toggle behavior (see `2026-07-22-project-card-truncation-design.md`) with an internally-scrollable, fixed-height description box, so cards stay a uniform size without requiring click-to-expand interaction.

**Scope:** `src/components/ProjectCard.jsx` and `src/index.css` only.

## Behavior

- The description `<p>` has a fixed height (approximately 5 lines' worth of text, matching the line-count target from the prior design).
- If the description's content is taller than that fixed height, the box becomes internally scrollable (`overflow-y: auto`) — the user scrolls within the description area itself, not the page.
- If the description fits within the fixed height, no scrollbar appears (native browser behavior for `overflow-y: auto` when content doesn't overflow).
- The scrollbar is the browser's default, shown whenever content overflows — no custom scrollbar styling in this iteration.
- No click-to-expand, no "view more"/"view less" toggle, no per-card expanded/collapsed state.

## Implementation approach

- Revert `ProjectCard.jsx` to a stateless component: remove `expanded`/`isOverflowing` `useState`, remove `descRef`/`useEffect` overflow detection, remove the toggle `<button>`.
- Description `<p>` gets a single new class, `.project-card-desc`.
- Replace the `.clamped` and `.project-card-toggle` CSS rules in `index.css` with one rule for `.project-card-desc`: fixed `height` (or `max-height`) and `overflow-y: auto`.

## Out of scope

- Custom-styled scrollbars (would need `-webkit-scrollbar` rules with inconsistent cross-browser/Firefox support) — deferred, not part of this iteration.
- No changes to `ProjectGrid`, `Dashboard`, or `Controls`.
