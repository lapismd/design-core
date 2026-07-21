# `@stevejuma/tasks`

Fixture-driven white-label task and list UI for Storybook. The package ships
controlled Svelte compositions, synthetic fixtures, motion helpers, a scoped
companion theme, and capture-backed Visual Delta targets.

Read [the product spec](./specs/product.md) and the live execution plan in
[`PLAN.md`](./PLAN.md). Capture provenance lives in
[the reference README](./reference/superlist/README.md).

## Public surface

Import compositions from `@stevejuma/tasks`:

- Leaf: `TaskRow`, `TaskComposer`, `TaskProperties`, `TasksFeedback`
- Composites: `TaskList`, `ListNavigation`, `TasksFilters`, `TaskDetail`,
  `TasksShell`, `TasksSwipeGesture`
- Pages: `ShellPage`, `InboxPage`, `TodayPage`, `TasksPage`, `UpdatesPage`,
  `ListsPage`, `ListDetailPage`, `TaskDetailPage`
- Contracts / fixtures / theme: `@stevejuma/tasks/fixtures`,
  `@stevejuma/tasks/reference`, `@stevejuma/tasks/tokens`,
  `@stevejuma/tasks/theme.css`

Host primitives come from `@stevejuma/ui/shadcn/<family>` and due dates from
`@stevejuma/ui/forms` (`TaskDueCalendar`). Checkbox/Avatar/ContextMenu host
adds remain blocked on the generator’s svelte-check gate; TaskRow uses an
accessible `role="checkbox"` completion control until then.

## Storybook surfaces

- **Tasks/Components/\*** — production components; every story participates in
  Playwright visual baselines (component-clipped), with Visual Delta auto-wired
  from those baselines
- **Tasks/Pages/\*** — page compositions with Superlist `referenceVisualDelta`
  overlays plus Playwright baselines
- **Tasks/Reference Targets** — committed browser capture evidence (`skip-visual`
  for Playwright; overlays are the captures themselves)
- **Tasks/Implementation Map** — ledger overview (planning aid)

## Commands

```text
pnpm --dir packages/tasks reference:auth
pnpm --dir packages/tasks reference:bootstrap
pnpm --dir packages/tasks reference:capture
pnpm --dir packages/tasks reference:verify
```

### Visual checks

- **Reference overlays** — committed PNGs under
  `reference/superlist/2026-07-20/screenshots/browser/`, served at
  `/tasks-reference/2026-07-20/…`, wired via `referenceVisualDelta`.
- **Component baselines** — Playwright suite under
  `tests/visual/storybook.spec.ts-snapshots/tasks/…` (component-clipped).
  Same update gate as shadcn: do not write baselines without explicit approval
  (`VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update …`).
