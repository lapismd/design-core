# Community component promotion

New JJ workspace: design-core-community-components, parent 0406f7f1.
Reference: jj-store 3be80ad2104f, Apache-2.0, LapisMD contributors.
No consumer migrations or publication are included.

Baseline: five affected Avatar, Input Group, Markdown Content, Markdown Composer
and Transcript story families passed 39/39 cases before editing; command and
output: /tmp/dc-community-baseline.log.

Scope: AvatarGroup, AuthorCard, ReferenceChip, MarkdownComposer suggestions,
LinkPreview, Spoiler, ThreadPanel, QuantityInput and RelativeTime.
Profiles, URL interpretation, uploads, permissions, drafts across navigation
and delivery acknowledgements remain host-owned.

Changed stories remain visual-pending; screenshot baselines are untouched.

## Validation

- Baseline affected stories: 39/39 passed before editing.
- First complete affected-story rerun: 62/62 passed across 12 families.
- Final spoiler, Markdown Content, Avatar, AuthorCard and ThreadPanel regression
  run: 16/16 passed. A newly added spoiler accessible-name regression initially
  failed 1/2 cases and now passes; revealed text names the button.
- Full unit suite on final source: 815/815 passed across 129 files. Turbo runner and release
  helper tests also passed.
- Root, Shell, Filter and strict source consumer type checks: zero errors and
  warnings in every lane.
- Canonical specification: validate, mdbook and spec-first passed.
- Native-CSS audit: no Tailwind utility references in protected components.
- `pnpm packages:pack`: passed clean npm install, public source type checking,
  and cold development/production runtime checks in light/dark themes without
  Tailwind tooling. New components are mounted and exercised by the packed
  consumer. The existing documented KaTeX audit exception remains unchanged.
- The six focused Playwright cases passed again after a fresh own Storybook
  restart. The full catalog rerun with two workers passed 826/826 tests across
  239 files. The initial default-worker invocation stalled after 237 passing
  files; both remaining files passed 12/12 in isolation.
- The broad browser run exposed a completion guard regression: 2/2 legacy
  composer keyboard cases failed. Restricting the guard to configured non-code
  queries and preserving Shift+Enter/IME corrected both. The exact two cases
  plus stale-suggestion cancellation passed 3/3; all 36 directly affected
  composer/thread/transcript stories passed. Trigger helper units passed 6/6.
- Shell browser lane passed 11/11. AI browser lane initially had two readiness
  timeouts; the exact whole lane rerun passed 3/3 without source/test changes.
- Workspace browser lane: 8 passed / 7 failed. All seven were reproduced on unchanged parent 0406f7f1 in an empty
  dedicated JJ workspace; that proof workspace was subsequently forgotten and
  its server stopped.
  The failures belong to Workspace readiness, native tab dragging and floating,
  not any new shared component. No assertion or timeout was weakened. On 2026-10-17 the user explicitly
  accepted deferring this exact group: "Defer existing Workspace failures;
  finish this slice".
- Final `pnpm checks:release` passed: specification, all four type lanes,
  native-CSS audit, 815 unit tests, 16 release-helper tests, production Storybook
  build and visual metadata audit (zero contract errors).
- Final `pnpm packages:pack` passed again after the keyboard repair, including
  cold development/production checks without Tailwind tooling.
- Full native Shadcn lane: 137 passed, 1 existing browser-specific skip and 2
  story-readiness timeouts. Both exact timeout targets then passed, together
  with all six new component scenarios (8/8). The suggestion regression now
  explicitly checks an unnormalised newline after Shift+Enter while a registered
  completion is visible. All 139 active cases therefore have passing evidence;
  the initial readiness retries remain recorded rather than concealed.
- Final `pnpm test:storybook --no-file-parallelism`: 826/826 passed across
  all 239 files on the corrected source. No tests or assertions were excluded.
- No consumer migration or publication is included. The seven explicitly
  accepted Workspace failures are the only outstanding persistent failures;
  visual review remains pending and no screenshot baselines were updated.

Logs are local `/tmp/dc-community-{baseline,stories-final,refinements,checks-final,pack-final}.log`.

## Review navigation

Storybook for this workspace uses port 9709. Start with:

- [AvatarGroup](http://127.0.0.1:9709/?path=/story/shadcn-data-avatar--participant-groups)
- [AuthorCard](http://127.0.0.1:9709/?path=/story/shadcn-data-author-card--author-details-and-actions)
- [ReferenceChip](http://127.0.0.1:9709/?path=/story/shadcn-data-reference-chip--references-actions-and-removal)
- [Markdown composer suggestions](http://127.0.0.1:9709/?path=/story/chat-markdown-composer--mention-and-command-suggestions)
- [LinkPreview](http://127.0.0.1:9709/?path=/story/shadcn-content-link-preview--inline-compact-and-rich)
- [Spoiler](http://127.0.0.1:9709/?path=/story/shadcn-content-spoiler--reveal-and-conceal)
- [Markdown spoiler extension](http://127.0.0.1:9709/?path=/story/chat-markdown-content--inline-spoilers)
- [ThreadPanel](http://127.0.0.1:9709/?path=/story/chat-thread-panel--nested-discussion)
- [QuantityInput](http://127.0.0.1:9709/?path=/story/ui-forms-quantity-input--display-units-preserve-canonical-value)
- [RelativeTime](http://127.0.0.1:9709/?path=/story/shadcn-data-relative-time--relative-date-with-exact-tooltip)

## Repairs made during qualification

The unit-aware input bounds discrete slider allocation for huge ranges while
retaining typed canonical integers exactly. Composer suggestions consume an
accepted completion before Enter can submit a message, abort superseded searches
and dispose mounted option icons. Thread actions remain reachable on row hover
and focus. Author triggers retain jj-store's 36px default geometry, participant
groups use 32px and reply participants use 24px. These changes add no application
routing, transport, permission or persistence policy.

The final browser reruns run after package/build work, with full catalog and
native browser lanes run separately to reduce startup contention. One catalog
attempt ended with a dynamic setup import/browser connection error before any
test ran, and one native suite launch collided with the starting dev server
before executing tests. Those attempts are recorded separately from functional
failures; neither was treated as passing evidence.

Final logs: `/tmp/dc-community-release-gates.log`,
`/tmp/dc-community-pack-qualified.log`,
`/tmp/dc-community-catalog-serial-final.log`,
`/tmp/dc-community-shadcn-qualified2.log`,
`/tmp/dc-community-browser-recheck.log` and
`/tmp/dc-community-parent-workspace-all.log`.

## Local main-workspace integration

On 17 October 2026 the user requested landing this slice in the main workspace.
The feature was rebased onto exact main-workspace parent `aedd61d88d5f`, preserving
the newer Transcript collapsed-comment and footer-state repairs. No conflicts
or implementation edits were needed. `jj interdiff` between original feature
`6230d903f6f8` and rebased feature `c7c042f2` reports zero changed files.

Combined-tree qualification:

- `pnpm checks:release` passed: canonical checks, all four type lanes, native
  CSS, 815 unit tests, release-helper tests, production Storybook and visual
  metadata with zero contract errors.
- `pnpm test:storybook --no-file-parallelism`: 825 passed, one dropdown-menu
  pointer-events failure. Its unchanged exact story file then passed 2/2 with
  the same command restricted to `DropdownMenuConsumer.stories.svelte`. All
  826 catalog cases have passing evidence; the initial retry is retained here.
- A fresh Storybook process on port 10019 passed all 42 native browser cases
  across `community-components`, `transcript`, `transcript-parity`,
  `transcript-review` and `transcript-view`.
- The seven parent-reproducing Workspace failures remain explicitly deferred
  by the user's earlier acceptance. No assertions or baselines were changed.

Logs: `/tmp/dc-community-land-release.log`,
`/tmp/dc-community-land-stories.log`,
`/tmp/dc-community-land-dropdown-retry.log` and
`/tmp/dc-community-land-browser.log`.

The clean default workspace advances onto this combined stack. Other workspaces,
the published `main` bookmark, package versions and consumer repositories are
preserved. This local integration includes no push or publication.
