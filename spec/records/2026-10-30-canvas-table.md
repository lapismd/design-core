# Shared Canvas Table qualification

Started 2026-10-30; completed 2026-10-31 in the isolated `canvas-table` Jujutsu
workspace at `/Users/stevejuma/code/lapismd/design-core-canvas-table`, based on
Design Core main `43c4b5d6` (`vuntwzpr`).

## Ownership and contract

This is an additive Design Core family. The CSV sheet in lapis-plugins at
`26328af6` supplied the behavioral reference. Its working copy remains clean at
`97d3b32a`; no source, manifest, dependency or history changes were made there.
CSV parsing, file persistence, filtering, sorting mutations and undo history
remain host responsibilities. No push, publication or application adoption is
part of this work.

The public boundary is `@lapismd/design-core/shadcn/canvas-table`, with
`CanvasTable`, neutral row/command/props types and token names. Geometry, hit
testing, paint, text measurement, theme/lifecycle, navigation, pointer and
keyboard behavior, toolbar, menus and accessible row controls have separate
modules. A focused audit covers all 35 newly authored JS/TS/Svelte files,
including stories, fixtures, browser acceptance and the strict source consumer.
The largest is `canvas-table-paint.ts` at 233 physical lines; none exceeds 300.

Checkbox selection uses host row IDs independently of cell/range selection.
Header select-all covers all filtered data rows, retains hidden selections and
excludes the fixed first row. Numbering preserves underlying sheet positions.
Bulk actions are supplied through the host toolbar snippet.

## Tooling and process

Commands below use the installed Node 24.10.0 runtime:

```sh
export PATH=/Users/stevejuma/.nvm/versions/node/v24.10.0/bin:$PATH
```

- `pnpm view @lapismd/spec-validator version --json` was rechecked before final
  specification checks and returned `0.2.0`, already covered by the repository's
  Deno-free `^0.2.0` dependency.
- The inherited QMD native ABI mismatch under default Node 26 is resolved by
  using Node 24 without changing global configuration. `pnpm exec spec-validator
doctor --json` exits 0 with `ok: true`; QMD native modules and index open.
  `pnpm spec:search --semantic "canvas table shared data grid"` exits 0. The
  supported `rg` fallback was unnecessary for final discovery. Doctor retains
  the inherited script-alias warning because specification scripts intentionally
  prepend the icon audit.
- The ignored workspace configuration uses base port 9529. The requested
  review/shared-control catalog remains available on 9829. Validation-only
  servers on 9529, 9779 and the isolated consumer's 19429 were stopped after
  their lanes completed; other workspace listeners were preserved.
- All 14 new stories remain `visual-pending`. No screenshot comparison or
  baseline updates ran. Interaction, accessibility, keyboard, type and package
  checks remain enabled. Examples use public imports and the `tsx` grammar.

## Regression ledger

| Boundary                         | Before                                                            | After                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Geometry/selection units         | Missing implementation: 1 failed suite, 0 cases executed          | 8 passed, 0 failed                                                                                         |
| Family audit                     | 40 passed, 1 failed audit-path case                               | Final family total: 61 passed, 0 failed (8 geometry, 17 behavior, 36 governance)                           |
| Backwards/full-sheet selection   | 2 failed, 15 passed                                               | 17 behavior cases passed, 0 failed                                                                         |
| Type consumers                   | Initial 21 errors; in-flight rename check 45 errors and 1 warning | Package, shell, filter, strict source and packed consumers: 0 errors, 0 warnings                           |
| Storybook compilation            | 1 failed suite: invalid rune initializer                          | Fixed before story rerun                                                                                   |
| Storybook rendering              | 6 failed, 8 passed; 14 missing-template runtime errors            | 14 passed, 0 failed; 0 runtime errors                                                                      |
| Specification mappings           | 4 diagnostics                                                     | 313 requirements validate, 0 diagnostics                                                                   |
| Spec-first mappings              | 2 missing mapped chapters                                         | Passed: 40 protected files, 8 mapped chapters                                                              |
| Virtual checkbox focus           | 1 failed, 5 passed                                                | Exact regression 1 passed, then all 15 focused browser cases passed                                        |
| Sort-control positioning         | 2 failures: scroll error 33.21875px, resize error 55.140625px     | Source and packed consumer: 0 failures, 0px error for each operation                                       |
| Editing/focus boundary probe     | 3 failures                                                        | 0 failures; retained as permanent browser regressions                                                      |
| Cold server readiness            | Large-story and shell server startup timeouts before tests ran    | Explicit fresh-process compiler readiness followed by exact reruns passed; no timeout or assertion changes |
| Full shared-control browser lane | 166 passed, 2 story-readiness timeouts, 1 inherited skip          | Both exact tests pass unchanged; complete rerun: 168 passed, 0 failed, 1 inherited skip                    |

The review's sort delay came from assigning live coordinates to Button, whose
normal transition animates all properties. A private Canvas Table anchor now
owns coordinates and its Button fills the anchor. Button source and transitions
are unchanged. Permanent next-frame scrolling/resizing tests cover the repair.

The final boundary probe found a Wide-story fixture discarding edits beyond its
initial cells, a body editor covering the fixed header during vertical scroll,
and Tab reaching clipped overscan checkboxes. The fixture extends sparse rows,
the body editor uses a header-aware clip layer, and only visible checkbox
controls enter sequential focus. Focus returns to the grid when a focused row
control leaves the viewport. The exact three-case probe now passes.

## Focused commands

Run from the implementation workspace unless another directory is stated:

```sh
pnpm test:unit src/shared/shadcn/canvas-table
pnpm test:storybook src/shared/shadcn/canvas-table/CanvasTable.stories.svelte
pnpm test:shadcn:pointer tests/shadcn/canvas-table.spec.ts --grep 'selects offscreen'
pnpm test:shadcn:pointer tests/shadcn/canvas-table.spec.ts tests/shadcn/canvas-table-interactions.spec.ts
node .local/canvas-table-position-probe.mjs
node .local/canvas-table-boundary-probe.mjs
node .local/canvas-table-packed-position-probe.mjs
```

Results: 61 family units, 14 story interaction/accessibility cases, 1 exact cold
large-dataset case and 15 final browser cases pass, with 0 functional failures.
The ignored reproducible probes report 0 failures. Browser coverage includes
10,000-row selection beyond the viewport, bounded DOM, both scrolling axes,
real resizing/autofit, wrapping, menus, editing, focus, themes, independent
instances and teardown/remount. Story/unit coverage includes all four gutter
configurations, filtering, mixed/select-all state, reorder and empty data.

## Complete nonvisual qualification

```sh
pnpm spec:first
pnpm spec:check
TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks
```

The final `pnpm checks` exits 0. Formatting, native-CSS audit, governance,
package/shell/filter/strict-source type consumers, static catalog build and
visual metadata audit all pass. Test counts:

| Lane                                            | Passed | Failed | Skipped |
| ----------------------------------------------- | -----: | -----: | ------: |
| Unit tests (146 files)                          |    978 |      0 |       0 |
| Tooling tests                                   |      3 |      0 |       0 |
| Release-helper tests                            |     23 |      0 |       0 |
| Storybook interaction/accessibility (278 files) |    992 |      0 |       0 |
| Workspace browser                               |     16 |      0 |       0 |
| Shell browser                                   |     17 |      0 |       0 |
| AI browser                                      |      3 |      0 |       0 |
| Shared-control browser, Chromium and WebKit     |    168 |      0 |       1 |

Earlier aggregates were deliberately stopped when review and boundary fixes
required source changes. An earlier completed attempt stopped at the shell
server's 120-second startup limit before executing tests. Starting that fresh
server explicitly and waiting for compiler readiness resolved setup; its 17
tests pass. The next complete attempt reached all stages but reported two
15-second story-readiness timeouts before assertions. Exact unchanged reruns:

```sh
pnpm test:shadcn:pointer tests/shadcn/panel-toggle-integration.spec.ts --grep 'Workspace bottom control'
pnpm test:shadcn:pointer tests/shadcn/app-component-promotion.spec.ts --grep 'top bar follows main'
```

Each passes (1 passed, 0 failed). The complete aggregate rerun retains every
assertion, timeout and test; successful prior stages use normal Turbo caching.
Both stories also pass in the complete rerun. No product failure remains.
The inherited published Mira 0.1.2 circular-chunk warning remains in the
successful static build. No assertion, diagnostic or accessibility rule was
weakened to obtain qualification.

Final evidence-only edits run Prettier plus `pnpm spec:first` and
`pnpm spec:check`; no runtime source changed after complete qualification.

## Packed public-export consumer

```sh
pnpm package:local
```

Archive: `.local/packages/lapismd-design-core-0.7.1-built.tgz`.

SHA-256: `d28a90b9a8d9486f397d049898d935c0973fe847fe80e2d15bfde199290f4608`.

The archive contains 51 Canvas Table entries, with 0 leaked story, example-source
or test files. Browser CSS preparation compiled 3 files, audited 273 and left
0 utility references. The minor Changeset records the future release; no
version bump or publication occurred.

An isolated Vite consumer at
`/var/folders/_3/k1jv9rtn47s_0k5bm6qn_lk80000gn/T/design-core-canvas-table-consumer-l1igiaa2`
installs the archive through a uniquely named local copy to avoid tarball
cache reuse. That temporary manifest is validation-only. From that directory:

```sh
pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings
pnpm exec vite build
pnpm exec vite preview --host 127.0.0.1 --port 19429
node smoke.mjs
```

Strict types: 0 errors, 0 warnings. Production build passes. The production
browser smoke verifies the public export, native CSS, checkbox Space operation,
controlled/mixed selection, editing and stable selection with 0 runtime errors.
The packed positioning probe reports scroll and resize errors of 0px.
Initial temporary-harness setup needed a Svelte config; preview smoke attempts
before the listener was ready returned connection refused. After config and
HTTP readiness, the exact commands pass without changing package behavior.

Raw local logs are retained under `/tmp/canvas-table-*`, including
`checks-result.log` (the two readiness failures), `checks-passed.log` (successful
complete rerun), `pointer-final-boundaries.log`, `package-qualified.log` and
`consumer-qualified-{types,build,smoke,position}.log`.
