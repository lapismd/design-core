# Complete CV Form story

## Boundary

- Story: `UI Forms/Examples/Complete CV Form`.
- Composition: `AppShell.Root -> Main -> Body`, with Body as the sole page scroll owner.
- Source snapshot: `/Users/stevejuma/code/cv/data/cvs/sample-cv.yml`, copied on 2026-08-11 into `sample-cv.fixture.yml` (9578 source bytes before the final newline).
- Ownership: all implementation is story-local. There are no Design Core exports, dependencies, or CV repository changes.
- Reference parity: the populated CV Studio Sample CV is the visual source. The wide layout keeps the structured form and active fragment YAML visible together; compact widths stack them without adding another page scroll owner.
- Out of scope: persistence, routing, preview/rendering, evidence, and AI review.

## Checklist

- [x] Snapshot the complete John Doe fixture.
- [x] Add typed source, entry, path, UI identity, default factory, and movement helpers.
- [x] Add wrapped/unwrapped fragment YAML parsing, minimum structural validation, and invalid-text preservation.
- [x] Build the body-only App Shell, tabs, toolbar, and responsive form/YAML layout.
- [x] Render CV profile, networks, roles, all nine section types, and nested repeatables.
- [x] Render all Design, Locale, and Settings groups with CV Studio defaults.
- [x] Wire live per-tab YAML round-trip and deterministic reset.
- [x] Link a bounded consumer example from Forms Guidance.
- [x] Add the primary interaction story and deterministic reset-at-end coverage.
- [x] Run focused tests, repository checks, Storybook build, live wide/narrow/a11y acceptance, and compare-only visual checks.
- [x] Commit the model/YAML, shared layout, and rendered-story slices separately with Jujutsu.

## Validation evidence

- `pnpm exec vitest run --project unit src/shared/forms/form-field/FormField.layout.spec.ts src/shared/forms/complete-cv-form/complete-cv-form.model.spec.ts`: 2 files and 11 tests passed.
- `pnpm exec vitest run --project storybook src/shared/forms/yaml-editor/YamlEditor.stories.svelte src/shared/forms/complete-cv-form/CompleteCvForm.stories.svelte`: 2 files and 4 tests passed, including the primary interaction and Storybook a11y checks with zero confirmed violations.
- `pnpm check` and `pnpm check:no-tailwind`: passed with zero errors or warnings.
- Scoped Prettier verification for every changed file: passed. Repository-wide `pnpm fmt:check` remains blocked only by six pre-existing unrelated files: `src/shared/shadcn/column-canvas/column-canvas-controller.svelte.ts`, `src/shared/workspace/about-dialog/WorkspaceAboutDialog.css`, `src/shared/workspace/about-dialog/WorkspaceAboutDialog.stories.svelte`, `src/shared/workspace/core/app-workspace.ts`, `src/shared/workspace/explorer/tree.ts`, and `src/shared/workspace/explorer/WorkspaceExplorer.css`.
- `pnpm checks`: reached the same pre-existing six-file `fmt:check` gate and stopped before its remaining commands, so the focused checks and compare-only visual run were executed separately.
- `pnpm build-storybook`: passed; Vite emitted only its existing large-chunk advisory.
- `pnpm workspace:visual:audit`: passed with 112 workspace stories, 0 visual failures, 0 orphan baselines, and 0 contract errors.
- Live Storybook acceptance passed at 1426 x 990 and 386 x 835. The App Shell body remained the sole page scroll owner, initial horizontal overflow was zero, the compact view stacked the full form before YAML, lower CV entries were explicitly inspected, and keyboard arrow navigation moved between tabs.
- `pnpm test:visual`: all 422 compare-only capture scenarios executed successfully in 15.6 minutes. The new story produced `outcome: missing-baseline` with warning policy under the canonical Linux ARM64 profile; no reference image was written.

## Visual baseline

Status: `visual-ready`. The canonical compare-only result is `missing-baseline`, pending human review. No reference screenshot was created or updated; the generated actual capture remains an ignored local artifact.
