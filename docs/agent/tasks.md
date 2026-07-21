---
id: tasks
title: Tasks reference package
summary: Use the Tasks clean-room specs, fixtures, capture evidence, and scoped companion theme before implementing task UI.
sources:
  - packages/tasks/AGENTS.md
  - packages/tasks/specs/product.md
  - packages/tasks/src/lib/reference.ts
---

# Tasks reference package

`@stevejuma/tasks` is the white-label task-app implementation contract. It is a
reference/specification package in the first slice, not a copy of the observed
product and not an excuse to bypass the catalog's component rules.

## Reading order

1. `packages/tasks/specs/product.md` — scope, responsive policy, accessibility.
2. Relevant `specs/pages/*.md` — page state and behavior.
3. **Tasks/Component Specs** in Storybook — the canonical component contract,
   rendered directly from `specs/components/*.md` beside its placeholder.
4. `@stevejuma/tasks/fixtures` and `@stevejuma/tasks/reference` — deterministic
   story data and viewport/motion contracts.
5. `@stevejuma/tasks/theme.css` — scoped light/dark companion tokens.

## Component policy

- Reuse installed shadcn families first: Sidebar, Resizable, ScrollArea, Button,
  DropdownMenu, Popover, ToggleGroup, Command, Empty, and feedback primitives.
- Use `@stevejuma/ui/forms` `TaskDueCalendar` for the first due-date picker.
- Add Checkbox, Avatar, and ContextMenu only when their implementation slice
  needs them, via `pnpm ui:add <family>`; update `COMPONENT_AUDIT.md`.
- Keep the responsive pager and task selection coordination local to Tasks; do
  not bend `@stevejuma/workspace` into a mobile task navigator.

## Evidence and privacy

The reference harness stores auth state and raw video under ignored package-local
directories. Committed browser captures under
`reference/superlist/<date>/screenshots/browser/` must use the dedicated Tasks
UI Reference fixture list (synthetic task titles). Ordinary account chrome in
those frames is allowed; do not commit unrelated personal tasks. Story data
still uses synthetic fixtures from `@stevejuma/tasks/fixtures`.

Component visual regression uses the shared Playwright suite (same gate as
shadcn) under `tests/visual/storybook.spec.ts-snapshots/tasks/`. That is
separate from Superlist reference overlays (`referenceVisualDelta`).

Run `pnpm --dir packages/tasks reference:verify` after changing contracts. For a
new research pass, follow the auth → bootstrap → capture → verify sequence in
`packages/tasks/AGENTS.md`.
