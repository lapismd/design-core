# Opt-in shell layout extensions — 2026-10-22

## Resize observation — DC-SHELL-005

The Root and Sidebar measurement callbacks now coalesce reactive geometry
updates into animation frames and cancel pending frames when unmounted.
The AppShell story family records browser ResizeObserver loop errors without
suppressing browser reporting and asserts that no such errors occurred.

- Baseline: the exact three-story run passed but emitted two observer errors.
- Added diagnostic regression: 2 failures, 1 pass before the source change.
- After: the same command passed 3 tests, with zero observer diagnostics.
- Command: `pnpm test:storybook src/shared/shell/app-shell/AppShell.stories.svelte -t 'AutomaticTabletComposition|ConstrainedDesktopOverlays|ComposableSameSidePanelsAndSurfaceLayer' --reporter verbose`.
- Logs: `/tmp/dc-shell-resize-before.log`,
  `/tmp/dc-shell-resize-regression-before.log`,
  `/tmp/dc-shell-resize-after.log`.
- Screenshots and baseline updates are outside the user-approved scope.

## Opt-in layout API — DC-SHELL-004, DC-SHELL-006, DC-SHELL-007

- Topbar accepts an existing controller, explicit target and opt-in body
  placement. Topbar.Target stays outside scrolling content. Native hosts retain
  top placement. Teleports retain node identity and focus and skip redundant moves.
- Attached Sidebar variants derive logical joined edges from the visible direct
  siblings, including retained preview placeholders. Controllers, widths,
  priorities, closed/collapsed state and persistence remain independent.
- Sidebar.Section provides token-driven heading/actions/content spacing.
- SurfaceLayer adds contextual Close, fixed Footer, child-owned scrolling and
  responsive inset tokens. Nested popup Escape completes before page dismissal;
  a mobile page owns Escape ahead of the underlying panel stage.
- The existing RTL topbar measurement clipped its centre after its first frame.
  The measured RTL regression failed once before the physical edge calculation
  was corrected and passed once afterward. Logs:
  `/tmp/dc-shell-topbar-rtl-measured-before.log`,
  `/tmp/dc-shell-topbar-rtl-after.log`.
- Nested-popup Escape regression: 1 failure before; all 5 new interaction
  scenarios passed after the source correction. Public API token expectations
  were extended for the additive tokens; the full shell unit family passes 29.
- `pnpm check:types`: all four source/consumer lanes passed, zero errors/warnings.
- `pnpm spec:check`: validation, mdBook and Spec First passed.
- The first broad run passed 931 stories but hit 2 Emoji Picker failures under
  concurrent load. Its exact 3-story rerun passed without changing that family.
- A later aggregate attempt passed 914 units and governance, then stopped on an
  unformatted new story assertion; that file was formatted before final rerun.
- Initial browser attempts hit cold catalog readiness/navigation timeouts and
  one incorrect new resize-handle role query. The query now uses the public
  slider role, and navigation waits for DOM readiness plus actual story completion.
- Package preparation writes temporary tsconfig files that invalidate a running
  Vite catalog. Final package preparation and browser acceptance run sequentially.
- The final `pnpm packages:pack` passed clean consumer type/runtime/CSS checks
  after the RTL and header-token compatibility fixes.
- Baseline images, registry publication, consumer manifests and jj-store wiring
  remain unchanged. New examples stay visual-pending.

## Qualification at implementation commit

The completed `pnpm checks` constituents below passed after aggregate
startup/readiness retries. Shared-control browser qualification is still running;
the user explicitly requested committing the implementation now to unblock other
agents while checks continue. This is not evidence of one uninterrupted passing
aggregate invocation.

| Lane                                 | Result                                                      | Evidence                                   |
| ------------------------------------ | ----------------------------------------------------------- | ------------------------------------------ |
| Repository units                     | 914 passed in 142 files                                     | `/tmp/dc-shell-layout-checks-verified.log` |
| Turbo/release tooling units          | 3 and 16 passed                                             | `/tmp/dc-shell-layout-checks-verified.log` |
| Storybook interactions/accessibility | 939 passed in 271 files                                     | `/tmp/dc-shell-layout-checks-verified.log` |
| Source and strict public consumers   | All four type lanes passed, zero errors/warnings            | `/tmp/dc-shell-layout-types-final.log`     |
| Formatting and native CSS policy     | Passed                                                      | `/tmp/dc-shell-layout-checks-verified.log` |
| Canonical specification              | Validation, mdBook and Spec First passed                    | `/tmp/dc-shell-layout-checks-verified.log` |
| Static catalog and metadata          | Build passed, zero contract errors                          | `/tmp/dc-shell-layout-checks-verified.log` |
| Workspace browsers                   | 16 passed                                                   | `/tmp/dc-shell-layout-checks-verified.log` |
| Shell browsers                       | 15 passed, including four new extension cases               | `/tmp/dc-shell-layout-checks-verified.log` |
| AI browsers                          | Exact standalone rerun: 3 passed                            | `/tmp/dc-shell-ai-browser-rerun.log`       |
| Packed public consumer               | Type, runtime, CSS, font, theme and lifecycle checks passed | `/tmp/dc-shell-layout-packed-final.log`    |
| Offline shell guidance               | Updated guide rendered successfully                         | `/tmp/dc-shell-layout-guide.log`           |

The new browser cases retain menu/input node identity, focus, drafts and layout
across breakpoint changes and target removal; retain native top placement;
exercise attached-edge updates and keyboard-resized widths; and verify fixed
overlay footers, scroll ownership, mobile coverage/insets and state restoration.

The aggregate AI attempt had two readiness timeouts before assertions; its exact
standalone lane passed all three cases. A prior broad Storybook attempt had 70
shared setup import failures (`Unexpected token ':'`); the fresh exact Column
Canvas rerun passed 14 cases and the final full run passed all 939 stories without
changing those families. Duplicate aggregate retries were cancelled after their
already-qualified lanes completed.

The first final shared-control browser attempt reused an existing catalog on
port 9309 and was cancelled after four readiness timeouts before assertions.
Its log is `/tmp/dc-shell-shared-browser-final.log`; qualification uses a fresh
catalog on isolated ports 9670/9671 instead. No readiness timeouts or functional
assertions were weakened.

The isolated shared-control run found two repeatable Markdown assertion failures:
late stylesheet font-size propagation in `app-component-promotion.spec.ts:158`
and document editor height/background/line-height in
`chat-composer-actions.spec.ts:48`. Both failed again in the exact two-case rerun
(`/tmp/dc-shell-markdown-exact-rerun.log`). The same cases are being checked against
the parent revision `9362a4ba` without these shell extensions before assigning a
cause. A separate touch-composer case also hit story-readiness timeout; its exact
rerun is pending. No product or assertion changes were made for these findings.

Package validation retains the existing accepted low-severity KaTeX advisory
exception; it does not alter dependency or audit policy. Screenshot comparisons
and visual-baseline updates were not run, as requested.
