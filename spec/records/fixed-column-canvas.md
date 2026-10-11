# Fixed Column Canvas verification

Date: 2026-10-05. Requirement: DC-SHA-036. Revision: enclosing Jujutsu change
`mvvwvwon`. Source: Design Core 0.1.2; consumer source-validation refresh remains
separate from registry release acceptance.

The original panel uses logical CSS sticky positioning, including its collapsed
rail; no scrolling clone is mounted. A measured leading prefix computes full
fixed widths and legacy sticky rails, releasing trailing fixed pins when the
remaining scrolling minimums cannot fit. Wide allocation excludes pinned context
from the active pair. Compact disables pinning, and no controller state or V2
format changes. Existing spacing and gapless sticky-only rails are retained.

Evidence lives in ignored `.local/fixed-columns-evidence/`.

- The before test failed on absent fixed pinning after correcting an initial
  Svelte fixture import warning (`before.log`, `before-runtime.log`).
- Initial layout tests caught sticky selector specificity and internal padding
  offsets; the source fixes preserve the original column element.
- Native tests caught fixture direction/height setup and an incorrect adaptive
  gap expectation; those fixture errors were corrected, and RTL wheel routing
  now respects logical scroll direction.
- The initial type check caught use of `findLastIndex` beyond the configured
  library target; the implementation uses the supported array API.
- Initial governance caught an extra catalog surface and a non-atomic acceptance
  bullet; fixed scenarios now share the existing Column Canvas title.

Final verification results are recorded below. Full nonvisual
checks are required by the package guide because shared layout and navigation
feed existing canvases and direct consumers. No screenshot comparison, baseline
update, package publication, or stack backend integration is included.

## Focused results

- `pnpm test:unit src/shared/shadcn/column-canvas/*.spec.ts`: 32 passed,
  including seven measured-capacity cases (`canvas-unit.log`).
- `pnpm test:storybook src/shared/shadcn/column-canvas/*.stories.svelte`:
  20 passed (`canvas-stories.log`), including legacy sticky/ordinary canvases.
- `pnpm test:shadcn:pointer tests/shadcn/column-canvas-fixed.spec.ts
tests/shadcn/column-canvas-scroll.spec.ts`: 19 passed, first cold preview
  readiness timed out (`pointer-regression.log`); all 13 existing cases passed.
- `pnpm test:shadcn:pointer tests/shadcn/column-canvas-fixed.spec.ts`: seven
  passed after allowing 45 seconds for cold compilation (`pointer-final.log`),
  with the same geometry, focus, wheel and drag assertions; diagnostic evidence
  showed an unrendered document at the original 15-second deadline.
- `pnpm check`: specification and all four type-check surfaces pass with zero
  errors/warnings (`check-final.log`).
- `pnpm spec:first` and `pnpm spec:check`: pass (`spec-first.log`,
  `spec-check.log`).
- Initial `pnpm checks`: governance, units, formatting and types pass; the
  native-CSS checker misclassified the fixture's `fixed-demo` class prefix as
  a Tailwind utility (`checks.log`); renaming scoped classes resolves it.

The unchanged native thresholds remain within one CSS pixel for widths and
pinned offsets. Browser coverage includes independent pointer/keyboard resizing,
custom collapsed rails, mixed rails, narrow release/restoration, unchanged
durable layout, external Scroll Area, RTL wheel routing, vertical-wheel priority,
preview portal anchoring, close/reopen, compact/runtime transitions and teardown.

## Completed package qualification

The second `pnpm checks` run passed quality, governance, all 722 units and the
static catalog/audit, then failed one unchanged `FilterQueryAutocomplete` story
while 662 stories passed (`checks-final.log`). Its exact unchanged rerun,
`pnpm test:storybook src/shared/filter/search-filter-bar/SearchFilterBar.stories.svelte
-t FilterQueryAutocomplete`, passed (`filter-autocomplete-exact.log`).

The final unchanged `pnpm checks` passed (`checks-confirmed.log`):

- Formatting, four type-check surfaces, native-CSS policy and specification gates.
- 722 unit tests and three Turbo harness tests.
- Static Storybook build and workspace visual metadata audit.
- 663 catalog interaction/accessibility stories.
- 14 Workspace, 11 Shell, three AI and 48 shadcn native browser tests, with one
  existing platform-specific skip.

The final aggregate reused successful Turbo quality/governance/unit/static tasks
from the same source inputs and ran the catalog/browser acceptance; preceding
uncached logs retain those successful checks. No assertions were weakened or
unrelated product/test sources changed. Post-evidence formatting and
`pnpm spec:check` verify this final record without repeating unchanged runtime
suites. Screenshot comparisons, baseline changes, publication and backend
integration remain outside this slice.
