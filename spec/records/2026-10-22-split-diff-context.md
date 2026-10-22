# Split diff context parity

DC-DIFF-003: Agent UI's long JJ Log example exposed that FileDiff's unified
reader used the collapsed display model while split panes paired the complete
unfiltered rows. JJ Log defaults to split, so the earlier unified-only consumer
regression did not cover this gap.

The split reader now pairs visible runs from the same display model and retains
the existing collapsed controls between runs. Both panes share expansion state;
incremental/full reveal and hide apply to both sides. Changed-row pairing and
original old/new gutter numbers remain intact. There is no consumer CSS patch
or duplicate diff implementation.

## Focused qualification

- Before the fix, `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.stories.svelte -t 'Expands'`
  had one pass, one failure and eleven unselected cases. The split example
  incorrectly mounted all unchanged rows. An earlier filter containing spaced
  story names selected zero cases and supplies no pass evidence.
- Consumer before state: `pnpm exec playwright test --config .local/live-chat.config.ts tests/jj-operation-presentation.pw.ts -g 'retained context'`
  passed both unified cases and failed both split cases because the reveal
  controls were absent.
- After the fix, the same source `-t 'Expands'` target passed both cases, with
  eleven unselected. The complete FileDiff story family then passed all thirteen
  interaction/accessibility cases, including reveal/hide from opposite panes,
  incremental expansion, retained line identity, wrapping and scroll synchronization.
- `pnpm exec vitest run --project unit src/shared/diff/core/unified-diff.spec.ts src/shared/diff/file-diff/split-display.spec.ts`:
  fourteen passed, including preserved changed-row pairing around folded context.
- `pnpm exec svelte-check --tsconfig tsconfig.json --fail-on-warnings`:
  zero errors and warnings.
- The first `pnpm spec:check` rejected a two-sentence acceptance bullet; the
  requirement was rewritten as one atomic bullet without relaxing validation.
- Final `pnpm spec:check` passed all three lanes; scoped formatting and
  `pnpm spec:first` passed.
- `packLocal(process.cwd(), {retainSource: true, suffix: "-split-context-review-built"})`
  prepared the public review archive with declarations and browser CSS:
  `.local/packages/lapismd-design-core-0.6.0-split-context-review-built.tgz`, SHA-256
  `8c0e605a564a1f4417512cb3e88cd8fe193130fb5e4729cd3f334e72933f9927`.
  All 265 audited CSS files had zero utility references. Agent UI consumes this
  through its existing ignored review overlay; portable npm ranges remain intact.

This is a targeted review slice. Full suites, other consumers, static matrices,
publication and visual baseline changes remain deferred until final review.
