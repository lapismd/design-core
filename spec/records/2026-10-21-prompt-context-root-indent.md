# Prompt context root Markdown indentation

The first indentation repair covered expanded XML bodies. Root prose before,
between and after XML sections still started at x=0 while tag labels began at
x=32. DC-CHAT-010 now explicitly aligns root Markdown with top-level labels.
DC-CSS-001 retains native, component-owned logical CSS.

The existing safe Mira extension wraps only root Markdown elements in an owned
presentation div after sanitization. Its 2rem inline-start inset matches the
tag-label column. Nested bodies retain their existing 2.5rem step; original
child nodes and source positions, exact content, parser, safe HTML policy,
host hooks and disclosure state remain unchanged. The extension imports its
own CSS so it also works when used directly without PromptContext.

Before/after evidence (ignored `.local/root-context-*` logs):

- `pnpm test:storybook src/shared/chat/prompt-context/PromptContext.stories.svelte`:
  before, 1 failed and 2 passed. Root paragraph differed from the label by 32px
  (`expected 32 to be less than 1`).
- `pnpm test:storybook src/shared/chat/prompt-context/PromptContext.stories.svelte src/shared/chat/sent-context/SentContext.stories.svelte`:
  first repair passes 10/10; final run adds standalone-extension/no-XML coverage
  and passes 11/11. Checks include paragraphs before/between/after sections,
  a root heading/list, existing nested geometry and sent-context interactions.
- `pnpm test:unit src/shared/chat/prompt-context/prompt-elements.spec.ts`:
  8/8 pass, 0 failures.

Source parent: `9a6bfa19`; package 0.5.1, Node 26.9.0, pnpm 10.32.1.
Desktop's exact AgentSwitch consumer regression independently fails before
archive refresh. Its fresh intake evidence records the source commit/checksum
and final cold acceptance. No runtime, storage, public API or wire changes.

Milestone review: DC-CHAT-010 remains Partial; focused geometry/interaction
proof does not complete broader qualification. The user's minimal-verification
scope keeps aggregate catalog/browser/static/release lanes deferred. No visual
baseline updates or publication. Type/spec results are recorded below.

- `pnpm check:types`: first run passed package/shell/filter checks but the
  strict source consumer rejected assigning optional children to a present
  property (1 error, 0 warnings). Guarded the assignment; final full command
  passes all four checks, each with 0 errors and 0 warnings.
- `pnpm spec:first`: passes. Initial `pnpm spec:check` rejected two sentences
  in one acceptance bullet; combined the same contract into one sentence.
  Final `pnpm spec:check` passes all 3 lanes (validate, mdbook, spec-first).
- `pnpm exec prettier --check` over all changed source/spec/changeset files:
  passes. No assertions, thresholds or policies were weakened.
