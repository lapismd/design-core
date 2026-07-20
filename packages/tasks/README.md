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

- **Tasks/Components/\*** — production components with Docs + play coverage
- **Tasks/Pages/\*** — page compositions over synthetic fixtures
- **Tasks/Reference Targets** — synthetic capture evidence for Visual Delta
- **Tasks/Live Reference** — local-only live Superlist captures (gitignored)
- **Tasks/Implementation Map** — ledger overview (planning aid)

## Commands

```text
pnpm --dir packages/tasks reference:auth
pnpm --dir packages/tasks reference:bootstrap
pnpm --dir packages/tasks reference:capture
pnpm --dir packages/tasks reference:verify
```

### Local live Superlist overlays

Live Chrome captures stay under the gitignored tree
`.reference-artifacts/live-superlist/screenshots/` and are served at
`/tasks-reference-live`. They may contain real account or list content — **never
commit them**.

Opt production stories onto live overlays:

```bash
STORYBOOK_TASKS_LIVE_REFERENCE=1 pnpm storybook
```

Or browse **Tasks/Live Reference** (always points at the live PNGs). Default
Storybook (no env) keeps synthetic `referenceVisualDelta` targets.

Do not update Playwright visual baselines without explicit human approval.
