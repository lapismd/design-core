# Complete CV Form story

## Boundary

- Story: `UI Forms/Examples/Complete CV Form`.
- Composition: `AppShell.Root -> Main -> Body`; the Body does not add a shell-level Scroll Area. At wide widths the structured pane owns a shadcn Scroll Area and YAML owns its editor scroll. Compact widths mirror CV Studio with a Form/YAML tab switch so the visible pane remains the only scroll owner and the page stays locked.
- Source snapshot: `/Users/stevejuma/code/cv/data/cvs/sample-cv.yml`, copied on 2026-08-11 into `sample-cv.fixture.yml` (9578 source bytes before the final newline).
- Ownership: the App Shell, split workspace, YAML orchestration, fixture, and
  four CV-domain configurations remain story-local. Typed path configuration,
  controllers, repeaters, renderer registries, and presentation variants are
  owned by Design Core. No dependency or CV repository change was made.
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
- [x] Match bullet, numbered, and reversed-numbered row focus treatment to the existing sortable list rows.
- [x] Let simple-entry dividers span their marker and field, align markers to the row start, and use wider Bullet marker spacing.
- [x] Remove duplicate and trailing dividers from sortable list rows, Social Networks, Target Roles, and Highlights.
- [x] Render Social Network with the same inline option picker as Theme, strengthen Add-action contrast, and make compact Add actions full width.
- [x] Keep the Text-section and Highlights-list add actions concise with the label `Add`.
- [x] Keep inline add actions subdued until hover/focus through shared FormAddButton and ListEditor styling.
- [x] Use the shared prominent Resizable handle variant for the CV-reference 4px separator and larger drag thumb.
- [x] Remove the redundant sibling-group top border so Design groups have one header divider instead of doubled boundaries.
- [x] Center disclosure chevrons against the title line box rather than title-row padding and divider space.
- [x] Keep configured section bodies visually attached to their headings with a shared 1px top inset.
- [x] Match Role History and Extra Details title dividers and full-width dashed add actions to the reference.
- [x] Render all Design, Locale, and Settings groups with CV Studio defaults.
- [x] Wire live per-tab YAML round-trip and deterministic reset.
- [x] Link a bounded consumer example from Forms Guidance.
- [x] Add the primary interaction story and deterministic reset-at-end coverage.
- [x] Run focused tests, repository checks, Storybook build, live wide/narrow/a11y acceptance, and compare-only visual checks.
- [x] Commit the model/YAML, shared layout, and rendered-story slices separately with Jujutsu.

## Type-safe configuration migration

- [x] Add `FieldValues`, typed object/array paths, exact path values, compatible
      renderer kinds, and public `defineFormConfig<TValues>()` inference.
- [x] Cover optional and nullable paths, including nullish propagation through
      optional ancestors such as `page.size`.
- [x] Add immutable path reads/writes, display-only defaults, and typed ancestor
      materialization without dropping unknown YAML keys.
- [x] Add isolated renderer registries with typed module augmentation,
      replacement/disposal, legacy-local precedence, and accessible missing-renderer
      output.
- [x] Add `createFormController<TValues>()` with dirty, touched, validation,
      focus, reset, disclosure, stable repeater identities, and async race handling.
- [x] Add collapsible groups, primitive/object arrays, discriminated variant
      arrays, markers, editable titles, add/move/remove, and nested disclosure to
      the shared renderer.
- [x] Add shared `stacked`, `subsection`, hidden-label, and panel add-button
      variants. `CompleteCvForm.css` now contains only shell/workspace composition;
      configured form styling is guarded by a unit boundary test.
- [x] Replace the custom Complete CV renderer, group renderer, callback configs,
      path mutation, disclosure, and identity helpers with four literal typed maps:
      CV, Design, Locale, and Settings.
- [x] Preserve all nine correlated entry variants, bullet/forward/reverse
      markers, redundant single-value labels as visually hidden accessible labels,
      locale default materialization, and YAML round-trip behavior.
- [x] Retain the legacy callback story and add typed path, explicit custom
      registry, and missing-renderer Storybook coverage.
- [x] Update the consumer source, Forms guidance, StructuredForm docs,
      `FORMS.md`, and the component audit.
- [x] Complete repository-wide build, live wide/narrow/a11y, and compare-only
      visual validation for this migration. Do not write a baseline.

## Validation evidence

- Config migration focused unit run: 8 files and 35 tests passed, covering path
  types/utilities/runtime defaults, all validation modes, async races,
  controller metadata, registry isolation, form layout ownership, YAML, and the
  story CSS boundary.
- Config migration focused Storybook run: 2 files and 5 stories passed,
  covering legacy callbacks, typed groups/repeaters, explicit/missing custom
  renderers, and Complete CV parity interactions.
- `pnpm check`: passed with zero errors or warnings after migrating all four
  fragments to literal `defineFormConfig` maps.
- Live Storybook geometry confirmed every profile field now spans the complete
  form row through the shared `FormFieldRenderer` subgrid selector; the two
  remaining tracks are only the intended label/value tracks inside each row.

- Focus-state follow-up: `pnpm exec vitest run --project storybook src/shared/forms/complete-cv-form/CompleteCvForm.stories.svelte` passed its interaction test, including computed focus-color parity between all three simple entry rows and `SortableArrayItem`.
- Focus-state follow-up: `pnpm check:no-tailwind` and `pnpm check` passed with zero errors or warnings. Live Storybook inspection confirmed BulletEntry, NumberedEntry, and ReversedNumberedEntry each retain keyboard/input focus and compute the same `--ui-form-accent` 8% background as Target Roles.
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
- Live wide and compact inspection confirmed the Skills, Patents, and Invited Talks add actions align to the right with 12px of space above; at the compact breakpoint they span the repeater width. Text-section and Highlights-list actions render exactly `Add`, with no legacy `Add text`, `highlight`, or `Add highlight` labels remaining.
- Latest live inspection confirmed Bullet, Numbered, and Reversed Numbered dividers span the full marker-and-field row while nested field borders are suppressed. Every marker has a 0px leading inset; Bullet marker spacing is 10px versus the 6px numeric default. Inline Add actions rest at 62% foreground opacity and become fully opaque on hover. The prominent split separator measures 4px with a 10px by 40px thumb, matching the CV Studio reference proportions.
- Latest focused validation passed: 2 core unit files with 10 tests, `pnpm check`, `pnpm check:no-tailwind`, and 2 Storybook files covering Complete CV plus the base Resizable story. The Storybook run retained the global zero-confirmed-violation a11y gate.
- Design divider investigation found the shared group header and next-group wrapper both owned the same boundary. After removing the wrapper border upstream, live Design inspection confirmed all 22 groups have a 0px top border and retain one approximately 1px header divider. The focused unit and Complete CV Storybook regressions passed.
- Design chevrons were approximately 2.1px low because the absolute toggle used 50% of a row that included 3.2px bottom padding and the divider, while the title occupied the first 24px. The shared FormSectionHeader now centers against an overridable title-line-height token; live inspection reports a 0px center delta for all 22 Design groups, and the component plus Complete CV Storybook tests passed.
- Browser-marker inspection isolated the post-heading gap to the shared configured-array section body rather than FormSectionHeader. Its top inset is now 1px while the 20px left indent, 12px bottom inset, and original 3.2px header padding remain unchanged; the focused Complete CV interaction test and live computed-style check passed.
- Final migration validation passed `pnpm check`, `pnpm check:no-tailwind`, Docs MCP typechecking, the focused Complete CV Storybook interaction, `pnpm build-storybook`, and `pnpm workspace:visual:audit` with 112 stories, 0 visual failures, 0 orphan baselines, and 0 contract errors.
- `pnpm test:visual:affected` selected the full 422-scenario compare-only fallback because the uncommitted stack contains the globally scoped Forms Guidance input. The story remains a missing-baseline warning; no baseline was written.
- `pnpm test:visual`: all 422 compare-only capture scenarios executed successfully in 15.6 minutes. The new story produced `outcome: missing-baseline` with warning policy under the canonical Linux ARM64 profile; no reference image was written.

## Visual baseline

Status: `visual-ready`. The canonical compare-only result is `missing-baseline`, pending human review. No reference screenshot was created or updated; the generated actual capture remains an ignored local artifact.
