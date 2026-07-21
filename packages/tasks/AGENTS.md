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
- Regenerate primarily via Chrome MCP + `reference:ingest:delta` (see
  `reference/superlist/README.md`). Optional: `reference:migrate:delta` /
  `reference:capture:delta`. Matrix: `capture-matrix.json`.
- Playwright baselines for Tasks Shell (`tasks-reference-visual`) are synced from
  Superlist captures via `pnpm --dir packages/tasks reference:sync-visual-baselines`
  into `tests/visual/storybook.spec.ts-snapshots/tasks/`. Do not overwrite those
  with `test:visual:update`. Other Tasks stories are `skip-visual` while shell
  alignment is in progress. Visual Delta overlays remain a separate Storybook
  review aid via `visualDeltaForStory`.

## Capture workflow

1. Capture live Superlist in Chrome MCP (verbatim viewport; no redaction overlays).
   Stage PNGs under `os.tmpdir()/tasks-live-chrome/<matrix-id>.png`.
2. `pnpm --dir packages/tasks reference:ingest:delta -- --dir=… --ids=…` lands
   pages/clips and updates the dated manifest checksums.
3. `pnpm --dir packages/tasks reference:verify` checks specs, fixtures, matrix,
   and manifests before handoff.
4. Optional Playwright path: `reference:auth` → `reference:bootstrap` →
   `reference:capture` / `reference:capture:delta` when headed Chromium is usable.

Never use the bootstrap tool against a shared list. It aborts unless the
fixture's exact name is selected.
