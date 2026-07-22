# ProjectCard Description Truncation — Design

> **Superseded by [`2026-07-22-project-card-description-scroll-design.md`](2026-07-22-project-card-description-scroll-design.md).** Kept as a historical record of the toggle-button approach that was tried first and then replaced.

**Goal:** Long project descriptions currently stretch `ProjectCard` to arbitrary heights, making the grid visually uneven. Descriptions should be clamped to a fixed number of lines with a "view more" / "view less" toggle, so all cards stay roughly the same height.

**Scope:** `src/components/ProjectCard.jsx` and `src/index.css` only. No other component changes.

## Behavior

- Description text is visually clamped to 3 lines via CSS `-webkit-line-clamp: 3` when collapsed.
- If the description overflows 3 lines, a "view more" toggle button appears below it.
- If the description already fits within 3 lines, no toggle is shown.
- Clicking "view more" expands the card in place (full description shown, card grows taller, other cards in the grid reflow around it) and the button relabels to "view less".
- Clicking "view less" re-collapses to the 3-line clamp.
- Expand/collapse state is local to each card — expanding one card does not affect others.

## Implementation approach

- `ProjectCard` gains local state: `const [expanded, setExpanded] = useState(false)`.
- A `ref` (`descRef`) is attached to the description `<p>`.
- On mount, a `useEffect` compares `descRef.current.scrollHeight > descRef.current.clientHeight` to detect whether the (collapsed) text overflows its clamped box. Result stored in a second piece of state, `isOverflowing`.
- The description `<p>` conditionally gets a `.clamped` class (applying `-webkit-line-clamp: 3`) when `!expanded`.
- The "view more"/"view less" `<button>` renders only when `isOverflowing` is true, and toggles `expanded`.

## Known limitation (accepted trade-off)

The overflow check (`scrollHeight` vs `clientHeight`) runs once on mount. If the browser window is resized significantly afterward (changing how many characters fit per line), the presence of the "view more" link won't re-evaluate until the next full page load. Given this is a browse-once dashboard rather than an app people resize live, this is an accepted limitation — not handled with a `ResizeObserver` in v1.

## Out of scope

- No changes to `ProjectGrid`, `Dashboard`, or `Controls`.
- No animation on expand/collapse (instant show/hide is fine).
- No persistence of expanded state across re-renders/re-fetches (resets to collapsed).
