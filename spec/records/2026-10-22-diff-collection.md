# Diff collection composition

DC-DIFF-003 / DC-DIFF-008: the existing composer accepts a typed `fileContent`
body and exposes disclosure semantics. `FileDiff` accepts `sizing="content"`
while preserving default fill sizing and the existing diff renderer.

Exact regression: `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.composition.stories.svelte`
reproduced 2 failures before implementation. The same scenarios and the directly
affected FileDiff and filename-header stories passed: 16 interactions/a11y cases.

`pnpm exec svelte-check --tsconfig tsconfig.json --fail-on-warnings`: 0 errors,
0 warnings. `pnpm spec:check`: all 3 lanes passed. Broad suites and visual baseline
changes are deferred until the user's final screen review. Source applications
are unchanged. The consumer will use a documented prepared review archive.
