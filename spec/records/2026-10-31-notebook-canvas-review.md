# Notebook canvas-table migration progress

## Delivery state

- Specified: complete contract written before runtime changes.
- Implemented: generic composition candidate plus the ScrollArea feedback slice;
  the overall migration remains in progress.
- Focused-tested: source families and consumer review as recorded below;
  full qualification is not claimed.
- UI-approved: pending.
- Fully-qualified: deferred until UI approval.

## Source and ownership

Isolated workspaces: design-core-notebook-tables, lapis-plugin-notebook-canvas-tables,
lapis-notes-notebook-canvas-host and lapis-plugins-notebook-canvas-compat.
Bases: Design Core f16631c7; Notebook 04c858d7; Notes 6ffa9caf; Plugins be302f37.
Existing workspaces and Storybook 10329 are preserved. No push/merge/publication.

## Implementation slices

1. Specification and exact-command evidence, committed before runtime.
2. Generic column snippets, measured details, density/chrome and selection scope;
   custom operator validation; focused shared regression checks.
3. Notebook typed adapter/evaluator, result/dataframe/input/preview integration,
   focused stories, public types and lifecycle checks.
4. Host explicit module exposure and minimal package compatibility preparation.
5. Docker review server with verified archived dependencies; integrated UI review.
6. Only after approval: full shared/host/package qualification, authorized releases,
   registry refresh and final Notebook Docker validation:all and packed host intake.

## Verification matrix

| Boundary           | Before UI approval                                                       | After UI approval                                 |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------- |
| Geometry/selection | Exact units, scrolled/resized overlays, scoped select-all                | Full Design Core checks                           |
| Rich content       | Headers, histograms, custom cells, measured details, a11y                | Full interaction/accessibility and static catalog |
| Typed filters      | Null/blank, regex/errors, range, dates, precise numbers, nested groups   | Full units and package consumers                  |
| Inputs             | Values/defaults/required/disabled, no sort/filter input, repeated embeds | Full Notebook validation:all                      |
| Lifecycle          | Fresh Docker browser, focus, portal, teardown, large bounded dataset     | Cold packed plugin in supported hosts             |
| Public contracts   | Strict focused types, exports, size/native-CSS audits                    | Packed-consumer and release checks                |
| Governance         | spec:first/spec:check, formatter, doctor/search                          | Complete evidence and release disposition         |

## Commands and observations

- `jj git fetch --remote codex-https --branch main`: four owners succeeded.
- `pnpm view @lapismd/spec-validator version --json`: latest Deno-free 0.2.0.
- Initial searches under unintended Node 26 ABI 147: QMD native mismatch;
  supported fallback is rg. Repeat doctor/search under explicit Node 24 PATH.
- Notebook `pnpm install --frozen-lockfile`: one configuration failure because
  the local hook checksum was active. `pnpm install --frozen-lockfile --ignore-pnpmfile`
  succeeds with registry resolution; no tracked lock mutation.
- Runtime counts were pending at initial specification time; executed feedback
  evidence follows below, without screenshot comparisons or baseline updates.

## Resume

Read the owning canonical requirements and this record, inspect each workspace
with jj st, run focused exact targets and append their failure counts. Archive
provenance and actual installed lock belong to the Docker receipt. Do not run
broad suites, static catalog or publication until the user approves both UIs.
After approval run Design Core spec:first/spec:check/checks and packed acceptance;
complete affected host/package lanes; obtain release authorization; consume
published registry versions; run Notebook validation:all and real plugin loading.

Focused baseline: `pnpm test:unit src/shared/shadcn/canvas-table src/shared/shadcn/filter-builder`: 151 passed, 0 failed. Spec authoring initially reported 5 findings, then 3 unmapped verification rows; corrected the table structure before committing. Node 24 doctor/search pass, so no global QMD repair is needed.

## UI feedback: shared ScrollArea viewport (31 October)

Implemented and focused-tested; UI approval and full qualification remain pending.
CanvasTable now composes the public ScrollArea in both axes, with its accessible
grid semantics and event handlers on the actual bound viewport. The additive
typed `ScrollAreaViewportProps`/`viewportProps` contract supports the styled and
native paths without permitting callers to replace locked component/part identity.
No second scroll wrapper, consumer CSS repair, dependency patch or publication was
introduced. The ScrollArea root fills the existing table body; viewport overflow
anchoring is disabled, and public scrollbar classes keep its thumbs above paint.

This slice is isolated above the preserved composition change `pmluukpl`.
New standalone viewport stories and strict public consumer demonstrate attributes
and handlers; new browser checks drag the real scrollbar, scroll both axes, assert
header/cell alignment, operate the grid keyboard, bound rendering, and dispose it.
Native-strategy tests run in Chromium; platform-native qualification remains deferred.
All new handwritten files have focused automated 300-line coverage.

Exact commands/results under the explicit Node 24 PATH:

- `pnpm ui components scroll-area`, `pnpm spec:search "ScrollArea"`,
  `pnpm spec:search "CanvasTable"`, `pnpm spec:search "source consumer"`:
  local public contracts and QMD canonical search succeeded.
- `pnpm view @lapismd/spec-validator version`: latest 0.2.0, already installed;
  `pnpm exec spec-validator doctor`: 10 passed, 1 alias warning, 0 failures.
- `pnpm test:shadcn:pointer canvas-table-scrollarea`: initial implementation had
  2 failures from the Svelte state/store naming conflict; the next run had 1 pass
  and 1 failure because the native test marker was set before documentElement
  existed; the corrected fixture exposed a zero-height styled root (1 fail/1 pass).
  The product root sizing and native setup timing were fixed without weakening
  viewport, thumb-drag, geometry, keyboard or teardown assertions.
- `pnpm check:source-consumer`: in-progress runs reported 4 errors/2 warnings,
  then 4 errors/0 warnings; native attribute/Bits type compatibility, state naming
  and import paths were corrected; final strict run 0 errors/0 warnings.
- `pnpm test:storybook src/shared/shadcn/canvas-table src/shared/shadcn/scroll-area`:
  initially 2 failed/31 passed (StableSelection, RichDataTable) due to root sizing;
  exact `pnpm test:storybook src/shared/shadcn/canvas-table -t 'RichDataTable|StableSelection' --reporter=json --outputFile=.local/table-scroll-stories.json`:
  after root sizing, 2 passed/0 failed; assertions unchanged.
  Full affected-family rerun with `--reporter=json --outputFile=.local/table-scroll-family.json`:
  33 passed/0 failed, including both new viewport stories and existing a11y checks.
- `pnpm test:shadcn:pointer canvas-table`: first combined run 29 passed/1 timed
  out in re-detection after navigation; exact
  `pnpm test:shadcn:pointer canvas-table-filter-types -g 'keeps detected modes'`:
  1 passed/0 failed without source or assertion changes; final cold rerun of
  `pnpm test:shadcn:pointer canvas-table`: 30 passed/0 failed.
- `pnpm test:unit src/shared/shadcn/canvas-table src/shared/shadcn/scroll-area`:
  132 passed/0 failed; after extending line audits to all new viewport files,
  final count 136 passed/0 failed.
- `pnpm spec:check`: initial authoring 1 atomic-bullet finding, then 3 missing
  mapped canonical chapters; corrected the mapped requirement notes and reran the
  exact command: all 3 specification lanes passed, icons audit passed.
- `pnpm exec prettier --check src/shared/shadcn/canvas-table/canvas-table.svelte src/shared/shadcn/canvas-table/canvas-table.css src/shared/shadcn/canvas-table/canvas-table-governance.spec.ts src/shared/shadcn/scroll-area/scroll-area.svelte src/shared/shadcn/scroll-area/index.ts src/shared/shadcn/scroll-area/scroll-area-viewport-props.ts src/shared/shadcn/scroll-area/ScrollAreaViewport.fixture.svelte src/shared/shadcn/scroll-area/ScrollAreaViewport.stories.svelte tests/shadcn/canvas-table-scrollarea.spec.ts tests/source/scroll-area-viewport-consumer.svelte tsconfig.source-consumer.json`:
  all matched files passed; the final audit addition was formatted before its rerun.
- `pnpm package:local`: review archive prepared successfully, version 0.8.0,
  SHA256 `a54f27c6f604910e9a003638f409b286733576bc23dd5823754fc0bc6359d354`;
  archive preparation does not qualify packing/release lanes.

The isolated Notebook worker verified this archive and passed all 11 focused
table/input/WorkspaceShell stories; see its owning evidence record for exact
Docker commands. Reviews remain on 10429 (shared) and 10529 (Notebook); 10329 was
preserved. Keep new stories visual-pending, and resume the remaining migration
qualification only within the existing UI-approval gate; no push, merge or publish.

## UI feedback: Lucide fixtures and rapid horizontal scrolling (31 October)

Implemented and focused-tested; UI approval and full qualification remain pending.
The common composable-table fixture now uses decorative Lucide right/down chevrons
and matching Expand/Collapse names in all four stories. Rich rows/headers previously
depended on scroll-handler state to clip their left edge; compositor scrolling
could advance before that state updated and briefly paint text over the gutter.
A bounded decorative canvas copies the existing gutter bitmap into a fixed layer
above rich content, below row controls and scrollbars. It shares geometry, theme,
selection and DPR paint; it adds no focus target or second accessible grid.

The browser regression deliberately suppresses scroll handlers while sweeping
horizontal offsets in both directions, checking fixed bounds, opaque backing paint,
stacking and stale scroll-state invariance without screenshot comparison. New
helper/test files are 29/53 physical lines, included in the focused 300-line audit.

- `pnpm spec:search "fixed gutter"`: QMD returned the owning CanvasTable contract.
  `pnpm view @lapismd/spec-validator version`: latest 0.2.0, already installed.
  `pnpm exec spec-validator doctor`: 10 passed, 1 script-alias warning, 0 failures.
- `pnpm test:shadcn:pointer canvas-table-gutter`: baseline 1 failed (missing fixed
  plane), exact post-fix rerun 1 passed/0 failed with the delayed-handler assertions.
- `pnpm test:storybook src/shared/shadcn/canvas-table/CanvasTableComposition.stories.svelte --reporter=json --outputFile=.local/lucide-stories.json`:
  baseline 1 failed/3 passed (missing disclosure SVG), exact rerun 4 passed/0 failed.
- `pnpm test:unit src/shared/shadcn/canvas-table`: 134 passed/0 failed, including
  the maintained-source and new test size guards.
- `pnpm check:source-consumer`: 0 errors/0 warnings.
- `pnpm test:storybook src/shared/shadcn/canvas-table --reporter=json --outputFile=.local/gutter-family.json`:
  all 24 affected stories passed, 0 failed; existing a11y checks retained.
- `pnpm test:shadcn:pointer canvas-table`: fresh Storybook, all 31 browser tests
  passed/0 failed, including both ScrollArea strategies, resize/edit alignment,
  selection, wrapping, filter focus, independent instances and teardown.
- `pnpm spec:check`: all 3 specification lanes passed; icons audit passed.
- `pnpm exec prettier --check src/shared/shadcn/canvas-table/CanvasTableComposition.stories.fixture.svelte src/shared/shadcn/canvas-table/CanvasTableComposition.stories.svelte src/shared/shadcn/canvas-table/canvas-table-paint-gutter.ts src/shared/shadcn/canvas-table/canvas-table-paint.ts src/shared/shadcn/canvas-table/canvas-table.svelte src/shared/shadcn/canvas-table/canvas-table.css src/shared/shadcn/canvas-table/canvas-table-context.ts src/shared/shadcn/canvas-table/canvas-table-state.svelte.ts src/shared/shadcn/canvas-table/canvas-table-behavior.spec.ts src/shared/shadcn/canvas-table/canvas-table-governance.spec.ts tests/shadcn/canvas-table-gutter.spec.ts`:
  all matched files passed.

The shared review on 10429 hot-reloads these changes; 10329 stays untouched.
Notebook archive refresh and acceptance are recorded in its owning progress file.
No broad qualification, visual baseline mutation or upstream delivery is authorized
by this feedback; the full migration's existing UI approval gate remains active.

## UI feedback: compact disclosure and stable, useful row details (31 October)

Implemented and focused-tested; UI approval and full qualification remain pending.
Use Button's existing 24px `icon-xs` variant for row disclosure. Replace the
placeholder detail with an account-review example containing an owner, renewal
value, review date, reference, summary and activity, plus an accessible compact
close control. Rich details default to UI sans typography; cell text keeps the
sheet typography contract.

Previously the detail's absolute left position included reactive scrollLeft,
which raced native scrolling and shifted the panel until the handler ran.
A full-row track now carries a horizontally sticky detail cell, retaining the
existing measured height, viewport width, vertical clipping and focus recovery.
Horizontal anchoring is compositor-owned rather than a per-scroll JS rewrite.

- `pnpm test:shadcn:pointer canvas-table-details`: baseline 2 failed/0 passed
  (36px disclosure instead of <=24.5px, and a 100px detail position error with
  scroll handlers delayed); exact post-fix command: 2 passed/0 failed.
  Tests also verify meaningful record fields, sans font, stable panel identity,
  height and native vertical movement during the horizontal sweeps.
- `pnpm test:unit src/shared/shadcn/canvas-table`: 136 passed/0 failed, including
  the new fixture/test source-size guards (116/79 physical lines).
- `pnpm check:source-consumer`: 0 errors/0 warnings.
- `pnpm test:storybook src/shared/shadcn/canvas-table --reporter=json --outputFile=.local/detail-family.json`:
  24 passed/0 failed, with interaction and accessibility checks retained.
- `pnpm test:shadcn:pointer canvas-table`: a fresh Storybook process completed
  all 33 browser tests, 0 failed, including prior gutter, both-axis alignment,
  resize/edit, filter, checkbox/radio, detail measurement/focus and teardown cases.
- `pnpm spec:check`: icons audit and all 3 specification lanes passed.
- `pnpm exec prettier --check src/shared/shadcn/canvas-table/CanvasTableRecordDetails.stories.fixture.svelte src/shared/shadcn/canvas-table/CanvasTableComposition.stories.fixture.svelte src/shared/shadcn/canvas-table/canvas-table-row-details.svelte src/shared/shadcn/canvas-table/canvas-table.css src/shared/shadcn/canvas-table/canvas-table-governance.spec.ts tests/shadcn/canvas-table-details.spec.ts`:
  all 6 files passed.

The shared large-rich-table review is open on 10429 with the richer example.
The combined isolated Notebook archive refresh follows in its owning record;
the intermediate gutter archive was prepared but intentionally not installed
while this additional UI feedback was being incorporated. Existing full-suite,
publication and visual-baseline gates remain in force.

`pnpm package:local` prepared the combined review archive successfully at version
0.8.0, SHA256 `ea3afda3a06d35e527e71ab3382f0040ca45de4cf2f746e798d2480f9816fcff`;
this is temporary isolated review intake, not release/package qualification.

## Review feedback: nested indicators and host display controls

Specified, implemented and focused-tested. UI-approved: pending. Fully-qualified:
deferred. Command now colours only its direct icon children, so a composed
Checkbox retains its own foreground. CanvasTable now offers optional controlled
`wrapText` / `columnColours` and matching callbacks; rich cells inherit presentation
and wrapping uses the same bounded row geometry. Read-only controlled toolbar
actions are disabled. New stories remain visual-pending.

All commands use Node 24.10.0 on PATH. Latest registry spec-validator: 0.2.0.
Doctor: 10 passed, 1 alias warning; QMD search `checkbox` succeeded without fallback.

- `pnpm test:storybook src/shared/shadcn/command/Command.stories.svelte -t NestedCheckboxColours`: before 1 failed/2 skipped (muted tick vs checkbox foreground); after selector fix 1 failed (incorrect test Space key token), then 1 failed (2 ARIA findings in new fixture). Corrected keyboard input and used the public Group child snippet with rowgroup semantics; exact rerun 1 passed/0 failed/2 skipped.
- `pnpm test:storybook src/shared/shadcn/command src/shared/shadcn/checkbox`: initial new regression 1 failed/14 passed; final 15 passed/0 failed.
- `pnpm test:unit src/shared/shadcn/canvas-table/canvas-table-display.spec.ts`: before 1 failed/1 passed; after 2 passed/0 failed.
- `pnpm test:storybook src/shared/shadcn/canvas-table/CanvasTableComposition.stories.svelte -t ControlledDisplay`: 1 passed/0 failed/4 skipped.
- `pnpm test:unit src/shared/shadcn/canvas-table`: 139 passed/0 failed, including family file-size audit.
- `pnpm test:storybook src/shared/shadcn/canvas-table src/shared/shadcn/command src/shared/shadcn/checkbox`: cold focused run, 40 passed/0 failed with accessibility retained.
- `pnpm check:source-consumer`: 0 errors/0 warnings.
- `pnpm spec:check`: initial 1 acceptance-count finding, then 1 acceptance-form finding, then 1 mapped-chapter finding; final all 3 lanes passed, plus icons audit. No requirements or test assertions were waived.
- `pnpm exec prettier --write` on changed Svelte/TS source completed; focused check follows below.

Temporary review archive preparation is `pnpm package:local`; this is isolated
review intake only, not packed-consumer or release qualification. Notebook must
refresh its checksum record and fresh Docker worker before consumer acceptance.
No full suites, baselines, push, merge or publication.
