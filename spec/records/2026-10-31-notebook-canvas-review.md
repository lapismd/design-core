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
