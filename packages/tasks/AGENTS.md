# Tasks reference package

This package is the implementation contract for a white-label task product. It
contains no copied product source, brand assets, account data, or final visual
components.

- Start with `specs/product.md`, then the relevant page and component spec.
- Use `src/lib/fixtures.ts` for every future Storybook story. Do not put a
  personal task, list, person, or workspace name in a story.
- Consume the host package's installed shadcn primitives first. Add a missing
  primitive only through `pnpm ui:add <family>` and update `COMPONENT_AUDIT.md`.
- Treat `src/lib/tasks-theme.css` as a scoped companion theme. Do not change the
  root product theme merely to implement a Tasks surface.
- Committed Superlist captures under `reference/superlist/<date>/screenshots/{pages,components}/`
  are Visual Delta evidence (DSF 3; pages full-viewport, components subject-clipped).
  Keep raw videos, traces, and auth state out of version control.
- Regenerate with `reference:capture:delta` (live) or `reference:migrate:delta`
  (bootstrap from `screenshots/browser/`). Matrix: `capture-matrix.json`.
- Component visual baselines use the shared Playwright suite under
  `tests/visual/storybook.spec.ts-snapshots/tasks/` (same update gate as shadcn);
  that suite is separate from Superlist Visual Delta overlays.

## Capture workflow

1. `pnpm --dir packages/tasks reference:auth` stores an ignored authenticated
   browser state after a human login.
2. `pnpm --dir packages/tasks reference:bootstrap` creates or repairs only the
   private `Tasks UI Reference` fixture.
3. `pnpm --dir packages/tasks reference:capture` writes sanitized keyframes and
   a checksummed manifest beneath `reference/superlist/<capture-id>/`.
4. `pnpm --dir packages/tasks reference:verify` checks specs, fixtures, and the
   committed manifest before handoff.

Never use the bootstrap tool against a shared list. It aborts unless the
fixture's exact name is selected.
