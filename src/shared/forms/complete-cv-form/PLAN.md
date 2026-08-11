# Complete CV Form story

## Boundary

- Story: `UI Forms/Examples/Complete CV Form`.
- Composition: `AppShell.Root -> Main -> Body`; the Body does not add a shell-level Scroll Area. At wide widths the structured pane owns a shadcn Scroll Area and YAML owns its editor scroll. Compact widths mirror CV Studio with a Form/YAML tab switch so the visible pane remains the only scroll owner and the page stays locked.
- Source snapshot: `/Users/stevejuma/code/cv/data/cvs/sample-cv.yml`, copied on 2026-08-11 into `sample-cv.fixture.yml` (9578 source bytes before the final newline).
- Ownership: the CV composition remains story-local. The generic repeated-row border correction is owned by the existing `SortableArrayItem` and `ListEditor` styles. There are no Design Core exports, dependencies, or CV repository changes.
- Reference parity: the populated CV Studio Sample CV is the visual source. The wide layout keeps the structured form and active fragment YAML visible together; compact widths switch between the two full-height panes using the same mobile-tab pattern as CV Studio.
- Out of scope: persistence, routing, preview/rendering, evidence, and AI review.

## Checklist

- [x] Snapshot the complete John Doe fixture.
- [x] Add typed source, entry, path, UI identity, default factory, and movement helpers.
- [x] Add wrapped/unwrapped fragment YAML parsing, minimum structural validation, and invalid-text preservation.
- [x] Build the body-only App Shell, tabs, toolbar, and responsive form/YAML layout.
- [x] Replace the mode toggle and YAML header with a 48/52 resizable form/YAML split using the installed shadcn Resizable composition.
- [x] Keep the form pane in the installed shadcn Scroll Area at every width, with no native page or tab-panel scroll handoff.
- [x] Switch between full-height Form and YAML panes on compact viewports while retaining the resizable split at wide widths.
- [x] Retain the App Shell border, radius, and equal outer inset at compact and body-only desktop widths.
- [x] Remove the YAML editor's leading inset and preserve a stacked compact layout.
- [x] Render CV profile, networks, roles, all nine section types, and nested repeatables.
- [x] Match simple-entry presentation with bullets, forward numbering, reversed numbering, and visually hidden repeated field labels.
- [x] Remove duplicate and trailing dividers from sortable list rows, Social Networks, Target Roles, and Highlights.
- [x] Render Social Network with the same inline option picker as Theme, strengthen Add-action contrast, and make compact Add actions full width.
- [x] Match Role History and Extra Details title dividers and full-width dashed add actions to the reference.
- [x] Render all Design, Locale, and Settings groups with CV Studio defaults.
- [x] Wire live per-tab YAML round-trip and deterministic reset.
- [x] Link a bounded consumer example from Forms Guidance.
- [x] Add the primary interaction story and deterministic reset-at-end coverage.
- [x] Run focused tests, repository checks, Storybook build, live wide/narrow/a11y acceptance, and compare-only visual checks.
- [x] Commit the model/YAML, shared layout, and rendered-story slices separately with Jujutsu.

## Validation evidence

- `pnpm exec vitest run --project unit src/shared/forms/complete-cv-form/complete-cv-form.model.spec.ts src/shared/forms/form-field/FormField.layout.spec.ts`: 2 files and 14 tests passed, including marker ordering, root-scoped sortable borders, and responsive Add-action rules.
- `pnpm exec vitest run --project storybook src/shared/forms/complete-cv-form/CompleteCvForm.stories.svelte src/shared/shell/app-shell/AppShell.stories.svelte`: 2 files and 11 tests passed, including sample reset, compact Form/YAML switching, pane-only scroll ownership, equal shell insets, App Shell compact framing, YAML round-trip, and representative controls.
- `pnpm check` and `pnpm check:no-tailwind`: passed with zero errors or warnings.
- Scoped Prettier verification for every changed file: passed. Repository-wide `pnpm fmt:check` remains blocked only by six pre-existing unrelated files: `src/shared/shadcn/column-canvas/column-canvas-controller.svelte.ts`, `src/shared/workspace/about-dialog/WorkspaceAboutDialog.css`, `src/shared/workspace/about-dialog/WorkspaceAboutDialog.stories.svelte`, `src/shared/workspace/core/app-workspace.ts`, `src/shared/workspace/explorer/tree.ts`, and `src/shared/workspace/explorer/WorkspaceExplorer.css`.
- `pnpm checks`: reached the same pre-existing six-file `fmt:check` gate and stopped before its remaining commands, so the focused checks and compare-only visual run were executed separately.
- `pnpm build-storybook`: passed; Vite emitted only its existing large-chunk advisory.
- `pnpm workspace:visual:audit`: passed with 112 workspace stories, 0 visual failures, 0 orphan baselines, and 0 contract errors.
- Earlier live Storybook acceptance passed at 1426 x 990 and 386 x 835 for the resizable split, YAML alignment, simple-entry markers, and horizontal-overflow checks; the compact stacked-layout result from that pass was superseded by the Form/YAML mobile-tab follow-up below.
- Follow-up live acceptance against CV Studio's `CvWorkspaceHost` scroll chain passed at 1267 x 713 and 515 x 835. Wide mode kept both resizable panes visible; compact mode exposed Form/YAML tabs and only the selected full-height pane. The document, shell body, and top-level tab panel remained non-scrollable, while the form viewport reported `overflow-y: scroll`, hidden native scrollbar chrome, and a mounted shadcn scrollbar/thumb. The YAML view retained only CodeMirror scrolling.
- Live compact geometry confirmed equal 8px App Shell insets, a 14px shell radius and 1px border, full-width Social Networks and Target Roles Add actions, and full-width 46px dashed actions with title dividers for Role History and Extra Details.
- Live DOM inspection confirmed `•` for all five Selected Honors rows, `1.` through `3.` for Patents, `4.` through `1.` for Invited Talks, no visible `Text` label for the Welcome to RenderCV entries, one root divider per sortable row, and no trailing divider on the final list or Social Networks row.
- `pnpm test:visual:affected` selected the full 422-scenario compare-only fallback because the uncommitted stack contains the globally scoped Forms Guidance input. The story remains a missing-baseline warning; no baseline was written.
- `pnpm test:visual`: all 422 compare-only capture scenarios executed successfully in 15.6 minutes. The new story produced `outcome: missing-baseline` with warning policy under the canonical Linux ARM64 profile; no reference image was written.

## Visual baseline

Status: `visual-ready`. The canonical compare-only result is `missing-baseline`, pending human review. No reference screenshot was created or updated; the generated actual capture remains an ignored local artifact.
