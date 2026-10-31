# Canvas Table and structured filters: full qualification and local landing

## Authorization and candidate

On 2026-10-31 the user explicitly requested the full suite, local integration into
the main workspace and deletion of the task temporary workspaces. This lifts the
prior UI-review qualification gate. Screenshot comparison/baseline updates,
publication, pushing and plugin adoption remain excluded.

The qualification candidate merges the filter/table revision 77299aab (which
already contains current main 8e9b3f29 and Canvas Table 50c94a6b) with the main
workspace's committed 8e210d23. Its two local changes, 8e210d23 and d190b73d, are
preserved. The main workspace itself is clean and remains unchanged until the
combined candidate passes. Only structured-filters and canvas-table workspaces
are candidates for cleanup; all other registered workspaces are retained.

Two conflicts were resolved: use the latest verification matrix plus retained
Button evidence, and preserve both visible-overflow scanning and hidden/inert
content exclusion in Column Canvas. The scan does not use overflow widths from
ancestors contaminated by excluded descendants. Existing dense-label and hidden
content stories are the narrow regression boundary before widening.

## Qualification ledger

The combined candidate passes 184 unit tests in 11 files using
`pnpm test:unit src/shared/shadcn/column-canvas src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table`
and 10 interaction/accessibility cases using
`VITEST_MAX_WORKERS=2 pnpm test:storybook src/shared/shadcn/column-canvas/ColumnCanvasFit.stories.svelte`.
Both have 0 failures. Logs: `/tmp/canvas-filters-integration-units.log` and
`/tmp/canvas-filters-integration-fit-stories.log`.

`pnpm spec:first` and `pnpm spec:check` pass (3 lanes, 0 failures). Full
qualification is running with
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks`; package configuration,
archive and isolated public consumer checks run separately. The owned review
Storybook on 10329 was stopped before browser lanes so these start cold.

Latest registry spec-validator is 0.2.0 (already
covered). Node 24.10.0 avoids the inherited Node 26 QMD ABI issue; doctor and
semantic search are rechecked. No global runtime configuration is changed.

## Landing and cleanup checklist

- Complete focused affected checks, full pnpm checks, package checks and packed
  standalone/table consumer acceptance, including a cold Storybook run.
- Record failures, fixes, exact reruns and final counts; mark requirements
  implemented only when qualification passes.
- Recheck the main working copy, integrate the qualified candidate there and
  update the local main bookmark without pushing or rewriting unrelated work.
- Preserve local qualification artifacts in the main checkout, stop only owned
  temporary servers, forget the two task workspaces, then remove their exact
  directories only after proving their content is reachable from main.
- Confirm the main workspace is clean, both task paths are absent and all other
  workspace registrations remain intact. Leave lapis-plugins unchanged.

## Qualification results in progress

- `pnpm packages:check`: passed, 0 failures.
- `pnpm packages:pack`: passed; source archive, clean npm install, strict public
  consumer types, cold development and production browser checks, and production
  dependency audit all pass. Audit has 0 findings. The public Bits UI patch
  contract is retained. Log: `/tmp/canvas-filters-packages-pack.log`.
- The full check lane has passed 1,071 unit cases across 151 files, 35 release
  tooling tests, concurrency/cache tooling tests, all four strict type projects
  (0 errors, 0 warnings), formatting, native CSS, and all specification lanes.
  Static catalog build and metadata audit pass, with 0 contract errors and no
  screenshot comparisons. All 1,022 Storybook interaction/accessibility cases
  across 282 files pass. Browser lanes are still running.
- `node .local/qualify-canvas-filters.mjs` creates a fresh isolated Vite consumer
  of the packed standalone/facade/table/inference public exports. Initial harness
  runs exposed 1 local-state-capture warning, then 1 incorrect filtered ARIA row
  count expectation (sheet indices/counts deliberately retain source numbering),
  then 1 incorrect sheet-row fixture index. These are probe defects; the probe
  now checks actual filtered row controls and controlled offscreen selection.
  Exact reruns retain strict types and all product assertions. Final exact rerun passes: strict types 0 errors/0 warnings, production build,
  real standalone-to-table filtering over 2,000 rows, offscreen select-all (111
  filtered rows), hidden-selection retention, edits removing an active row, focus
  recovery and dark-theme popover, with 0 runtime errors. No product changes
  were needed. Log: `/tmp/canvas-filters-isolated-consumer.log`. The probe and
  generated consumer will be retained in the main checkout ignored evidence folder.

## Archive and source audit

The source archive SHA-256 is
`0be58543a3748eec862a20e7eb8521c81a7535ae19b5b97b90c7f840c8684f9f`.
It contains 93 Canvas Table entries and 45 Filter Builder entries, with 0 leaked
story, test or example-source entries. The automated family size checks pass;
the largest family source is 240 lines and the review browser regression file
is 254 lines. All newly authored files remain within 300 physical lines.

## Preliminary combined-candidate completion

The full `TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks` command passed:
1,071 unit cases, 38 tooling cases, 1,022 Storybook interaction/accessibility
cases, 16 workspace browser cases, 17 shell cases, 3 AI cases, and 183 Shadcn
cases with 1 pre-existing skip. All functional failure counts are 0. The static
catalog and metadata audit pass. The user subsequently requested a PR and minor
release, explicitly including the two local default-workspace fixes. Final
qualification uses current remote main 30a5c883 plus this candidate and the
reviewed feature changes; this preliminary 0.7.3 result is retained separately.
