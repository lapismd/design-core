# Reconcile Design Core workspaces

The main workspace started clean at `fd2a327f`. The audit found nine registered
Jujutsu workspaces and four historical Git-backed component-generator sandboxes.
This slice reconciles pending source work before retiring redundant checkouts.
No publication, consumer migration or screenshot-baseline update is included.

## Source reconciliation

The main workspace merges `a57a38e2` from `reusable-history`, retaining the latest
AvatarGroup, AuthorCard, Transcript density and Workspace PanelToggle defaults.
The merge is conflict-free. The history change carries the qualified dark
syntax palette, documentation examples, dark message-status contrast and the
desktop branch's complete ToolCalls disclosure names and decorative busy glyph.

The remaining `desktop-migration` differences are reconciled by effect:

- `74a94ed1` plugin transitions are already integrated as `714f4877`.
- `54756952` session popups are already integrated as `fa174d7e`; subsequent
  main-workspace tab geometry and picture-in-picture icons remain authoritative.
- `3571fb45` and `9c51152a` match the ToolCalls implementation restored by the
  history branch, so they are not applied twice.
- `64266c04` additionally repairs tool failure/deletion foregrounds. Those two
  scoped color mixes and its light/dark regression stories are retained. The
  history branch's later dark-only message-status mix remains authoritative;
  its exact consumer qualification is retained in its original record.

Original workspace heads are protected by local archive bookmarks under
`archive/workspace-retirement-20261018/`. Their source history remains available
after workspace registrations and checkout folders are retired.

## Focused baseline

The complete focused command is:

```sh
pnpm test:storybook src/shared/ai/tool-calls/ToolCalls.busy.stories.svelte src/shared/ai/tool-calls/ToolCalls.labels.stories.svelte src/shared/ai/tool-calls/ToolCalls.contrast.stories.svelte src/shared/ai/message-metadata/MessageMetadata.contrast.stories.svelte src/shared/shadcn/code-block/CodeBlock.stories.svelte src/shared/diff/file-diff/FileDiff.stories.svelte
```

With regression fixtures restored before product changes: 9 failures and 22
passes across 31 cases. An earlier name-filtered attempt selected only six
failing cases and skipped 25; it is not used as the complete baseline.
After the history merge alone: one dark tool-contrast failure and 30 passes.
The remaining scoped desktop repair is measured against that exact command.
Logs: `/tmp/dc-reconcile-before-all.log` and
`/tmp/dc-reconcile-history-only.log`.

## Retirement boundaries

The seven existing secondary Jujutsu checkouts were clean at audit time. The
eighth secondary registration, `chat-layout-baseline`, refers to an absent
temporary directory and has no unique content. Old generator sandboxes retain
untracked reference copies for Progress, Slider, Context Menu and Drawer; each
corresponding family and file path is already present in main.

Cleanup must retain original revisions and recoverable checkout contents,
including ignored artifacts and untracked generator inputs. Only static preview
servers owned by retiring checkouts may be stopped; the main 9210 Storybook
lane remains available. Final qualification and retirement results follow.

## Retirement results

Only `default` remains in `jj workspace list`, and the historical Git worktree
registry now contains only the main checkout. Eight secondary Jujutsu
registrations were forgotten: seven clean checkout folders were removed and
the absent `chat-layout-baseline` registration was retired. Four generator
sandboxes and their administrative entries were removed from the active tree.
Their historical heads are protected by local archive bookmarks too.

All removed checkout contents, including ignored artifacts and all 57
SHA-256-verified untracked generator reference files, are recoverable under:

```text
/Users/stevejuma/.Trash/design-core-workspaces-20261018-061018
```

The archive's `retirement.json` records original and recovery paths;
`audit/generator-manifest.json` records the untracked file hashes, and
`README.md` explains recovery. The main checkout retains the same local audit
under `.local/workspace-reconciliation-20261018/`. Seven verified static
preview servers owned by the retired checkouts were stopped. No running main
preview was stopped. The checked jj-store, jj-store-forge-stacks,
lapis-community and lapis-notes installations resolve registry packages rather
than these checkouts.

## Qualification

- The exact six-family regression command above passes 31/31 after the scoped
  contrast repairs, compared with 22/31 before reconciliation.
- `pnpm packages:pack` passes the public-export and clean-consumer type checks,
  plus cold development and production interaction/style checks in both
  themes without consumer Tailwind tooling. Its new CodeBlock span-color
  fixture explicitly selects `highlightMode="spans"`; the first attempt
  incorrectly looked for spans while Chromium used CSS Highlights by default.
- The first `pnpm checks` run passed governance, formatting, all four type
  configurations, 821 unit tests, tooling/release tests, the static Storybook
  build and visual metadata audit. Its full catalog result was 838/839: the
  experimental emoji grid keyboard-focus case failed. The exact owning story
  file subsequently passed 3/3 in a fresh process without packaging running
  concurrently. No assertion or product behavior was changed for that case.

Logs for the successful focused and package runs are
`/tmp/dc-reconcile-after.log`, `/tmp/dc-reconcile-pack-final.log` and
`/tmp/dc-reconcile-emoji-recheck.log`. The complete serial repository rerun is
recorded in `/tmp/dc-reconcile-checks-final.log`; its final results follow.

The complete second `pnpm checks` run exits successfully:

| Lane                                               | Result                                          |
| -------------------------------------------------- | ----------------------------------------------- |
| Governance, specification and formatting           | Passed                                          |
| Root and three strict consumer type configurations | Zero errors or warnings                         |
| Native-CSS audit                                   | Passed                                          |
| Unit suite                                         | 821/821                                         |
| Turbo/tooling and release tests                    | 3/3 and 16/16                                   |
| Static Storybook build and visual metadata         | Passed; zero contract errors                    |
| Storybook interaction/accessibility catalog        | 839/839 across 243 files                        |
| Workspace pointer acceptance                       | 16/16                                           |
| Shell pointer acceptance                           | 11/11                                           |
| AI browser acceptance                              | 3/3                                             |
| Shadcn browser acceptance                          | 151 passed, one existing platform-specific skip |

`pnpm spec:first` also passes with 45 protected files and 12 canonical chapters.
The first catalog run's emoji-focus failure is absent from both its focused
rerun and the complete second catalog run. Functional and accessibility failure
count for the final repository run is zero. Screenshot baselines were not
updated; changed stories retain `visual-pending`.
