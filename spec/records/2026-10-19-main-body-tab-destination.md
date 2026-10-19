# Return sidebar tabs to the main body

2026-10-19; enclosing Jujutsu change.

The user requested a Main body destination alongside the existing sidebar
destinations in the workspace tab context menu. DC-WS-041 now covers that
destination and its disabled current-location state; DC-WS-030 maps the shared
menu presentation. DC-WS-076's existing Main window entry for popup tabs is
retained.

Root-hosted sidebar tabs previously failed the `moveTabToMain` admission check
because it rejected every root-window tab. The check now rejects only tabs
already inside the main tree. The existing target selection, move, activation
and state-preservation machinery remains in use, returning to the last valid
main pane and then the first pane. No new transfer or persistence contract is
introduced.

Exact before:
`pnpm test:unit src/shared/workspace/core/workspace-controller.spec.ts
-t 'pane menu|pane menu Move to'` fails four cases: the destination inventory
and moves from the left, right and bottom sidebars. Exact after passes all four
(22 filtered). Logs: `.local/verification/footer/main-body-{before,after}.log`.
The full menu unit also verifies that Main body is disabled for main tabs and
enabled for docked tabs; popup return coverage remains in the popout suite.

The new Workspace Tabs acceptance story uses the real AppShell, right sidebar,
tab menu and registered view. It edits a view counter, moves the tab through
the context menu and checks the selected main tab and retained counter. The
existing menu story checks the label, icon and disabled state. Both retain
visual-pending status without baseline mutation.

Milestone review: the existing main/sidebar menu surface remains Implemented;
this completes its missing reverse destination. Source and desktop public-archive
verification continue with the footer integration; no publication or native
qualification claim follows from these focused tests.

Final source acceptance passes all eleven tab/footer stories, all four type
configurations and 836 units in 135 files. The user explicitly requests minimal
remaining checks, so new broad matrices are deferred; the original source
qualification remains separately recorded. The prepared public archive and
exact desktop acceptance complete the handoff.
