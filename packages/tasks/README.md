# `@stevejuma/tasks`

Fixture-driven white-label task and list UI for Storybook. The package ships
controlled Svelte compositions, synthetic fixtures, motion helpers, a scoped
companion theme, and Superlist-backed Visual Delta targets.

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

## Storybook surfaces

- **Tasks/Components/\*** — every story wires `visualDeltaForStory(storyId)` to a
  **subject-clipped** Superlist PNG (DSF 3)
- **Tasks/Pages/\*** — every story wires a **full-viewport** Superlist PNG
- **Tasks/Reference Targets** — browseable evidence catalog
- **Tasks/Implementation Map** — ledger overview (planning aid)

## Commands

```text
pnpm --dir packages/tasks reference:bootstrap
pnpm --dir packages/tasks reference:migrate:delta
pnpm --dir packages/tasks reference:ingest:delta
pnpm --dir packages/tasks reference:capture:delta
pnpm --dir packages/tasks reference:verify
```

Live Superlist observation prefers Chrome MCP + `reference:ingest:delta`
(verbatim screenshots; see `reference/superlist/README.md`).
### Visual checks

- **Superlist Visual Delta** — matrix in `reference/superlist/capture-matrix.json`;
  PNGs under `screenshots/pages/` and `screenshots/components/` (DSF 3).
- **Playwright baselines (Tasks Shell)** — synced from those Superlist captures via
  `pnpm --dir packages/tasks reference:sync-visual-baselines` into
  `tests/visual/storybook.spec.ts-snapshots/tasks/`. Stories tagged
  `tasks-reference-visual` fail CI when they diverge. Do not use
  `test:visual:update` for shell — re-sync from Superlist instead.
  Other Tasks stories are `skip-visual` while shell alignment is in progress.
