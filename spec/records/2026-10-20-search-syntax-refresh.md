# Focused Search syntax refresh

DC-FILTER-003; enclosing Jujutsu change.

Asynchronous file-facet catalogs can replace filter syntax while the first
CodeMirror completion request is pending. Reconfiguration cancels that request
without another focus event. SearchFilterInput now schedules eligible completion
after reconfiguration when the editor still owns focus. Query text, selection,
custom-language mode and caller-owned facets retain their existing authority.

The focused asynchronous-syntax story refreshes its catalog on the next event
loop after focus and checks the visible option after layout frames. The exact
before run failed 1/1; the same target passes 1/1 after the source fix. An earlier
100ms-delay experiment passed because completion was already established; the
zero-delay regression proves the pending-request race.

- `pnpm exec vitest run --project storybook --no-file-parallelism src/shared/filter/search-filter-bar/SearchFilterInput.presentation.stories.svelte -t Focused`:
  before fail 1, after pass 1 (two other stories unselected).
- Logs: `.local/history-search-syntax-race-before.log` and
  `.local/history-search-syntax-after.log`.

The four directly affected SearchFilterInput and SearchFilterBar story files
pass 13 interaction/accessibility cases with a fresh Vitest browser process.
`pnpm check:filter-consumer` passes with zero errors/warnings. The first spec
validation rejected a two-sentence acceptance bullet; the sentence was combined
without dropping its constraints. Source gates and public archive qualification
are recorded below after completion. Visual
approval, root aggregates and publication remain deferred under the consuming
Desktop's focused functional-UI scope. No baseline or package publication.

- `pnpm exec vitest run --project storybook --no-file-parallelism` selecting
  SearchFilterInput.presentation, SearchFilterInput, SearchFilterBar and its
  variations story files: pass 13/13, interaction/axe enabled.
- `pnpm check:filter-consumer`: pass, zero errors/warnings.
- `pnpm spec:validate` and `pnpm spec:first`: pass after the atomic-bullet repair.
- The first `packLocal` attempt used a relative output directory and failed its
  final archive read after successful declarations/CSS preparation; the retry
  uses an absolute output directory. Public source ranges remain unchanged.

`pnpm spec:check` passes validation, mdbook and spec-first. The source slice
is committed before producing its private public-export archive.
