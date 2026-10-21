# Retained session popup workspaces

Desktop M7.2 extends the existing generic popup host and surface. Transfer now
publishes one final layout instead of briefly duplicating a moved tab. Failed or
throwing creation retains the source. The existing Move to menu returns a tab
to its last valid main pane, falling back to the first main pane.

Hosts may install asynchronous close admission; failed saving preserves tabs
and windows. Empty-host pruning for transfer bypasses destructive admission.
Native adapters can enter the same guard through the optional onCloseRequest
hook. Host listeners are disposed once; unexpectedly lost hosts return live
content to the main workspace. Final removal revalidates the affected host.

Popup mounts inherit all application contexts, retain mounted view identity on
appearance changes and maintain document-local keyboard, focus and overlay
presentation. Styles and inherited theme tokens mirror live with disposable
observers. The top-left top or stacked strip consumes the full public overlay
native-control inset without ribbon subtraction, including after split/resize.

Exact before/after:

- `pnpm exec vitest run --project unit src/shared/workspace/core/workspace-popout.spec.ts`:
  four failures before, four passes after.
- The controller/popout focused lane passes 27 cases. The complete unit lane
  passes 747 cases in 117 files.
- The existing browser popup overlay regression passes; menus and hover
  previews remain in their owning popup document.
- The complete Storybook interaction/accessibility lane passes 754 cases in
  226 files. Full strict type checks, static catalog and workspace browser
  acceptance pass as the individual lanes required by `pnpm checks`.
- Notes browser acceptance consumes the prepared public archive. Five cold
  cases cover retained note drafts/history, rejection/retry, independent
  windows, local palette, live theme and top/stacked 80px clearance across three
  viewport widths. Source and native evidence stay separate.

The actual popup pane menu initially failed because direct Bits UI portals
escaped to the main document. Tabs, stacked tabs, view headers and recursive
menu contents now honor the existing popup portal context. The exact real-menu
case changes from one failure to one pass; workspace pointer acceptance passes
all 15 cases. The shell and AI browser lanes pass all 11 and three cases after
their exact cold-readiness reruns. A Shadcn top-bar readiness failure passes on
the checkout-owned catalog. An intermediate concurrent Shadcn run stopped with
two additional failures; both exact serial reruns pass without source or
assertion changes. The final complete serial Shadcn run reports 82 passes, one
existing skip and one dark-dialog failure after the iframe navigated during
editing. Its exact `--grep 'dialog contract at 1280px in dark'` rerun passes.
The full runs and exact reruns cover all 83 executable cases with no remaining
failed target. The earlier top-bar run likewise reports 82/1/1, followed by its
exact passing rerun. These aggregate attempts are not reported as clean runs.

Specification checks pass validation, mdBook and mapped spec-first. Initial
missing mapped-chapter and malformed verification-ID failures were corrected
without changing the gates. Screenshot comparison was attempted without
baseline updates; Docker was stopped, so that non-blocking lane is unavailable.
Changed stories remain visual-pending.

The prepared archive is kept under `.local/packages` with its checksum recorded
by Desktop E-POPOUT-002. Registry manifests and lockfiles remain unchanged.
The final public archive is `lapismd-design-core-0.4.0-m72-menu.tgz`, SHA256
`0d31cc17e3be99bff4eea941de0ab828aabc5f94a12dddcf5a24ec6d3629a4fd`.
Tauri ordinary-app admission, native focused actions and physical traffic-light
qualification remain M7.3. Nothing is published or signed in this slice.
