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

Source browser qualification is complete; packed consumer acceptance remains.
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
