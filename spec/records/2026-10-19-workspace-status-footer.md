# Workspace footer design review — 2026-10-19

Status: source qualification complete; consumer handoff tracked by desktop E-CATALOG-009.

The user approved a dedicated full-width desktop workspace footer, left/centre/
right contribution placement, overflow before reducing the centre, and unchanged
mobile layout. A later instruction adds Settings at the bottom of the ribbon
while retaining the sidebar Settings button. The user then requested a pause
once Storybook is ready, before further tests and consumer migration.

## Source work

- Dedicated shell footer track and public 24rem centre-width token.
- Bounded centre messages, side overflow, retained custom status hosts and
  keyboard-operable public Popover composition.
- Separate centre activity and persistent right notification bell using the
  same notification manager and panel; Problems moves left.
- Remove status-only clearances from bottom panels, ribbon and grouped sidebars.
- Keep floating panes and minimized controls above the footer.
- Add ribbon Settings through the existing settings controller; sidebar retained.

## Verification before the pause instruction

- Initial isolated run with a shared node_modules symlink could not load the
  external test setup (one failed suite, no tests). Install this checkout's
  own frozen/offline dependencies; no source alias or policy bypass.
- `pnpm install --frozen-lockfile --offline --ignore-scripts`: passed.
- A first `-t 'Stable full-width footer'` filter selected no tests because
  Storybook transforms display names. The complete exact story file was run.
- `pnpm exec vitest run --project storybook src/shared/workspace/status-bar/WorkspaceStatusBar.layout.stories.svelte`:
  four baseline failures before implementation. Full-width and explicit
  composition measured a 313.46875px overlay in a 1200px shell; overflow and
  ribbon Settings were missing. Logs: /tmp/status-footer-before-stories.log.
- No automated tests or checks run after the user's review-first instruction.
  Starting the ordinary Storybook preview and resolving rendering errors are
  preview preparation only.

## Deferred at the design pause (historical)

- Exact before/after tests, custom-control/focus/overflow behavior, notifications,
  bounds, last-row reachability, themes and all direct-consumer regressions.
- Source types, specification checks, wider required suites, visual comparison,
  source packaging and verified downstream integration.
- Lapis alignment/manifest bridge updates, desktop/AI clearance removal and
  repository status placement remain unimplemented downstream.
- No package publication, visual-baseline update or product-gate promotion.

The isolated source workspace preserves unrelated default-workspace transcript
edits. This slice stays uncommitted pending requested review and verification.

## Open review preview

The isolated UI-only Storybook is running on port 9309. Open
http://127.0.0.1:9309/iframe.html?id=workspace-components-status-bar--footer-design-review&viewMode=story
for the full-height shell with centred activity, left repository/Problems, right
editor information and notification bell. Controls expose idle, long messages,
multiple tasks, overflow, sidebar opening, themes and ribbon visibility.

The first preview transform rejected a local capture of the reactive `review`
prop; initialization now runs from the ready callback. The preview renders after
that correction. A visual observation and /tmp/status-footer-review.png record
the footer and ribbon Settings placement; no interaction or accessibility suite
was executed after the requested pause. The browser tab is retained for review.

## Review adjustment — Problems status toggle

The user accepted the footer design and requested that its Problems status
button toggle the bottom panel. The status action now opens/closes that dock
without removing its tabs. Opening creates a Problems leaf only if absent and
reveals an existing bottom-dock Problems tab; a relocated leaf remains in place.
Show Problems retains its existing reveal-anywhere behavior. The existing unit
regression now includes close/reopen identity assertions, but remains unexecuted
under the requested test pause. Further tests and downstream integration are
still deferred.

## Qualification resumed after approval

The user approved the footer and resumed tests and implementation.

- Initial post-review exact run: three pass, two fixture timing failures and four
  `offref` teardown errors; fixture now uses the controller's `off` contract.
- The five footer stories pass, including geometry, idle centre reservation,
  custom mount identity/disposal, Escape focus return and ribbon Settings.
- Focused unit tests: 20 pass; includes separate centre activity, permanent bell,
  completion and disable cleanup, Problems toggle and overflow ordering.
- Existing bottom-panel clearance assertions now verify the footer-track contract;
  the nine reusable-shell stories pass, including a plugin menu in overflow.
- Group bounds compare CSS-pixel edges because Paneforge distributed a 0.03125px
  fractional remainder; real overflow remains guarded.
- All four source/consumer type lanes pass with zero errors/warnings after using
  the verified Mira row-comments archive (source 408809d3, SHA-256 1b0c2c60d1f7d219fd5d71c96c5e91d99727822cb1123932986804c378f1402b).
  Registry Mira lacks TableReader; no dependency source or package policy changed.
- First spec check caught atomic-bullet/sentence violations; corrected canonical
  prose and `pnpm spec:check` passes.
- Full unit lane: 135 files / 833 tests pass, tooling 3 tests and release 16 pass.
- Full formatting and source quality checks pass; the aggregate continues through
  static catalog, interaction and pointer lanes.
- An unrestricted browser run was cancelled under memory pressure; it exposed a
  real first-frame issue: overflow hid all entries before measurement. Keep them
  present until the first measurement. The exact AppShell/footer cold run then
  passes 16 cases with one worker. Full browser qualification continues bounded.
- Package preparation passes: public runtime/declarations, 254 browser-CSS files,
  zero remaining utility references. Final archive follows source qualification.

Consumer implementation: Lapis centre contribution projection and manifest
validation are implemented; regression was one failure before, 143 tests after.
Desktop repository status is moved left and AI overlay clearances removed.
Final consumer evidence and package revisions remain pending; no native gate,
publication or visual baseline is promoted.

## Navigation helper qualification

Further pointer runs exposed a real upstream readiness defect: navigation can
temporarily remove `document.documentElement`, and the exact-story helper threw
while reading its marker. The published-tag Visual Delta source now treats that
interval as pending, preserving exact identity and its configured deadline.
Source revision `011ed6aa19da43a796a4e1e70edf55eab00164c9` passes all 551 unit
tests, both types, specification, Node build and publint. Its built archive has
SHA-256 `c9a3b1e5e9b3bf0358446a27447f0a4407c6bbfd1b98b6efcffa37c7e28bf1c9`.

`node ../lapis-desktop/scripts/local-archives.mjs .local/archives/footer-cohort.json`
installs that verified archive alongside the previously verified Mira archive;
both public routes are checked and tracked dependency files are preserved.
The checkout-owned review server restarts on 9309, retaining the foreign 9310
listener. Cold pointer suites rerun in the disposable 9359/9360 lane. Earlier
null-root failures and cancelled shell/shadcn runs are retained as failed or
incomplete attempts, not counted as passes. No consumer dependency patch,
source alias, timeout increase or assertion removal is used.

## Broad source qualification

- `pnpm checks`: first attempt stopped at the corrected spec prose; second run
  passes governance, full formatting, four type lanes, utility audit, 833 units,
  tooling/release tests, static Storybook build and workspace metadata audit.
  The duplicate default browser continuation was stopped so the browser lane
  could use an explicitly serial browser process under the 16GB machine budget.
- `pnpm exec vitest run --project storybook --browser.fileParallelism=false`:
  all 249 files / 865 interaction and accessibility cases pass. Two earlier
  unrestricted/worker-limited runs were cancelled under memory pressure;
  maxWorkers does not limit this browser pool. No assertion or timeout changed.
- `STORYBOOK_PORT=9359 pnpm test:ai-chat-browser`: three real-browser tests pass.
- Cold workspace-pointer startup first exceeded the existing 120s readiness
  deadline. The next run starts, passes 14 of 16 tests, and times out on page
  loading for the first two cases before their assertions. Exact rerun and
  remaining pointer families are in progress with the unchanged deadlines.
- Static catalog emits the existing Mira circular-chunk and large-chunk
  advisories. No visual baseline is created or updated.

Desktop footer acceptance passes 28 working-copy interaction/axe cases across
both widths and themes. API full suite passes all 1162 tests; source API check,
build, public contract and governance pass. Broader consumer lanes continue.

## Restart recovery and bounded pointer execution

After the helper archive install, the complete workspace pointer lane passes
15 cases and the first toast story reaches its 15-second exact-marker deadline.
An exact retry then exceeds the existing 120-second server-start deadline. No
assertion, timer or identity requirement is changed. In the concurrent desktop
catalog, both light matrices pass, then the dark browser connection closes
before completion. The machine subsequently restarts and clears `/tmp` logs.

The already observed source, API, plugin and consumer results above remain
recorded. Unfinished lanes restart serially and new logs stay in ignored
`.local/verification/footer/`. The original exact toast case passes in a fresh
process (one case, 42.6 seconds including startup), with the same deadline and
assertions. The full pointer families follow before source completion.

Fresh post-restart pointer results:

- `WORKSPACE_STORYBOOK_PORT=9359 WORKSPACE_VISUAL_SERVER_PORT=9360 pnpm test:workspace:pointer --output=test-results/footer-workspace-reboot`:
  all 16 pass, including the formerly timed-out toast, resizing, dock moves,
  mobile gestures, floating/redocking and popout overlay interactions.
- `SHELL_STORYBOOK_PORT=9359 SHELL_VISUAL_SERVER_PORT=9360 pnpm test:shell:pointer --output=test-results/footer-shell-reboot`:
  all 11 pass, including mobile intent, full-height surfaces and documentation
  scrolling/rendering.
- Logs are `.local/verification/footer/workspace-pointer.log` and
  `.local/verification/footer/shell-pointer.log`. Each starts a new owned
  Storybook process. Required deadlines and assertions are unchanged.

The first post-restart shared-control lane (`pnpm test:shadcn:pointer`, with
9359/9360 and output `test-results/footer-shadcn-reboot`) passes 150 cases and
retains one existing Chromium skip for the WebKit-only overlay preference.
One bottom-panel integration case reaches its exact-story 15-second readiness
deadline before its assertions. A package preparation ran concurrently in that
attempt. The exact case and complete control lane rerun without concurrent
package preparation; no assertion or deadline changes. The first attempt remains
recorded in `.local/verification/footer/shadcn-pointer.log`.

The unchanged exact bottom-control case passes in a new process (one case;
35.4 seconds including startup). It also passes in the complete serial rerun;
final lane counts follow. Logs: `.local/verification/footer/bottom-pointer.log`
and `.local/verification/footer/shadcn-pointer-final.log`.

## Completed source qualification

`SHADCN_STORYBOOK_PORT=9359 SHADCN_VISUAL_SERVER_PORT=9360 pnpm test:shadcn:pointer --output=test-results/footer-shadcn-final`
passes 151 cases in the complete fresh-process rerun. One existing Chromium
skip belongs to the overlay-preference case that passes in WebKit. All 16
workspace, 11 shell and three AI-browser cases pass. No unresolved functional,
interaction or accessibility failure remains in the source lanes. The earlier
failed/cancelled attempts above remain part of the record.

The source gates now cover all four type lanes, 833 units, three tooling tests,
16 release tests, 865 catalog cases, static build, metadata audit and the real
pointer families. The aggregate `pnpm checks` invocation itself was cancelled;
its component lanes were completed with bounded browser execution. No claim of
an aggregate exit-zero run or visual-baseline comparison is made.

Source package preparation passes with 254 audited CSS files and no remaining
utility references. Final packaging follows the source ledger update. Desktop
consumes that archive and the committed API bridge through the existing verified
local graph; public package publication and native milestone gates remain
separate. The enclosing Jujutsu change owns source evidence and contract review.
