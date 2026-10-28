# Split context controls and sticky gutters

DC-DIFF-008 / DC-DIFF-003 follow-up: the newly supported split fold row had no
number gutter, so its controls scrolled over the continuous gutter rail. The
split fold controls now sit beside the same empty, opaque sticky gutter used by
code rows. Expanded code keeps its own gutters and horizontal scrolling.
No z-index escalation, new theme tokens or consumer selector patches are needed.

## Targeted evidence

- `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.stories.svelte -t 'ExpandsCollapsedContextInSplitPanes'`:
  one failed / twelve unselected before; one passed / twelve unselected after.
  The regression scrolls both panes horizontally and uses elementFromPoint to
  prove the opaque gutter paints over fold controls at the number-rail position.
  Existing reveal/hide, shared state and old/new line-number assertions remain.
- The full FileDiff story family passed thirteen interaction/accessibility
  cases. Strict Svelte/TypeScript reported zero errors and warnings.
- `pnpm spec:check` passed all three lanes; scoped formatting and spec-first
  passed. No model logic changed, so the unchanged pure model suite was not rerun.
- The prepared local archive uses suffix `-split-gutter-review-built` and SHA-256
  `54d56f7b52fc6117ca46737b85a7891de18a7b47aa9ae43e52726d18bbdb33f6`.
  `packLocal` retained public source/declarations and audited 265 browser CSS
  files with zero utility references. Agent UI's ignored review overlay consumes
  this archive while registry manifests and lockfile remain unchanged.

The user requested targeted checks and review before broad suites, downstream
application changes or publication. Visual baselines remain unchanged.
