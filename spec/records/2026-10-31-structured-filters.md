# Structured filters progress and resume record

## Authorization and workspace

The user approved a specification-first, UI-first implementation on 2026-10-31.
Full checks, repository-wide tests, static Storybook, package/release qualification
and isolated packed consumers are deferred until explicit UI approval. This is
an explicit task-specific exception to the normal AGENTS full-check-before-commit
rule. No push, publication, plugin changes or visual baselines are authorized.

Workspace: /Users/stevejuma/code/lapismd/design-core-structured-filters.
Parents: current main 8e9b3f29 plus Canvas Table 50c94a6b. Original Canvas Table
workspace and review port 9829 remain untouched. New ignored base port: 10029;
focused Shadcn review port: 10329.

## State

| Stage           | Status                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| Specified       | Complete; DC-SHA-069–074 and full public contract in shadcn/structured-filters.md |
| Implemented     | Complete UI slice; UI review pending                                              |
| Focused-tested  | Complete; final scoped commands pass                                              |
| UI-approved     | Pending user review                                                               |
| Fully-qualified | Deferred until UI approval                                                        |

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

| Exact command                                                                                                                                                                                                                         | Final result                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| pnpm test:unit src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table                                                                                                                                                        | 151 passed across 7 files; 0 failed                                                              |
| pnpm exec svelte-check --tsconfig .local/structured-filters-tsconfig.json --fail-on-warnings                                                                                                                                          | 0 errors, 0 warnings; standalone, table, examples and fixtures                                   |
| VITEST_MAX_WORKERS=2 pnpm test:storybook src/shared/shadcn/filter-builder/FilterBuilder.stories.svelte src/shared/shadcn/canvas-table/CanvasTableFilters.stories.svelte src/shared/shadcn/canvas-table/CanvasTable.stories.svelte     | 27 passed across 3 story files; 0 failed; interaction, accessibility and runtime guards retained |
| pnpm test:shadcn:pointer tests/shadcn/filter-builder.spec.ts tests/shadcn/canvas-table-filter.spec.ts tests/shadcn/canvas-table-filter-types.spec.ts tests/shadcn/canvas-table.spec.ts tests/shadcn/canvas-table-interactions.spec.ts | 28 passed; 0 failed; includes original next-frame sort alignment regressions                     |
| pnpm spec:first                                                                                                                                                                                                                       | Passed: 46 protected files, 9 canonical chapters after final evidence update                     |
| pnpm spec:check                                                                                                                                                                                                                       | All 3 specification lanes passed; 0 diagnostics                                                  |
| pnpm exec tsx scripts/check-no-tailwind-utilities.ts src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table                                                                                                                  | Passed: 0 utility references                                                                     |

Focused Prettier covers every changed file. The source-length audit covers the
whole new builder, Canvas Table family, new browser files and strict consumer.
Largest newly authored JS/TS/Svelte file: 189 physical lines. The existing modified
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

The user requested a continuous wrapped-row divider and removal of the predicate right-edge border. This is pending as a focused follow-up to the verified UI slice; it is not UI approval or authorization for full qualification.
