# Composer Tab selection

DC-CHAT-013 now accepts the selected trigger suggestion with unmodified Tab.
Enter retains its pending-result guard. Tab falls through when there is no
selected active completion; Shift+Tab, modifiers, disabled inputs and IME retain
the existing editing and focus behavior. Selection never submits the message.
No search, insertion, draft, persistence or execution API changes.

Evidence:

- Before: `pnpm exec vitest run --project storybook src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte`: 11 passed / 1 failed. Tab left `@` rather than inserting the selected Lee Taylor. An earlier `-t 'Tab accepts selected suggestion'` matched no generated test names and qualified nothing.
- After, same command in a fresh Vitest process: 12 passed, no failures.
- `pnpm exec vitest run --config .local/composer-webkit.config.ts src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte -t TabAcceptsSelectedSuggestion`: 1 passed / 11 skipped in WebKit.
- `pnpm exec vitest run --project unit src/shared/chat/markdown-composer/composer-suggestions.spec.ts`: 6 passed.
- `pnpm spec:validate` and `pnpm spec:first`: passed (8 validators; 2 protected files / 2 canonical chapters).
- Targeted Prettier: passed.
- `pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings`: zero errors/warnings.

Milestone review: focused v0 interaction fix; existing native and visual gates
remain unchanged. Broader aggregate suites, release, publication and baseline
updates are out of scope under the user’s minimal-verification instruction.
Desktop owns the consuming package-refresh and native review evidence in
E-AI-094. Browser WebKit is separate from native WebView qualification.
