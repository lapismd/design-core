# Workspace pointer repairs

Work is performed in the clean default Design Core workspace, starting from
`f7640dea`. This closes the seven Workspace failures deferred during the shared
component slice; other workspaces, package versions and consumers are unchanged.

## Baseline and diagnosis

- `pnpm test:workspace:pointer --grep 'centre drop shows the full overlay'`:
  1 failed, because no native drag starts and the target overlay never appears.
- `pnpm test:workspace:pointer`: 8 passed, 7 failed. The failures are centre
  intake, empty-sidebar intake, edge splitting, top-tab insertion, main-to-sidebar
  insertion, sidebar-group splitting and dragging outside panes to float.
- On the unchanged demo, the Plan tab is about 81px wide, but its draggable title
  button is 0px wide. The compact container rule collapses the button as well as
  its label. A real browser hit test lands on the surrounding static container.
- Restoring the button's flex growth gives it about 27px of available width and
  makes the same native mouse gesture show the overlay and move the tab. The
  label remains collapsed. Icon-menu and close controls remain separate.
- That first repair passed 13/15 native cases, leaving top-tab and sidebar
  insertion failures. Hover replaces the inactive icon with a close control,
  shifting the title button under an already-positioned mouse. A new exact
  hover regression fails 1/1 on that intermediate source. Compact title buttons
  now retain a fixed inset hit region beneath the separate menu/close controls,
  whose paint and pointer priority remain above the title button.
- Pointer acceptance previously awaited document readiness and fonts before
  Storybook finished rendering or playing the requested story. It now awaits
  the public story-finished boundary using the existing 45-second bounded
  framework window, then settles fonts. No fixed startup sleep is added.

## Regression evidence

The exact centre-drop command passes after the production fix. Its regression
also requires a nonzero, native-draggable source button. The constrained Tabs
story now checks that collapsed labels retain nonzero title-button geometry
when space remains beside the menu and close controls.

Baseline logs: `/tmp/dc-workspace-centre-before.log` and
`/tmp/dc-workspace-before.log`. Focused repair log:
`/tmp/dc-workspace-centre-after.log`.

Changed stories remain `visual-pending`; screenshot baselines are not updated.

## Final functional qualification

- The new hover regression fails 1/1 before the stable-hit-region repair; the
  same case plus both remaining insertion cases pass 3/3 afterward. Logs:
  `/tmp/dc-workspace-hover-before.log` and
  `/tmp/dc-workspace-insertion-after.log`.
- `pnpm checks` passes in full with no functional, interaction or accessibility
  failures: canonical specification, full formatting, all four type lanes,
  native-CSS audit, 815 unit tests, tooling/release-helper tests, production
  Storybook build, visual metadata audit, 826 Storybook tests, 16/16 Workspace
  browser cases, 11/11 Shell cases, 3/3 AI cases and 140 Shadcn browser cases
  with one existing browser-specific skip. Log: `/tmp/dc-workspace-checks.log`.
- Workspace acceptance uses a fresh process and covers every formerly failing
  scenario, plus fixed hover geometry, selection, context-menu dismissal and
  closing. All seven previously deferred failures are resolved.
- `pnpm packages:pack` passes clean registry installation, public consumer type
  checking and cold development/production runtime checks without Tailwind.
  All 253 browser CSS files are audited with zero remaining utility references;
  the archive contains the fixed compact-tab rules. The existing approved
  KaTeX audit exception remains unchanged. Log: `/tmp/dc-workspace-pack.log`.

Visual comparison is separate from these functional results. The constrained
Tabs and pointer-demo stories retain `visual-pending` status, with no approval
or screenshot-baseline mutation included in this repair.

## Visual comparison boundary

The compare-only command targeted
`workspace-components-tabs--constrained-hidden-scrollbar-row` and
`workspace-demo-reusable-framework--pointer-drag-surface`, using the pinned
capture image with `--fresh --failure-mode strict`. Its Storybook build was
killed with exit 137 after 5m16s. The container reported a 2.843 GiB memory
limit and about 2.493 GiB in use while the build was running. No screenshot
comparison completed; this lane is pending, not passing.

The runner also rejected `spec/records/community-components.md` as a forbidden
return artifact after that host evidence file was updated while the isolated
snapshot was building. The tracked main tree remained clean and committed;
no returned artifact or screenshot baseline was applied. Evidence edits should
wait until compare-only captures finish. Log: `/tmp/dc-workspace-visual.log`.

This does not change the successful local production build, full repository
checks, packed-consumer acceptance or resolved Workspace failure count above.
