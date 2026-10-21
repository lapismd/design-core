# Prompt context body indentation

Desktop's sent-context review showed expanded Markdown starting before the
parent XML tag label. The shared trigger places its label at 2rem, after its
icon and gap, while the body used only 1rem. The body now uses 2.5rem logical
inline-start padding: one visible step beyond the label, repeated inside each
nested element. End padding, controls, compact tags, source text, parser and
disclosure state remain unchanged.

DC-CHAT-010 specifies the visible hierarchy; DC-CSS-001 retains native CSS
ownership. Inspected JJ Store's original StorePromptElement and retained its
composition, changing only the owned shared body's padding. The actual
PromptContext story now checks both outer Markdown and nested list geometry.

Before/after evidence (ignored `.local/context-indent-*` logs):

- Initial filtered command selected zero cases (3 skipped), because the CSF
  generated test name differs from the human story name; this is not a pass.
- `pnpm test:storybook src/shared/chat/prompt-context/PromptContext.stories.svelte`:
  before, 1 failed/2 passed. The exact regression measured body x=16 before
  parent label x=32.
- First after run: the outer geometry passes, then the new nested assertion
  incorrectly requests an accessible link for an unresolved internal anchor.
  The run has 1 failure/2 passes. Use the real list item's text for the same
  geometry assertion; do not alter the renderer or relax indentation.
- Final `pnpm test:storybook src/shared/chat/prompt-context/PromptContext.stories.svelte src/shared/chat/sent-context/SentContext.stories.svelte`:
  2 files, 10 stories pass, 0 failures, including the original geometry target.
- `pnpm test:unit src/shared/chat/prompt-context/prompt-elements.spec.ts`:
  8 tests pass, 0 failures; parsing and source preservation remain intact.
- `pnpm check:types`: package, shell, filter and source consumer checks pass,
  each with 0 errors and 0 warnings.
- `pnpm spec:first` passes and all 3 `pnpm spec:check` lanes pass, 0 failures.
  Changed files pass Prettier.

Package parent: `bb8b3410`; Design Core 0.5.1, pnpm 10.32.1, Node 26.9.0.
This is a focused presentation repair. No public API, host policy, parsing or
wire/storage format changes. The user's minimal verification scope defers
the aggregate catalog/browser/static/release lanes; their inherited gaps from
the preceding FilePathInput record remain explicit. No screenshot comparison
or baseline updates. Existing milestone and verification status stay Partial.

Desktop E-AI-113 records the private public-archive checksum and cold consumer
acceptance, separately from these source checks. Nothing is published.
