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
the parent revision `9362a4ba` without these shell extensions. Both parent cases
also failed with the same expected/actual values, confirming pre-existing
failures in the Chat MarkdownContent/MarkdownComposer styling contracts
(`/tmp/dc-shell-markdown-baseline.log`). The parent reproduction used an empty
temporary Jujutsu workspace and the same installed registry dependencies; no
source files were changed. A separate touch-composer readiness timeout passed
its exact rerun (`/tmp/dc-shell-readiness-exact-rerun.log`). No product or assertion
changes were made for these findings.

The first isolated broad run was cancelled after 83 cases when later link-preview
and panel-toggle stories hit Svelte runtime render errors. The temporary parent
catalog shared the installed dependency cache, so its compilation could disturb
the running implementation catalog. The parent link-preview case passed. Both
catalogs were stopped, the temporary workspace was removed, and render checks
were restarted with only the implementation catalog active.
The fresh exact link-preview/panel-toggle group passed all nine cases without
source or assertion changes (`/tmp/dc-shell-render-fresh.log`).

The implementation was committed as `e6320c0d` at the user's request. Other
agents subsequently merged Chat work into `6f740f9c` in the same checkout. The
final shared-control rerun validates that integrated checkout; comparison with
the implementation commit confirms no changes to `src/shared/shell` or
`tests/shell`. The table above records the completed implementation checks rather
than claiming those earlier full-repository results apply to all later Chat work.

The integrated checkout also exposes Chat transcript failures outside the shell
implementation. Queue cancel/status buttons are covered by the author avatar in
`transcript-review.spec.ts:44` and `:298`; quoted list rows measure 23.09375px
against the 22px maximum in `transcript-review.spec.ts:169`. The exact rerun of
`:44` and `:169` reproduced both failures
(`/tmp/dc-shell-transcript-integration-rerun.log`). Source-navigation
cases at `transcript.spec.ts:99` and `:406` timed out because the comment editor
intercepts the source-navigation button. The rendered-comment spacing case at
`transcript.spec.ts:346` expected 21.7px line height but received 21px. These
findings belong to the Chat transcript/comment composition surface; no shell
source, Chat source, click
behavior or assertion was changed to bypass them. The broad browser lane remains
failing, and no passing root aggregate or release qualification is claimed.

## Completed browser integration run

- Command: `SHADCN_STORYBOOK_PORT=9670 SHADCN_VISUAL_SERVER_PORT=9671 pnpm test:shadcn:pointer`.
- Result: **145 passed, 8 failed, 1 skipped** in 12 minutes; all 154 cases completed.
- Log: `/tmp/dc-shell-shared-browser-complete.log`.
- The skip is the governed WebKit overlay-preference case in the Chromium
  project; its WebKit counterpart passed, as did all seven WebKit cases.
- The eight open failures are the two parent-reproduced Markdown failures and
  the six integrated Chat transcript cases described above. No shell source
  changes were made during these reruns, and these failures are not waived.
- The implementation's 15 shell browser cases and 939 Storybook
  interaction/accessibility cases passed before the Chat merge. The final
  integrated suite also passed the existing topbar and AppShell toggle cases.
- Validation was limited to local checks. No publication, push, consumer
  migration or visual-baseline update was performed.

Package validation retains the existing accepted low-severity KaTeX advisory
exception; it does not alter dependency or audit policy. Screenshot comparisons
and visual-baseline updates were not run, as requested.
