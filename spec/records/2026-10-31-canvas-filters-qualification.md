# Canvas Table and structured filters: full qualification and PR

## Authorization and scope

The user authorized full verification on 2026-10-31, then explicitly requested
a GitHub pull request with Changesets and push instead of advancing main.
The local main bookmark remains unchanged; the default checkout will match the
pushed feature revision after qualification. Only
the two task workspaces may be retired after their work is safely pushed.
The user subsequently authorized a new minor release (0.8.0). Plugin changes,
screenshot comparisons and baseline updates remain excluded.

The PR candidate merges the reviewed feature 77299aab (including Canvas Table
50c94a6b) with current remote main 30a5c883, which adds the released Mira minimum
and Design Core 0.7.4 metadata. This merge has no conflicts. The user explicitly selected default-workspace commits d190b73d and 8e210d23
for inclusion alongside the feature, excluding unfinished work in other workspaces.
The final candidate combines this reviewed branch with the verified preliminary
integration rtmqxlzy, preserving the visible-overflow/hidden-content resolution.
Both public additions have minor Changesets. Stories remain visual-pending.

## Qualification ledger

A preliminary candidate combining the feature with the default workspace's
existing local changes passed focused units, story interactions, strict types,
package checks and an isolated production consumer. Its full run is recorded in
`/tmp/canvas-filters-full-checks.log`; it is retained locally, not the PR source.
After discovering current remote main, the actual PR candidate is independently
qualified on the released dependency baseline. Do not use preliminary results
to claim the final candidate passes.

Latest Deno-free spec-validator: 0.2.0, already covered by ^0.2.0. Use Node
24.10.0 through a command-local PATH; default Node 26 has the inherited QMD ABI
issue. Recheck doctor and semantic search; use its supported rg fallback if
native search becomes unavailable. No global runtime changes.

GitHub push preflight found 0 open PRs and 0 open Dependabot PRs in
lapismd/design-core. No dependency consolidation PR is needed. Recheck immediately
before push. Keep dependency and release changes from current main intact.

## Resume and completion

Run focused feature units/stories first, specification checks, the complete
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks` lane, `pnpm packages:check`,
`pnpm packages:pack`, and the retained isolated public filter/table consumer.
Record exact commands, failure counts and reruns. Commit verified work, push only
the feature bookmark, and open a PR targeting main. Merge only after local qualification and required PR checks pass, then use the
Changesets version PR and trusted-publishing release workflow.

After push, prove feature commits are reachable from the remote feature bookmark,
stop only owned servers, preserve logs/probes/archive in the default checkout's
ignored evidence folder, forget canvas-table and structured-filters, and move
only their exact directories to Trash. Leave all other workspaces untouched.

## Final-candidate focused and package evidence

All commands use:

```sh
export PATH=/Users/stevejuma/.nvm/versions/node/v24.10.0/bin:$PATH
```

| Exact command                                                                                                                                                                                                                       | Result                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                                                                                                                                                    | Passed; released Mira 0.1.4 and portable lockfile retained                                                                |
| `pnpm exec spec-validator doctor --json`                                                                                                                                                                                            | Passed, QMD native/index checks available on Node 24                                                                      |
| `pnpm spec:search --semantic 'standalone structured filter builder canvas table'`                                                                                                                                                   | Passed; no fallback needed                                                                                                |
| `pnpm test:unit src/shared/shadcn/filter-builder src/shared/shadcn/canvas-table`                                                                                                                                                    | 151 passed in 7 files, 0 failures                                                                                         |
| `VITEST_MAX_WORKERS=2 pnpm test:storybook src/shared/shadcn/filter-builder/FilterBuilder.stories.svelte src/shared/shadcn/canvas-table/CanvasTableFilters.stories.svelte src/shared/shadcn/canvas-table/CanvasTable.stories.svelte` | 27 passed in 3 files, 0 failures                                                                                          |
| `pnpm spec:first`                                                                                                                                                                                                                   | Passed: 79 protected files, 12 chapters                                                                                   |
| `pnpm spec:check`                                                                                                                                                                                                                   | All 3 lanes pass, 0 diagnostics                                                                                           |
| `pnpm packages:check`                                                                                                                                                                                                               | Passed                                                                                                                    |
| `pnpm packages:pack`                                                                                                                                                                                                                | Passed: clean archive install, strict public types, cold development and production browsers, 0 production audit findings |

Logs use `/tmp/canvas-filters-pr-*.log`. The baseline full exact command was
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks`; it was stopped intentionally after passing unit, types, static catalog,
1,022 story cases and 16 workspace cases when the user selected local fixes too.
This is cancellation, not a test failure. A complete run of the combined release
candidate is pending. No assertions, timeouts or diagnostics are weakened. An independent
isolated packed consumer passes using
`node .local/qualify-canvas-filters.mjs`. The preliminary probe required three
harness corrections (1 initial-state warning, 1 source-sheet ARIA count assumption,
1 fixture sheet index). The final-candidate probe retains the corrected checks
and exercises actual filtered controls and offscreen controlled selection.

The final packed consumer passes strict Svelte types (0 errors, 0 warnings), a
production Vite build and browser interactions with 0 runtime errors. It covers
public standalone/facade/table/inference imports, 2,000 source rows, 111 matching
rows selected beyond the viewport, bounded rendered controls, hidden selections,
cell edits removing a match, keyboard focus return and dark-mode popovers. The
exact command passes on its first final-candidate run; no runtime fix is needed.

The baseline full lane passed 1,071 unit cases, 3 concurrency/cache
tests, 35 release-tool tests, all four strict type projects (0 errors/warnings),
formatting and all spec lanes. Static catalog and broad browser results follow.

## Combined release candidate and early PR

The user requested pushing and opening the PR while local verification runs.
The combined candidate includes current remote main, both reviewed features and
the two existing local fixes, with only the progress-record conflict resolved
using the newer PR record. The complete local suite is explicitly pending at
initial push. Do not publish until the final source is qualified. The preliminary
combined run is green (183 Shadcn browser passes and 1 existing skip); the newer
remote-main-only baseline was cancelled without failures to finalize this scope.
