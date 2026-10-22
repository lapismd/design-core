# Diff collection selection and header interaction

DC-DIFF-003: inset selection now paints through an inert layer above opaque
diff panes, sticky headers and gutters. The original outer outline retains
positive-offset defaults. Semantic hover and focus backgrounds are public tokens;
the selected header retains its separate tint.

Exact baseline:
`pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.composition.stories.svelte -t 'SelectedCollectionFrameAndHeaderHover'`:
1 failed, 2 unselected (no selection layer). After implementation the same target
passed as part of the focused family. Pointer simulation initially failed to
drive CSS hover; the portable story now uses native focus, while consumer browser
acceptance drives real pointer hover and checks painted side pixels.

`pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.stories.svelte src/shared/diff/file-diff/FileDiff.composition.stories.svelte`:
16 interaction/accessibility cases passed. `pnpm spec:check`: all 3 lanes passed.
Changed-file Prettier checks passed. No full suites or baseline updates were run;
visual review remains pending. Unrelated AppShell work is excluded from this slice.

## Opaque sticky-header follow-up

A translucent selected-header token previously replaced the entire background.
The source now layers normal, selected and hover/focus tints over the existing
opaque `--ui-diff-surface`, matching the split gutter's established composition.
No token defaults or public props change.

Exact reproduction: `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.composition.stories.svelte`: 1 failure and 2 passes. The selected header backing was `rgba(138, 92, 245, 0.2)`. The name-filtered attempt selected zero tests and is not passing evidence.

After repair, `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.stories.svelte src/shared/diff/file-diff/FileDiff.composition.stories.svelte`: all 16 interaction/accessibility cases passed. The source probe checks solid backing with an alpha selection token; the consumer additionally checks actual pixels behind a scrolled sticky header in both logs/themes. Full suites and visual baselines remain deferred for human review.
