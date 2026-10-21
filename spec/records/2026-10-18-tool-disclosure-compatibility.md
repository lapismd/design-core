# Retain qualified tool disclosure accessibility in the 0.5 artifact

The Notes history integration consumes the public Design Core 0.5.1 source
lineage at `fa174d7e`. That lineage does not contain the source-owned Tool Calls
fixes already qualified for Notes on the 0.4 migration branch: `3571fb45` and
`9c51152a`. The missing behavior is a package compatibility prerequisite under
DC-AI-015, not a reason to weaken downstream assertions or accessibility.

The restored implementation is the existing `9c51152a` ToolCalls component,
including its decorative busy Spinner. Visible target/node/statistics/duration
text names the disclosure through component-scoped IDs; status remains its
accessible description. Existing wrappers, layout, keyboard behavior, public
props, execution and persistence remain unchanged. The original four regression
stories and four metadata-aware control queries are retained from the owning
source revisions. No baseline is changed or approved.

## Before state

- The new history family passes all 64 theme/viewport cases, and its exact dark
  unified diff regression passes through the prepared package.
- Notes' complete desktop-light catalog has 155 passes and 12 failures across
  eight families. Later configurations do not run. Exact Agent Trace has one
  failure and two skipped: its tool disclosure omits the visible file target.
  JSONL and shell failures additionally report axe label-content-name mismatch.
- Restoring only the owning regression stories and running
  `node scripts/with-storybook-env.mjs pnpm exec vitest run --project storybook
src/shared/ai/tool-calls/ToolCalls.labels.stories.svelte
src/shared/ai/tool-calls/ToolCalls.busy.stories.svelte` reproduces four failures
  before the implementation is carried forward.

## Qualification

The exact command above now passes all four cases. The complete affected
`node scripts/with-storybook-env.mjs pnpm exec vitest run --project storybook
src/shared/ai src/shared/chat` lane passes 186 cases in 38 files. The two changed
previously approved Tool Calls examples remain visual-pending; unrelated story
review tags are retained. All original geometry, disclosure, wrapper, keyboard
and accessibility assertions remain enabled.

Full source checks, a newly packed public artifact and complete Notes consumer
qualification remain pending. Source and consumer outcomes must be recorded
separately before committing the slice.
Native visible history, durable conversation recovery, package publication and
visual approval retain their separate gates.

The first renewed public archive is SHA256
`e128541ff86d9212ffb69b766228312a3bf322342177ecf8b684216914a5ebd8`.
Its exact formerly failing Notes Agent Trace passes. All 25 affected consumer
cases pass in both light-mode viewports. Desktop-dark has 22 passes and three
Message Metadata contrast failures, with no remaining disclosure failure;
narrow-dark does not run. The separate owning repair and final artifact are in
`2026-10-18-message-status-contrast.md`. Source qualification is explicitly
interrupted for that newly isolated required fix rather than claimed complete.

The original unrelated panel-toggle target now passes from a cold process with
the source held fixed: `node scripts/with-storybook-env.mjs pnpm exec playwright
test -c playwright.shadcn.config.ts tests/shadcn/panel-toggle-pointer.spec.ts
--grep 'both icon variants retain' --project chromium
--output .local/panel-toggle-recheck` reports one pass. No toggle implementation
or assertion changes were required after the recorded documentation reload.

The final `pnpm checks` now passes all source gates with both disclosure and
metadata repairs: 821 unit tests, 834 stories and 172 browser cases, one existing
skip. All 100 affected public-package consumer checks pass. The final artifact,
current desktop/API intake and passing 692-case complete current-app consumer gate
are recorded in `2026-10-18-message-status-contrast.md`. Earlier failed and
interrupted attempts above retain their original results.
