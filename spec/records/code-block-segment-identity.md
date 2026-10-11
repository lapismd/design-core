# CodeBlock repeated segment rendering

The jj-store development preview returned `src/example.ts` successfully, then
CodeBlock's span renderer threw Svelte's `each_key_duplicate` exception. Plain
text segments were keyed by their text, so repeated spaces shared an identity
and the file panel retained its loading skeleton.

Owning change `lqkxrkvp` keys each stateless span part by its position within the
line. Tokenization, public props, source text, styles and backend queries stay
unchanged. The new RepeatedPlainTextSegments story uses the exact failing
TypeScript line and checks visible, highlighted, byte-preserving content.

## Evidence

- The initial human-readable test filter selected no tests; corrected to the
  generated story name before evaluating the regression.
- `pnpm exec vitest run --project storybook src/shared/shadcn/code-block/CodeBlock.stories.svelte -t RepeatedPlainTextSegments` before: one failed test and one unhandled duplicate-key exception; after: one passed, nine unrelated stories skipped.
- `pnpm exec vitest run --project unit src/shared/shadcn/code-block`: 15 passed.
- All 10 CodeBlock stories pass in a fresh runner.
- `pnpm spec:first` passes. The first `pnpm checks` attempt stops on formatting drift in the touched verification table; governance, 722 units and three Turbo tests pass. The table is normalized without requirement changes before retrying.
- `pnpm pack --pack-destination /tmp/design-core-code-block-identity` produces the package tarball. The second `pnpm checks` run passes governance, formatting, package/strict-consumer types, no-Tailwind, 722 units, three Turbo tests, the static build/metadata audit and all 666 Storybook interaction/accessibility tests. It stops in the Workspace browser lane: 13 passed, one readiness timeout before any drag. The aggregate is not a full pass.
- Consumer `pnpm web:check`: zero errors and warnings. The focused StoreRepositoryApplication, StoreFileEditor and CommunityProjectsRepositoryLogFiles story run passes all 12 stories.
- `pnpm install --lockfile=false` refreshes the preview through its existing local package hook. The first preview restart exposes stale Vite/browser modules; `pnpm dev:stop`, `pnpm exec vite optimize --force --config web/vite.config.ts` and `pnpm dev:ui` refresh the preserved fixture on ports 7470/7472 using the existing explicit backend executable.
- A fresh background page with browser cache bypass renders the exact selected 49-byte TypeScript file, with visible syntax tokens and exact source text. Temporary cache settings are restored and the proof tab is closed. Reloading the original user tab is blocked by a browser automation focus timeout; it may need a manual hard refresh. Screenshot: `jj-store-codex-preview/.local/code-block-identity/file-rendered.jpg`.

The preview uses its existing documented file-package hook for temporary local
validation. Registry publication, release qualification and visual baseline
approval are separate; no dependency range or registry lockfile is changed.

## Wider browser qualification gaps

- The exact Workspace centre-drop test is isolated with `STORYBOOK_PORT=9045`.
  Temporarily restoring only CodeBlock from the parent revision gives one pass;
  the fixed-source retry again times out waiting for `data-app-shell-ready`.
  Source is restored in a `finally` block. This comparison does not establish a
  deterministic baseline failure; broader startup qualification remains open.
- `pnpm test:shell:pointer --output /tmp/design-core-code-block-identity-shell-results`: 10 passed, one timeout in `waitForVisualStoryFinished` before the mobile pan test proceeds.
- `pnpm test:ai-chat-browser --output /tmp/design-core-code-block-identity-ai-results`: one passed, two `waitForVisualStoryFinished` timeouts before the clipboard/selection and reasoning-motion checks proceed.
- `pnpm test:shadcn:pointer --output /tmp/design-core-code-block-identity-shadcn-results`: 48 passed, one existing skipped case.

The unresolved owners are the Workspace/Shell story-host startup and Visual
Delta readiness boundaries. No assertions, timeouts, fixtures, host code or
readiness helpers are changed in this slice. The repeated CodeBlock text failure
is independently proven before/after and accepted in the preserved running
consumer. This local fix is not a claim of release qualification or resolution
of the wider startup failures. Logs are `/tmp/design-core-code-block-identity-*`
and `/tmp/jj-store-code-block-identity-*`; browser fault artifacts retain the
explicit output directories above.
