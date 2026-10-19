# Composer resting focus treatment

DC-CHAT-002; enclosing Jujutsu change ylqppvml; 2026-10-19.

The user requests no focus ring around the desktop chat composer. Shared
MarkdownComposer now retains its resting framed border on focus, removes the
shell focus shadow in both presentations and suppresses the editor focus
outline through its owned CodeMirror theme. Toolbar focus cues, caret, editor
selection, draft, growth and submission authority remain unchanged. Desktop
separately reduces its public minimum-height tokens by one line.

Exact reproduction: `pnpm test:storybook src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte -t 'Formatting|Document'`.
Before: one failed framed story, one passed Document story; the framed body
adds an inset focus shadow (`composer-focus-before-final.log`). The earlier
literal-space filter selects zero tests (`composer-focus-before.log`). After:
the complete same story file passes all 10 interaction/accessibility cases in a
fresh process (`composer-focus-after.log`). Focus checks cover resting border,
no shell shadow and no editor outline; existing draft/formatting behavior stays
covered. Logs live in `.local/verification/footer`.

Source Svelte types pass with zero errors/warnings; specification validation,
book and source-first checks pass (three lanes). The prepared public archive
uses suffix `-compact-composer` and succeeds with prepared browser CSS. Desktop records
its separate public-consumer acceptance. Contract review: intentional focus
presentation refinement under DC-CHAT-002; no public props or Mira contracts
change. Milestone review: source remains Implemented; host/native/provider and
release gates are unchanged. Aggregate matrices remain deferred under the
user's minimal-testing direction. No visual baseline updates.
