# Column Canvas hover previews

Requirement: DC-SHA-036. Source change: `lrvkzxkr`.

## Behavior

Columns default to mouse hover previews after 600 ms, with a 120 ms dismissal
handoff. `previewOnHover`, `previewDelay`, and `previewDismissDelay` configure
ordinary/custom/fixed collapsed rails and floating sticky rails. Compact and
touch retain explicit controls. Existing edge/toggle preview options are independent.

A stable contents host retains live DOM, inputs and internal scroll through
collapse, preview and expansion. Contents stay interactive; previews do not
persist layout or change durable state. Floating-rail eligibility is transient.
Escape/outside clicks dismiss, with focus restoration when contents become hidden.
Owned portalled controls are part of the interaction boundary.

## Before state and development diagnostics

- `pnpm spec:search -- 'DC-SHA-036'`: installed validator rejects the forwarded
  separator; `pnpm spec:search 'DC-SHA-036'` succeeds and points to the canonical chapter.
- `pnpm test:unit src/shared/shadcn/column-canvas/column-canvas-controller.spec.ts src/shared/shadcn/column-canvas/column-canvas.docs.spec.ts`:
  15 existing controller tests pass; the second requested path was incorrect.
- Initial new browser regression was not a valid before proof: source edits
  began during catalog startup and the compiler rejected static pointer handlers.
  The corrected regression subsequently reproduced rail-preview suppression,
  which was fixed by clearing stale suppression after normal expansion.
- Initial Storybook suite could not import browser setup through a reused
  node_modules symlink. An isolated offline frozen-lockfile installation repaired
  workspace test resolution without tracked dependency changes.
- Existing collapse assertions required content removal; collapse now asserts
  hidden/inert content to prove retention. Closed columns and path removal still
  release contents, preserving the original lifecycle outside previews.

## Verification

This changes a shared component's default interaction and content lifecycle across
multiple hosts, so verification escalates from the exact regression to full source
unit/type/Storybook/build and browser lanes before packed consumer acceptance.
Results and remaining gates are recorded below as execution completes.

- `pnpm test:unit src/shared/shadcn/column-canvas`: 33 tests pass in four files.
- `pnpm check:types`: all four source/consumer checks pass with no warnings.
- `pnpm test:storybook src/shared/shadcn/column-canvas/ColumnCanvas*.stories.svelte`:
  26 interaction/accessibility stories pass across five files after assertion updates.
- `pnpm build-storybook`: passes.
- `pnpm test:unit`: 723 tests pass in 112 files.
- `pnpm test:storybook`: 675 interaction/accessibility cases pass in 214 files
  before final lifecycle refinements; the required aggregate rechecks the final tree.
- `pnpm fmt:check`: initial temporary test diagnostics needed formatting;
  the subsequent full formatting check passes.
- `pnpm check:no-tailwind`: passes.
- `pnpm spec:check`: initially rejected a long/multi-sentence acceptance bullet;
  the concise atomic bullet passes validation, mdBook and spec-first.
- `pnpm package:local`: produces the prepared archive; final consumer validation
  will repack the integrated default workspace.
- Pointer development found wrong Escape focus restoration and a nested popup
  consuming the same Escape as its parent preview; both exact cases now pass.
- Playwright rail hover itself scrolled 11 px through scroll-into-view. Direct
  native pointer movement proves previewing leaves scroll position unchanged.
- Wider pointer runs found 11 duplicate normal-content column identifiers, then
  three closed-column omission failures. Production markup was corrected while
  preserving all original geometry/navigation assertions.
- Overlapping browser startup stalled readiness; final browser qualification
  runs serially. One anchored grep selected no tests; a concurrent pointer launch
  collided on the workspace port. These are invalid qualification attempts.

`pnpm test:shadcn:pointer column-canvas-preview.spec.ts column-canvas-fixed.spec.ts column-canvas-scroll.spec.ts`:
27 cases pass from a fresh source catalog, including all seven new preview cases.

The required `pnpm checks` command ran twice. Governance/format/types, all 723 units,
675 stories, static build and metadata audit pass. Both aggregates stop on the
unchanged notification readiness timeout (14 workspace passes, one failure),
already recorded in [the parent package record](prepared-local-package.md).
`pnpm test:workspace:pointer notification-toasts.spec.ts` passes unchanged in
isolation. `pnpm test:workspace:pointer --workers=1` passes all 15 cases with
identical assertions; `pnpm test:shell:pointer --workers=1` passes 11 cases.
`pnpm test:ai-chat-browser --workers=1` initially has two passes and one
Visual Delta readiness timeout before clipboard/drop assertions. The identical
cold rerun passes all three cases without changing source, assertions or timeouts.
`pnpm test:shadcn:pointer --workers=1` passes 55 cases, with one existing
Chromium skip for a WebKit-only preference case; that case passes in WebKit.
The default-concurrency aggregate is not claimed as a full pass.

Live jj-store before updating the archive: a 1000 px wide canvas was collapsed,
the native pointer dwelled on the revisions rail for 750 ms, and zero previews
appeared. The original expanded layout was restored.

The initial feature's source browser qualification passed before the focused
teardown follow-up. Final follow-up and packed-consumer results are recorded below.
The full Storybook recheck reproduces the same three nonfatal AppShell notices in
AutomaticTabletComposition, ConstrainedDesktopOverlays and
ComposableSameSidePanelsAndSurfaceLayer;
new sticky preview cases explicitly fail on any page errors.

Requirement/status review: DC-SHA-036 remains Implemented. Its acceptance now
includes the approved default rail-hover interaction and retained content lifecycle.
This adds no durable layout format or application persistence change. Catalog
stories remain visual-pending; this evidence does not promote a release milestone.

Environment: macOS ARM64, Node 26.9.0, pnpm 10.32.1, JJ 0.45.1,
Playwright 1.61.1 and Svelte 5.56.1. Final record checks use
`pnpm exec prettier spec/records/column-canvas-hover-previews.md --write` and
`pnpm spec:check`; source records and verification rows stay in the same change.

Visual baselines and package publication remain unapproved. Consumer acceptance
uses the existing prepared local archive workflow, with registry manifests retained.
Concurrent default-workspace AI/diff and jj-store workspace-inspector changes
are unrelated and are preserved.

## Packed consumer teardown correction

The source landed above the unchanged default-workspace AI/diff stack, preserving
`soqpuosr` and `nyxnzqvv`. Integrated `pnpm check:types` passes all four checks;
`pnpm test:unit src/shared/shadcn/column-canvas` passes 33 tests. The default
workspace's `pnpm package:local` produced archive SHA256
`04a1944b0a6b9cae245727cb996f23b4b814b23eb51aa2dbd3565774054241f2`.

jj-store `pnpm install --lockfile=false --prefer-offline` installed that archive
without tracked manifest/lockfile changes. An ignored helper
`node .local/column-preview/refresh-ui.mjs` preflighted ownership, moved the Vite
cache to a recoverable ignored backup and restarted only UI PID 91142 as 20425;
backend PID 36193 remained running. Reloading the user's Op Log proved the rail
opens a populated 480 px preview, its Search control works, and Escape restores
the collapsed rail. No live ResizeObserver notices were recorded.

The initial consumer Storybook batch exposed `derived_inert` in Column's blur
handler during removal under Svelte 5.57.1. The handler read `collapsed` after
its derivation was destroyed. That run also reloaded on another task's ignored
tsconfig creation and was interrupted with exit 130; no pass count is claimed.
Column now guards disposed/disconnected interaction handlers and reads the
rendered rail attribute instead of destroyed derived state during handoff.
This is an unchanged-contract correction to DC-SHA-036's teardown and retained
content guarantees; the requirement status remains Implemented.

`pnpm test:shadcn:pointer column-canvas-preview.spec.ts --grep 'removing a focused preview'`
passes before and after the guard under source Svelte 5.56.1; this source runtime
did not reproduce the consumer diagnostic. The added case preserves focus during
host removal and rejects page errors and Svelte warnings. Consumer qualification
must additionally prove the original failure is gone under Svelte 5.57.1.

Initial jj-store `pnpm web:check` has zero errors and an unrelated skeleton CSS
warning. `pnpm catalog:check` rejects that warning; `pnpm check:ui-ownership`
rejects the concurrent new inbox skeleton's missing provenance. Those changes
belong to a separate active task and are not edited here. The spec-search helper
also reports a QMD Node ABI mismatch; its documented `rg` fallback located the
current repository presentation and ownership contracts.

Source follow-up change: `nqrooplr`. Logs are preserved under the default Design
Core `.local/column-preview` and jj-store `.local/column-preview`;
publication/baselines remain unapproved.

The follow-up `pnpm checks` initially stopped at spec-first because the guard's
change did not touch the owning chapter, before its remaining lanes completed.
DC-SHA-036 now explicitly requires cancellation of obsolete interaction handlers;
the corrected aggregate reruns without substituting that interrupted attempt.

## Final follow-up qualification

The corrected `pnpm checks` passed governance, formatting, all four type checks,
all 723 unit tests, static Storybook build and metadata audit. Its Storybook lane
stalled after reporting 210 of 216 files and was interrupted with exit 130.
`pnpm test:storybook --maxWorkers=1 --browser.fileParallelism=false` subsequently
passed all 679 tests in 216 files. No aggregate pass is claimed.

`pnpm test:shadcn:pointer --workers=1` on the final guard tree passed 55 cases,
skipped the existing Chromium/WebKit-only case and failed the first fixed-panel
case while waiting for Visual Delta readiness. The unchanged exact cold rerun,
`pnpm test:shadcn:pointer column-canvas-fixed.spec.ts --grep 'fixed panels retain live input'`,
passed. All eight preview cases passed, including focused host removal; this is
passing evidence for all 56 runnable Shadcn cases, not a clean full-command pass.

Two final development-server workspace runs were interrupted after readiness and
navigation timeouts: the first recorded five failures before interruption; the
second recorded three failures, one pass, one interrupted case and ten cases not
run. They do not qualify workspace functionality. The owned 9360 supervisor was
stopped with `STORYBOOK_PORT=9360 pnpm storybook:stop`; the exact cold
`pnpm test:workspace:pointer workspace-pointer.spec.ts --grep 'bottom panel height resizes' --workers=1`
then passed. `WORKSPACE_STORYBOOK_PORT=9361 pnpm test:workspace:pointer --workers=1`
initially passed two cases and failed three before interruption. Its trace shows
`net::ERR_CONNECTION_RESET` for existing CSS/JS assets; no product assertion was
reached in those failed cases. The disposable static server was replaced with an
isolated `ThreadingHTTPServer` using a 128-request listen queue. The identical
command then passed all 15 cases in 36.7 seconds against the final built catalog.
This is static-catalog acceptance, separate from the development-server failures;
no production/test source, assertion, timeout or baseline changed for this rerun.

The same final static catalog also passes
`SHELL_STORYBOOK_PORT=9361 pnpm test:shell:pointer --workers=1` (all 11 cases,
24.2 seconds) and
`AI_CHAT_STORYBOOK_URL=http://127.0.0.1:9361 pnpm test:ai-chat-browser --workers=1`
(all three cases, 4.1 seconds). The static server is disposable validation
infrastructure; default-workspace catalog listeners are preserved.

The final integrated default archive, produced with `pnpm package:local`, has
SHA256 `e6b658cedea6e8812fe0a7f350f171c55b6297dc9fdf0862b03d56c82e31766c`.
jj-store reinstalled it with `pnpm install --lockfile=false --prefer-offline`.
The UI-only helper refreshed frontend PID 36786 while preserving backend PID 36193. A later independent task restarted the main demo; the same installed
guard/defaults remain present and rail hover still opens populated Op Log content.

Consumer stories exposed loading-readiness races after the separate representative
skeleton change `mpyvzmqo`. Six story/helper files now await the real application
view imports, retaining their existing assertions and timeouts. Exact repository
workspace/persistence tests pass (2), ReviewDiscussionEmpty passes (1), and the
three affected stack application/conflict/navigation families pass (21). Catalog
type/boundary checks pass with zero warnings across 381 production modules.
The consumer's prior unrelated skeleton warning/provenance omissions were fixed
by their owning task. Consumer results are recorded in jj-store
`E-COLUMN-HOVER-001`; no production workaround or dependency patch was added.

DC-SHA-036 remains Implemented; durable layout and registry dependency manifests
are unchanged. Stories remain visual-pending. Inherited AppShell ResizeObserver
and MergeEditor reactive notices remain explicit, outside this feature.
