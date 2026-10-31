# Structured filters progress and resume record

## Initial authorization and workspace (historical)

The user approved a specification-first, UI-first implementation on 2026-10-31.
Full checks, repository-wide tests, static Storybook, package/release qualification
and isolated packed consumers are deferred until explicit UI approval. This is
an explicit task-specific exception to the normal AGENTS full-check-before-commit
rule. Push and release were subsequently authorized; the current state below and
2026-10-31-canvas-filters-release.md supersede these initial limits. Plugin
changes and visual baselines remain excluded.

Workspace: /Users/stevejuma/code/lapismd/design-core-structured-filters.
Parents: current main 8e9b3f29 plus Canvas Table 50c94a6b. Original Canvas Table
workspace and review port 9829 remain untouched. New ignored base port: 10029;
focused Shadcn review port: 10329.

## State

| Stage           | Status                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Specified       | Complete; DC-SHA-069–074 and full public contract in shadcn/structured-filters.md                                  |
| Implemented     | Complete UI implementation                                                                                         |
| Focused-tested  | Complete; final scoped commands pass                                                                               |
| UI-approved     | User authorized full qualification and PR on 2026-10-31                                                            |
| Fully-qualified | Complete on combined source 892ca102; full local checks, all 11 GitHub checks, packages and isolated consumer pass |

## Tooling evidence

- pnpm install --frozen-lockfile: passed using Node 24.10.0.
- pnpm view @lapismd/spec-validator version --json: 0.2.0, already covered by ^0.2.0.
- pnpm exec spec-validator doctor --json: exits 0; QMD native/index checks pass under Node 24; inherited script-alias warning remains.
- Semantic search command: pnpm spec:search --semantic "standalone structured filter builder table column inference"; passed with matching canonical chapters; no fallback required.
- Existing default Node 26 QMD ABI mismatch is avoided through a command-local Node 24 PATH; use the reported rg fallback if native search fails.

## Resume instructions and verification

Read AGENTS.md and canonical shadcn/structured-filters.md before continuing.
Commit the validated complete specification before changing runtime. Implement
standalone model/editor first, then typed table inference/matching and popover,
then stories and focused regressions. Keep every new JS/TS/Svelte file <=300
physical lines. Record every exact failing command/count and exact passing rerun.

Before UI approval run only focused new-family units, relevant stories and browser
files, strict source-consumer types, formatter and spec:first/spec:check. Start
a fresh review Storybook on 10329. Present standalone and integrated stories and
wait for UI approval. Do not automatically continue to full qualification.

After approval run the full matrix in the canonical chapter, including pnpm
checks and isolated packed public exports. Keep all changed stories visual-pending
and never update screenshots/baselines. Mark fully qualified only after those
lanes pass. Commit verified slices locally with Jujutsu.

## Specification slice checks

- pnpm spec:first: passed (78 protected files, 21 chapters).
- pnpm spec:check: initial 8 diagnostics (6 verification rows outside the table and 2 trailing prose blocks in acceptance sections); corrected table placement and added section headings; first rerun retained 6 unmapped rows; corrected zero-padded row lookup and used the supported In progress status; final exact rerun passed with 0 diagnostics, all 3 specification lanes.
- Focused Prettier command covers all changed canonical chapters, mirror, mapping and preview order; full product runs deferred by user instruction.

## UI iteration ledger

- Complete specification committed before runtime: 565b1ba2 (merge parents include main and Canvas Table).
- pnpm test:unit src/shared/shadcn/filter-builder/filter-builder-model.spec.ts src/shared/shadcn/canvas-table/canvas-table-filter-inference.spec.ts: 2 missing-module failed suites, 0 executed cases before implementation; same command then 39 passed.
- pnpm test:unit src/shared/shadcn/filter-builder/filter-builder-model.spec.ts src/shared/shadcn/canvas-table/canvas-table-filter-inference.spec.ts src/shared/shadcn/canvas-table/canvas-table-filter-match.spec.ts: 1 failed/56 passed (empty nested Any/None group), then 57 passed after normalization.
- pnpm exec svelte-check --tsconfig .local/structured-filters-tsconfig.json --fail-on-warnings: initial public consumer 0 errors/0 warnings; adding stories exposed 5 getByLabel versus Testing Library getByLabelText errors, then 0 errors/0 warnings after exact rerun. The strict consumer also protects the existing FilterType enum export.
- node .local/structured-filters-ui-probe.mjs: cold standalone and integrated table pages load, 0 runtime errors; screenshots inspected locally without comparison or baseline writes.
- VITEST_MAX_WORKERS=2 pnpm test:storybook src/shared/shadcn/filter-builder/FilterBuilder.stories.svelte src/shared/shadcn/canvas-table/CanvasTableFilters.stories.svelte src/shared/shadcn/canvas-table/CanvasTable.stories.svelte: 26 passed/1 failed (ambiguous fixture status query). Added a named draft-status region; exact InvalidDrafts target passes (1 passed, 6 excluded by name filter).
- pnpm test:shadcn:pointer tests/shadcn/filter-builder.spec.ts tests/shadcn/canvas-table-filter.spec.ts: initial 1 passed/1 failed/1 interrupted/8 not run; field search target corrected to its actual named combobox. Exact detects typed editors target passes. Second run 10 passed/1 failed: test selected the nested Add filter instead of the root action; scoped the intended root action and exact initial-row target passes. No product assertion or timeout was weakened.
- pnpm test:shadcn:pointer tests/shadcn/canvas-table-filter-types.spec.ts: 2 passed, proving cached modes after source edits, explicit re-detection, preserved manual overrides and independent tables in dark mode.

Final focused combined results and review links are recorded below. Full pnpm checks, broad suites, static Storybook, package/release checks and packed consumers have not run.

## Final focused UI handoff

UI review pending; full qualification deferred. No user UI approval has been
recorded. Do not run the deferred lanes merely because focused checks pass.

| Exact command                                                                                                                                                                                                                         | Final result                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| pnpm test:unit src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table                                                                                                                                                        | 151 passed across 7 files; 0 failed                                                                  |
| pnpm exec svelte-check --tsconfig .local/structured-filters-tsconfig.json --fail-on-warnings                                                                                                                                          | 0 errors, 0 warnings; standalone, table, examples and fixtures                                       |
| VITEST_MAX_WORKERS=2 pnpm test:storybook src/shared/shadcn/filter-builder/FilterBuilder.stories.svelte src/shared/shadcn/canvas-table/CanvasTableFilters.stories.svelte src/shared/shadcn/canvas-table/CanvasTable.stories.svelte     | 27 passed across 3 story files; 0 failed; interaction, accessibility and runtime guards retained     |
| pnpm test:shadcn:pointer tests/shadcn/filter-builder.spec.ts tests/shadcn/canvas-table-filter.spec.ts tests/shadcn/canvas-table-filter-types.spec.ts tests/shadcn/canvas-table.spec.ts tests/shadcn/canvas-table-interactions.spec.ts | 30 passed; 0 failed; includes original next-frame sort alignment and review border/width regressions |
| pnpm spec:first                                                                                                                                                                                                                       | Passed: 46 protected files, 9 canonical chapters after final evidence update                         |
| pnpm spec:check                                                                                                                                                                                                                       | All 3 specification lanes passed; 0 diagnostics                                                      |
| pnpm exec tsx scripts/check-no-tailwind-utilities.ts src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table                                                                                                                  | Passed: 0 utility references                                                                         |

Focused Prettier covers every changed file. The source-length audit covers the
whole new builder, Canvas Table family, new browser files and strict consumer.
Largest newly authored JS/TS/Svelte file after review regressions: 254 physical lines. The existing modified
table story fixture is 240 lines. No new source file exceeds 300.

The final accessibility pass associates invalid multi-value, boolean and option
controls with their errors. Its narrow source check initially found 2 missing
prop destructures, then the exact command passed with 0 errors/0 warnings. The
exact edits-multiple-literal-values browser target passes with an added assertion
that removing all values marks the input invalid and correction clears it.
The complete 28-case browser command then passes without weakening assertions.
No runtime source changed after final focused story/browser qualification.

Review server (leave running): http://127.0.0.1:10329/

- Table: /?path=/story/shadcn-data-display-canvas-table--detected-column-types
- Standalone nested builder: /?path=/story/shadcn-forms-filter-builder--nested-groups
- Explicit types: /?path=/story/shadcn-data-display-canvas-table--explicit-filter-types
- Large dataset: /?path=/story/shadcn-data-display-canvas-table--large-filtered-dataset

The server was started cold with the repository script:

```sh
STORYBOOK_PORT=10329 VISUAL_SERVER_PORT=10330 STORYBOOK_EXTRA_PORTS='10330 10419' pnpm storybook:ui
```

The strict focused configuration is ignored at .local/structured-filters-tsconfig.json.
To recreate it, extend ../tsconfig.source-consumer.json and include the new public
consumer, Filter Builder TS/Svelte files, CanvasTableFilters Svelte fixtures/stories,
and the original Canvas Table story fixture. The tracked source-consumer project
also includes the new strict public consumer for later full qualification.
Raw iteration/final logs are /tmp/structured-filters-\*.log. The standalone and
integrated cold probe scripts remain in ignored .local for reproduction.

## Remaining work after user review

1. Record the actual UI approval or requested changes here; repair feedback with
   focused regressions first.
2. Only after approval, run the canonical full verification matrix: all directly
   affected Filter/Canvas Table stories and browsers, complete pnpm checks,
   static Storybook, package/release checks and a packed isolated consumer using
   standalone and table public exports. Recheck latest Deno-free spec-validator.
3. Keep screenshots and baseline updates excluded. Explain any failures and record
   exact before/after counts without weakening checks.
4. Mark DC-SHA-069–074 Implemented only after qualification succeeds, then commit
   the evidence. Do not push, publish or migrate Bases/CSV without a new request.

## UI review feedback

The user requested a continuous wrapped-row divider and removal of the predicate right-edge border. This is resolved in the focused review follow-up below; it is not UI approval or authorization for full qualification.

### Border review regression

Initial narrow source command: pnpm test:shadcn:pointer tests/shadcn/canvas-table-filter.spec.ts --grep "keeps wrapped filter dividers". Before the fix: 1 failed case, including an unwanted 1px predicate end border, a 2.390625px seam gap and 3.6875px vertical seam mismatch. The test also checks that the remove control paints the same divider color as the value region. This feedback remains UI review, not approval for broad runs.

### Popover width review regression

The inherited 45svw token was relative to Storybook's iframe viewport; at a 1000px preview the popover measured 450px, below the builder's 512px wrapping breakpoint. The exact `pnpm test:shadcn:pointer tests/shadcn/canvas-table-filter.spec.ts --grep 'uses desktop room'` target failed (1 case; width 450px and 34.5625px wrapped-row offset). The new token uses a 48rem desktop default bounded by the viewport. Compact border coverage now explicitly uses a 480px viewport; desktop coverage requires a single-line row at 1000px. Standalone stories remain independent and fully covered.

### Review follow-up results

The original UI slice is committed as a3da6581. The complete specification was
committed first as 565b1ba2. No broad qualification or user UI approval occurred.

The exact compact-border target changed from 1 failed case (4 assertions: 1px
predicate end border, transparent remove-control divider, 2.390625px gap,
3.6875px vertical offset) to 1 passed case after shared row tracks and a continuous
painted divider. The desktop-width target changed from 1 failed case (450px
panel and 34.5625px row wrap offset) to 1 passed case. Their combined exact command
passes both cases. Compact coverage uses 480px; desktop coverage uses 1000px.

Final exact commands retained above were rerun after the CSS/token changes:
151 unit/audit cases, 27 story interaction/accessibility cases (including all 7
standalone stories), and 30 focused browser cases pass with 0 failures. Native
CSS audit passes. Spec-first and all 3 spec-check lanes pass. Types remain clean
from the UI slice; this follow-up changes CSS, tokens, documentation and browser
regressions only. The new test file remains below the 300-line limit at 254 lines.

The width token is now min(48rem, calc(100svw - 1rem)); hosts can override it and
the table still enforces a viewport maximum. Desktop controls stay on one line;
compact rows retain the full-width divider and no predicate end border. No
screenshot comparison, baseline update, full check, static build or packed
consumer run was performed. Review server remains on 10329. Full qualification
still awaits explicit UI approval. Raw follow-up logs use the
/tmp/structured-filters-border-_, width-_ and review-\* prefixes.

## Full qualification and PR authorized

On 2026-10-31 the user authorized full qualification and temporary-workspace
cleanup, then requested a GitHub PR and push instead of advancing local main.
The earlier approval gate is lifted for full verification. Current results,
branch disposition and resume instructions are in
2026-10-31-canvas-filters-qualification.md. Prior deferred entries are historical.

The final user-selected release scope includes default-workspace Button and
Column Canvas fixes, Canvas Table and Filter Builder. The initial PR may be
pushed while local qualification runs, as explicitly requested. A minor 0.8.0
release is authorized after the required checks. Other workspace work is excluded.

## Final combined-source qualification

The full local command `TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks`
passes on pushed source 892ca102ea181aa7ba76933b9115a33bde33a6bf: 1,071 unit
cases, 38 tooling cases, 1,022 Storybook interaction/accessibility cases and 219
browser cases. One Chromium case is intentionally skipped because it is guarded
for WebKit, where it runs. Functional, interaction and accessibility failure
counts are all 0. Package configuration, clean packed consumers and the isolated
filter/table production consumer pass. All 11 required GitHub contexts pass.

The user requested merging after GitHub checks passed; PR #49 is merged. PR #50
versions the fully qualified source to 0.8.0 and carries these evidence updates.
Publication remains governed by the protected release workflow. The current
release record includes workspace disposition, commands, source identity and
remaining publication checks. All earlier deferred entries are historical.
