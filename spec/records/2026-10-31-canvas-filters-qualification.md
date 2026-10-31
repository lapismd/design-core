# Canvas Table and structured filters: full qualification and PR

## Authorization and scope

The user authorized full verification on 2026-10-31, then explicitly requested
a GitHub pull request with Changesets and push instead of advancing main.
Local main and the default working copy retain their existing revisions. Only
the two task workspaces may be retired after their work is safely pushed.
No publication, plugin changes, screenshots or baseline updates are included.

The PR candidate merges the reviewed feature 77299aab (including Canvas Table
50c94a6b) with current remote main 30a5c883, which adds the released Mira minimum
and Design Core 0.7.4 metadata. This merge has no conflicts. Unrelated default
workspace commits d190b73d and 8e210d23 remain local and are excluded from this PR.
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
the feature bookmark, and open a PR targeting main. Do not merge the PR.

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

Logs use `/tmp/canvas-filters-pr-*.log`. The full exact command is
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks`; it is running on this
candidate. No assertions, timeouts or diagnostics are weakened. An independent
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

The final-candidate full lane has passed 1,071 unit cases, 3 concurrency/cache
tests, 35 release-tool tests, all four strict type projects (0 errors/warnings),
formatting and all spec lanes. Static catalog and broad browser results follow.
