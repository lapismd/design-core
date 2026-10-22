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

## Header review follow-up

Opt-in header-wide disclosure retains a native button, visible file/metadata
in its accessible name and independent trailing actions. Shared public tokens
support square continuous sections, separators, body-bottom spacing and inset
selected outlines. Defaults preserve existing composer presentation.

A label-content-name mismatch failed 1 of 16 source stories during development;
using the button's native text name corrected it. The same 16 cases then passed.
Strict type checking again reported 0 errors and 0 warnings. The spec's atomic
acceptance wording was corrected without changing its behavior requirements.
