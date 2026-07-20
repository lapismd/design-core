# Tasks product reference

`@stevejuma/tasks` is a white-label reconstruction brief for the core task and
list experience observed in a logged-in Superlist session. It preserves
behavioral hierarchy and interaction quality while using original Tasks copy,
theme, icons, fixtures, and visual assets.

## In scope

- Shell, Inbox, Today, task overview, Updates, Lists, list detail, and task
  detail.
- Task creation, edit, complete/reopen, ordering, filters, task properties,
  keyboard behavior, pointer behavior, double click, drag, and touch gestures.
- Desktop, tablet, and mobile layouts defined in `src/lib/reference.ts`.
- Light companion theme and a semantic dark companion; reduced-motion behavior.
- Storybook docs, deterministic fixtures, interaction/a11y tests, and a
  capture-backed evidence trail.

## Not in the first implementation slice

- Account settings, billing, integration setup, real-time sync, imports, and
  server persistence.
- Product branding, illustrations, copied strings, or copied visual assets.
- Collaborative mutation semantics beyond controlled props and fixture states.

## Core model

A task belongs to one or more views and optionally a list. A task has a title,
open/done state, due bucket, priority, labels, assignee, optional note, and a
stable ordering within a list. The UI must never make completion and opening
the same pointer target: completion has its own control.

## Layout contract

| Width class                                 | Shell behavior                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Desktop (≥ 1280)                            | persistent navigation sidebar, main list, optional persistent detail rail                                      |
| Compact desktop/tablet landscape (897–1279) | navigation sidebar and main content; selected detail is an overlay or constrained rail                         |
| Tablet portrait/mobile (≤ 896)              | one pane at a time in a horizontal pager; detail is reached by task activation and left by back or right swipe |

The app canvas is quiet and neutral. The working surface is rounded, elevated,
and separated from the outer canvas. List rows are dense, scan-first controls;
the detail view is slower, more spacious, and property-oriented.

## Accessibility contract

- Every navigation destination, task row, completion control, composer,
  property action, menu, and detail close/back action has an accessible name.
- A task row exposes its selection. `Enter` opens it; `Space` toggles its
  completion when the row has focus; completion is separately focusable.
- Drag sorting has keyboard equivalents and an announced drop result.
- Swipe-only affordances have visible button/menu equivalents.
- Focus moves to the task-detail heading on open and returns to the originating
  row on close. Respect `prefers-reduced-motion`.

## Delivery order

1. Shell plus fixture-driven task row/list stories.
2. Desktop detail/open/complete, then Today/Tasks/Lists states.
3. Responsive pager and touch/reorder motion contracts.
4. Updates/empty feedback and dark companion audit.
