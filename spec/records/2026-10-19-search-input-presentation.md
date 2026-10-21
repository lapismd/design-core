# Search input focus and suggestion presentation

Enclosing Jujutsu change: `orqzopnl`. Requirements: DC-FILTER-003 and
unchanged DC-FILTER-006. Source package: Design Core 0.5.1; pnpm 10.34.5;
macOS ARM64; fresh-process Chromium Storybook/Vitest 4.1.11.

## Behavior and ownership

SearchFilterInput and SearchFilterBar now share the installed shadcn Input's
resting border token, transparent focused border, and 3px 50% theme ring,
including ancestor `--ui-input-*` overrides. The existing borderless option
and invalid-state background/diagnostic contract remain intact. Plain and
CodeMirror inputs use the same outer chrome. Completion popups explicitly use
the sans font, with labels above wrapping descriptions in one bounded column,
adapted from the existing composer suggestions stylesheet. No query execution,
grammar, public props, lifecycle or host authority changes.

## Verification

- Initial name-filtered Storybook attempt matched zero tests (3 skipped);
  reran by exact files without a name filter.
- `pnpm test:storybook src/shared/filter/search-filter-bar/SearchFilterInput.presentation.stories.svelte src/shared/filter/search-filter-bar/SearchFilterInput.stories.svelte`:
  before 2 failures/1 pass (border mismatch and same-line label/detail);
  after CSS fix 3 passes. Logs: `/tmp/design-core-search-{before,after}.log`.
- Added a long-path value-completion example. Initial family run: 11 passes,
  1 failure from the new fixture's missing required operators; initial type
  run also identified that omission. Corrected the typed fixture and moved its
  caret to the end before requesting value suggestions.
- `pnpm test:storybook src/shared/filter/search-filter-bar`: final 12 passes
  across 4 files, including interaction/accessibility checks, light/dark and
  ancestor-override comparison with real shadcn Inputs, plain/custom editors,
  field/operator/value layouts, keyboard insertion, popup ownership and the
  existing borderless/invalid custom-language lifecycle. Log:
  `/tmp/design-core-search-family-final.log`.
- `pnpm test:unit src/shared/filter`: 80 passes across 5 files. Log:
  `/tmp/design-core-search-unit.log`.
- `pnpm check:types`: source, shell/filter and strict source consumer checks
  pass without errors or warnings; `/tmp/design-core-search-types-final.log`.
- `pnpm check:no-tailwind`: pass, with no source utilities.
- Initial `pnpm spec:check` rejected a multi-sentence acceptance bullet;
  condensed it to the required single sentence before rerunning.
- After quoting the long-path insertion fixture, reran its exact presentation
  stories; `/tmp/design-core-search-presentation-final.log`.
- Final presentation stories: 2 passes; the fixture inserts a quoted path.
- Scoped Prettier passes; final `pnpm spec:check` passes validation, mdBook and
  spec-first (3 lanes), `/tmp/design-core-search-spec-final.log`.

## Scope and milestone review

The user requested minimal testing. Aggregate UI, pointer, provider/native,
platform and visual-baseline matrices are out of scope. Affected stories are
visual-pending; no baseline updates, publication or milestone promotion.
Desktop adoption must use the prepared public archive and separate consumer
evidence. Existing migration and distribution gates are unchanged.
