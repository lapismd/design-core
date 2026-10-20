# Composer suggestions outside clipped editors

Requirements: DC-CHAT-013. The user reported a clipped @ suggestion menu in the
desktop WKWebView while the Chromium Storybook preview looked correct. The
composer mounted CodeMirror's fixed tooltips inside its editor. A contained,
clipped ancestor reproduces the same invisible/hit-test failure.

Use CodeMirror's public `tooltips` parent configuration to mount in the document
body, matching the existing search-input approach. CodeMirror retains its theme
classes, positioning, keyboard selection, viewport bounds and portal teardown.
No trigger/search/insertion API, draft, dispatch or persistence behavior changes.
The regression mounts a clipped/transformed composer, checks the option's actual
hit target, selects it with the pointer and verifies removal on teardown.

Commands and results:

- `pnpm exec vitest run --project storybook src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte -t Clipped`:
  before: 1 failure, 10 unrelated cases skipped. Option was not hit-testable.
- Same family with `-t 'Clipped|Mention|Asynchronous|Wrapped'`: after: 4 passed,
  7 unrelated cases skipped in Chromium.
- Same Clipped case through ignored `.local/composer-webkit.config.ts`, which
  changes only the Storybook browser instance to WebKit: 1 passed, 10 skipped.
- `pnpm exec vitest run --project unit src/shared/chat/markdown-composer/composer-suggestions.spec.ts`:
  6 passed.
- `pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings`:
  zero errors and warnings.
- `pnpm spec:validate` and `pnpm spec:first`: pass after making the changed
  acceptance bullet one sentence and moving an existing free-standing chat v0
  review paragraph out of AI's acceptance list into the chapter introduction;
  initial validation failures are retained in `.local/composer-portal-spec-*`.
- Targeted Prettier: pass; `packLocal` prepared browser CSS with zero utility
  references and a local package archive for Desktop's ignored validation overlay.

Milestone review: this is a focused functional fix. Broad suites, visual
baselines, release and publication remain deferred under the user's v0 scope.
Desktop package-refresh and actual native-window observations are recorded in
Desktop's E-AI-090; WebKit browser acceptance alone is not native qualification.
