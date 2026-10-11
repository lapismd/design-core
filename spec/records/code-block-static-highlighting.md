# CodeBlock bundled syntax colors

The consumer regression in jj-store reproduced token text without visible color
under the served application's strict Content Security Policy. CodeBlock's
`highlightMode="spans"` also called `ensureHighlightStyles`, whose style element
was rejected by that policy. The development annotation policy permits injected styles, so the focused
strict-policy browser test exposed the production gap.

The owning change `ummolzql` moves the existing span and CSS Highlight API rules
to `highlight-styles.css`, imported by the public highlight module. The exported
`ensureHighlightStyles` function remains as a compatibility entry point, with no
runtime style insertion. Syntax tokens, tokenizer behavior, safe source text,
public component props and theme overrides retain their contracts. No registry
publication or package-version change is included.

## Focused evidence

- `pnpm exec vitest run --project storybook src/shared/shadcn/code-block/CodeBlock.stories.svelte` before the fix: 8 pass, 1 fail; ForceSpansMode loses its token color when injected styles are disabled.
- `pnpm exec vitest run --project storybook src/shared/shadcn/code-block/CodeBlock.stories.svelte src/shared/diff/file-diff/FileDiff.stories.svelte src/shared/diff/merge-editor/MergeEditor.stories.svelte` after the fix: 32 pass in a fresh runner.
- `pnpm check:types`: zero errors and warnings in the package, shell, filter and strict-source consumers.
- Initial `pnpm checks`: blocked by three pre-existing sentence/length diagnostics in DC-AI-004; condensed the two bullets without changing their behavior.
- Second `pnpm checks`: governance and 715 unit tests pass, formatting stops on verification.md; its existing verification row was updated for this evidence and the table formatted.

## Consumer acceptance

jj-store uses its existing documented file-package hook for local validation;
`pnpm install --lockfile=false` refreshes the installed source without changing
its published dependency range or tracked registry lockfile. `pnpm dev:restart`
rebuilds the public source imports. Live recorded and unsaved Markdown Source
show a purple heading distinct from foreground text with zero injected
CodeBlock styles; the test draft was cancelled without publication.

Visual baseline approval remains separate from interaction and accessibility
evidence. The final `pnpm checks` run passes: governance, repository formatting,
package and strict-consumer types, 715 unit tests, three Turbo tests, the static
Storybook build and metadata audit, 639 stories, 14 Workspace pointer tests,
11 Shell browser tests, three AI browser tests, and 35 shadcn browser tests
(with one existing skipped case). Final `pnpm spec:check` passes all three
lanes; changed-file Prettier checks pass.

The consumer passes 51 directly affected stories and all 11 browser scenarios
across final focused runs, including strict-policy Markdown colors and literal
script-byte safety. jj-store's canonical and progress gates pass.

`STORYBOOK_PORT=9040 pnpm test:visual:affected` builds the isolated Docker
catalog successfully, then stops with EACCES while publishing its canonical
build-cache entry under `/visual-delta/canonical-build-cache/entries` before
image comparison. A separate dirty Visual Delta global input selects its
full-suite fallback; that sibling work was preserved. No baseline was changed.
Visual comparison is non-blocking under parent workspace guidance and remains
pending; no pixel comparison or visual approval is claimed.

Run artifacts: `/tmp/design-core-code-highlight-before.log`,
`/tmp/design-core-code-highlight-after.log`,
`/tmp/design-core-code-highlight-checks.log`,
`/tmp/design-core-code-highlight-checks-final.log`,
`/tmp/design-core-code-highlight-checks-repaired.log`,
`/tmp/design-core-code-highlight-types.log`,
`/tmp/design-core-code-highlight-spec-final.log`,
`/tmp/design-core-code-highlight-format-final.log`, and
`/tmp/design-core-code-highlight-visual.log`.
