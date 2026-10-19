# Sidebar boundary above the status footer

2026-10-19; enclosing Jujutsu change.

The user observed a doubled bottom boundary in the desktop left sidebar after
landing the full-width footer. In the standard desktop layout the sidebar is
inside `AppShellDesktopLayout`, so the original direct-child reset did not
reach it. The sidebar retained a 1px bottom border above the footer's own 1px
top border. Both are visible in the consumer's main Storybook.

DC-WS-003 now states that the footer supplies the sole horizontal boundary below
adjacent sidebars. Extend the owning AppShell selector to its direct desktop
layout children only when the shell has a status footer. Nested shells and
sidebar composition without a footer retain their existing behavior. No
consumer style override is introduced.

Exact before: `pnpm test:storybook
src/shared/workspace/status-bar/WorkspaceStatusBar.layout.stories.svelte
-t Stable` fails 1/1 (four other stories filtered out), observing `1px` instead
of `0px`. The regression opens the real left sidebar, checks its boundary with
the footer, and retains the footer's 1px separator.
`.local/verification/footer/sidebar-seam-before.log`.

The first two after attempts stop earlier at the existing stable repository-X
assertion while the main checkout's fonts load (92.703125px to 98.3125px).
The fixture now awaits the browser's font-ready promise before recording its
initial text geometry; the position assertion and configured deadline remain
unchanged. Logs: `sidebar-seam-after.log` and `sidebar-seam-after-repeat.log`.

Milestone review: approved footer geometry, fixed centre, notification and
Settings behavior are unchanged. Follow-up source/consumer verification and
packing are in progress; no release or visual-baseline mutation is authorized.

The exact font-ready rerun passes one case (four filtered), then the combined
tab/footer run passes all eleven cases in three files. Source type checking
initially rejects Testing Library's unsupported `exact` role option; use the
equivalent anchored accessible-name expression. Four subsequent source/consumer
type configurations pass with zero errors and warnings. Full units pass 836
cases in 135 files, including the newly requested Main body destination.

The first spec run rejects a non-atomic DC-WS-003 bullet; combine its boundary
clause into the existing footer sentence. `pnpm spec:check` then passes all
three lanes; no requirement is weakened. `pnpm fmt:check` and the no-utility
audit pass. Logs are `.local/verification/footer/{followup-types,followup-units,
followup-spec,followup-format,followup-utilities}.log`.

Two initial broad browser commands are cancelled without a completion claim:
the unrestricted command is replaced by bounded file-serial execution, then
the bounded attempt is interrupted to add the user's Main body menu request.
The final serial source run covers both follow-ups together. Earlier failed,
filtered and cancelled attempts remain distinct from completed qualification.

The first combined broad run observes one attachment-drawer failure and is
stopped for exact diagnosis. Its fresh exact case passes without edits, but the
next full file-serial run with `--bail=1` reproduces the issue: one failure and
380 passes before stopping. It measures 68px immediately after clicking collapse,
before the existing collapse transition reaches the unchanged 36px bound.
The story now awaits that same assertion with `waitFor`; its deadline and
geometry limit are unchanged. This is an unchanged-contract confirmation for
DC-CHAT-002 and DC-AI-011: no component, CSS, drawer interaction or disabled
behavior changes. Exact and complete serial qualification follow this fixture
repair. Logs: `followup-storybook.log`, `drawer-exact-before.log`,
`followup-storybook-final.log` and `drawer-exact-after.log` under the same log
directory.

The user then explicitly requested minimal testing to close this integration.
The final broad catalog run is stopped without a full-suite claim. Its focused
replacement covers all eleven footer/tab stories and the three repaired drawer/
menu cases; four new menu unit cases pass, followed by 836 full source units.
All four type configurations pass, and source types pass again after the
fixture-only readiness edits. The corrected specification check passes all
three lanes. The existing full formatting and utility audit also pass.

Public archive preparation and exact desktop acceptance remain the handoff;
new full catalog, pointer, static-build and visual matrices are deferred by the
user's final scope instruction. Original footer qualification remains intact.
