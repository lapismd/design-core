# Notebook canvas-table migration progress

## Delivery state

- Specified: complete contract written before runtime changes.
- Implemented: generic composition candidate plus the ScrollArea feedback slice;
  the overall migration remains in progress.
- Focused-tested: source families and consumer review as recorded below;
  full qualification is not claimed.
- UI-approved: approved by the user on 31 October 2026.
- Fully-qualified: in progress; full lanes authorized after UI approval.

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

## Review follow-up: custom header tints

Specified and implemented; UI-approved and fully-qualified remain pending. Rich
column headers now receive the column text colour and the same eight-percent
background tint as fixed sheet headers. No Notebook-specific styling is in the
shared owner. The existing controlled-display Changeset includes this behavior.

- `pnpm test:storybook src/shared/shadcn/canvas-table/CanvasTableComposition.stories.svelte -t ControlledDisplay`: new header assertion before fix 1 failed/4 skipped; exact rerun after background fix 1 passed/4 skipped; final text-colour assertion rerun also 1 passed/4 skipped.
- `pnpm test:storybook src/shared/shadcn/canvas-table`: 25 passed/0 failed after tint fix, accessibility retained.
- `pnpm check:source-consumer`: 0 errors/0 warnings.
- `pnpm spec:check`: 3 lanes passed plus icon audit.
- `pnpm package:local`: succeeded; final archive SHA256 `302c454246d97b355b8f2556eab7af9d797de4b18f78fa1f85437d5b160f207b`. Preparation is temporary Docker review intake, not release qualification.

Focused pointer check and Notebook consumer results follow in their owning records.
Full qualification, publication, push and merge remain deferred.

- `pnpm test:shadcn:pointer canvas-table`: cold focused run, 33 passed/0 failed, covering scrolling, resizing, wrapped/filter interactions, focus and teardown.
- Final `pnpm spec:check`: all 3 lanes passed plus icon audit.
- Final rich-grid/story formatting passed. Notebook's final review archive supersedes the intermediate `a2f26500…` archive.

## UI approved — full qualification resumed (31 October 2026)

The user approved the integrated UI and requested the remaining plan work. Full
qualification, remaining migration cleanup and release preparation are authorized.
Keep stories visual-pending; no screenshot comparisons or baseline updates.
Publication, pushing and merging still require separate authorization. Historical
UI-pending statements above describe their original checkpoints. The current
fully-qualified state remains incomplete until all required evidence passes.

## Post-approval qualification and rich-selection regression

Node 24; latest Deno-free spec-validator 0.2.0. Doctor/search receipts remain
under `.local/qualification/doctor.log` and `search.log`; QMD worked under Node 24.

- `pnpm spec:first --base f16631c7 --head @`: passed, 45 protected files/10 chapters.
- `pnpm spec:check`: passed before the selection follow-up.
- First `pnpm checks`: 1 formatter finding in verification.md; exact
  `pnpm exec prettier --check spec/src/verification.md` failed once, then passed.
- Next root type check: 2 errors (detailHeights fixture and unsupported story
  query option); exact `pnpm exec svelte-check --tsconfig ./tsconfig.json
--fail-on-warnings` then passed with 0 errors/0 warnings. Exact behavior tests
  passed 17/0; OptionalSingleSelection passed 1/0 (4 unselected stories).
- Spec-first initially reported 2 missing mapped chapters; corresponding
  qualification contracts were added. `checks-after-governance.log` retains
  the full run, including 1,103 units, 1,030 interaction/axe stories and static
  Storybook success. Workspace (16), shell (17) and AI (3) browser lanes passed.
  Shadcn remains in progress; an unchanged Column Canvas manual-scroll target
  failed once and its exact fresh-process reproduction is retained separately.
- `pnpm packages:pack` passed clean public types, cold development/production
  consumers and production audit (0 findings) before the selection follow-up.
- User reported selected rich-row scrolling flicker. Native rich content moved
  before the canvas selection repainted. The fix keeps rich-cell fill, grid
  borders and row/range/active/search paint in the native content coordinates.
  Canvas-only sheets retain their painter. No new public props or tokens.
- An initial `pnpm test:shadcn:pointer -- tests/shadcn/canvas-table-rich-selection.spec.ts`
  forwarded `--` as an end-of-options separator and selected the full suite;
  it was stopped, not counted as a pass. Exact before command:
  `SHADCN_STORYBOOK_PORT=11029 node scripts/with-storybook-env.mjs pnpm exec
playwright test -c playwright.shadcn.config.ts
tests/shadcn/canvas-table-rich-selection.spec.ts`: 2 failed. Same target
  after the source fix with `--output=.local/qualification/rich-selection-results`:
  2 passed/0 failed from a fresh process, including delayed scroll events.
- `pnpm exec vitest run --project unit src/shared/shadcn/canvas-table`:
  141 passed/0 failed after the fix, including the focused 300-line guard.

Final type/spec/full checks and refreshed packed-consumer evidence are pending.
The Changesets status CLI cannot read Git HEAD in this non-colocated JJ checkout
(with either explicit base or default main); this is an invocation limitation,
not release qualification. Keep minor Changesets and prepare from the JJ tree.
No push, merge, publication, screenshot comparisons or baseline updates.

The first full native run completed with 3 Shadcn failures, 190 passed and
1 platform-specific skip: Column Canvas manual-scroll width preservation,
Column Canvas fixed rail scroll preservation, and Comment Composer readiness.
The Comment Composer exact fresh target passed (1/0). The first Column Canvas
focused rerun stopped during readiness/reload (ERR_ABORTED), before its product
assertion; it is not a pass. No Column Canvas source or tests differ from the
fetched-main base. Re-run both exact targets against stable source before the
final full lane; do not waive their assertions.

Rich selection strict typing initially found 1 unreachable optional-chain error
in the canvas-only paint branch; removing the obsolete guard gave 0 errors/0
warnings. Specification validation and the refreshed packed-consumer lane passed
(0 audit findings), including cold development/production lifecycle coverage.
The actual Notebook LargeTypedResults regression passed against that verified
archive (1/0, 6 unselected stories). Full qualification remains incomplete.

## Read-only row navigation and final source qualification

Read-only means `onCellChange` is omitted. Data-cell clicks now select rows;
editable tables retain cell/range selection. Plain click replaces selection,
Ctrl/Meta-click toggles rows and Shift-click selects the displayed-order range.
Single, required and disabled modes remain authoritative. Without checkbox
controls the table owns stable row IDs locally. Keyboard navigation selects rows;
Ctrl/Meta+A covers the filtered selection scope while preserving hidden IDs.
Rich cells resolve their owned DOM row identity for coordinate-free pointer
input, and interactive descendants retain their own actions. Repeated unchanged
ID sets emit no selection callback. Selected rich-cell paint now scrolls in the
same native coordinates as its content, removing the asynchronous canvas flash.

- Focused read-only baseline: 3 unit failures; final complete canvas family
  `pnpm exec vitest run --project unit src/shared/shadcn/canvas-table`:
  155 passed/0 failed, including the physical-line guard.
- Focused read-only browser baseline: 2 failures; final exact read-only plus
  ScrollArea targets: 5 passed/0 failed (`readonly-target-after.log`).
- Complete final browser lane includes 38 CanvasTable cases, all passing.
- `pnpm packages:pack`: strict public types and cold development/production
  runtime checks passed; production audit 0 findings. Receipt
  `packed-consumer-final.log`; verified archive SHA256
  `0f576a6684698a4dbb41684d53aa1583f0e01b57b1c84cfc4c5b2c69554199c8`.
- First final `pnpm checks`: 2 AI story readiness failures/1 passed, after
  1,118 unit tests, 1,031 interaction/axe stories, static Storybook, 16 workspace
  and 17 shell browser tests passed. Exact fresh
  `pnpm test:ai-chat-browser tests/ai-chat/ai-chat-interactions.spec.ts
tests/ai-chat/reasoning-motion.spec.ts`: 3 passed/0 failed. No AI source or
  assertions changed.
- Exact `pnpm checks` rerun (`checks-final-retry.log`) passed every required
  lane: 1,118 units; 1,031 interaction/accessibility stories; static Storybook;
  16 workspace, 17 shell, 3 AI and 196 Shadcn browser tests. One existing
  platform-specific WebKit case is governed as skipped. No new skips or waived
  failures. Governance/spec-first/type/format checks passed.

States: specified yes; implemented yes; focused-tested yes; migration UI-approved
by the user; complete source qualification yes. Final Notebook and released
registry-cohort acceptance remain separately owned gates. Minor Changesets are
retained. No push, merge, publication, screenshot comparison or baseline update.
