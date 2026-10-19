# Composer attachment integration

2026-10-19; enclosing Jujutsu change uvrvxnvw.

DC-CHAT-002 adds the generic host drawer slot to MarkdownComposer, composing it
with reply context inside the existing Composer. The explicit disabled-drawer
opt-in forwards the existing shell contract; editing/submission remain blocked.
DC-AI-011 makes collapsed drawer summaries compact. DC-CSS-001 retains native
CSS, semantic tokens and consumer independence; no domain state moves upstream.

Exact before: `pnpm test:storybook
src/shared/chat/markdown-composer/MarkdownComposer.drawer.stories.svelte` fails
1/1 because the host drawer is not rendered. `.local/attachments-before.log`.
The same target passes 1/1 after: rounded-body overlap, compact collapsed height,
interactive host controls while disabled and retained draft.
`.local/attachments-after.log`.

The Notes consumer owns file choices, chips, relative paths, pending requests and
three-line default sizing through public tokens. Its E-AI-061 records acceptance.
Wider aggregate, native/provider, release and visual-baseline gates remain
deferred under the user's UI-first scope. No milestone or release is promoted.

Direct source surface: `pnpm test:storybook
src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte
src/shared/chat/markdown-composer/MarkdownComposer.drawer.stories.svelte
src/shared/ai/composer/Composer.stories.svelte
src/shared/ai/composer-drawer/ComposerDrawer.stories.svelte` passes 29/29 across
four files with interaction/accessibility enabled, including reply, context,
disabled, stop and drawer states. `.local/attachments-source-matrix.log`.

Initial `pnpm spec:check` fails the atomic acceptance-bullet rule; combined the
new geometry clause and existing disabled-controls clause into one sentence.
The repeat passes validation, mdBook and spec-first (3 lanes). Logs:
`.local/attachments-spec.log`, `.local/attachments-spec-2.log`.

`pnpm check:types` passes the main source plus shell, filter and source consumer
configurations with zero errors/warnings. `.local/attachments-types.log`.
`packLocal(process.cwd(), { outputDirectory: Notes/.local/archives/packed,
suffix: '-attachments' })` prepares the public package/declarations and CSS:
3 sheets compiled, 253 audited, zero remaining utility references.
Archive `lapismd-design-core-0.5.1-attachments.tgz`, source code snapshot
`7dfa517b8b7569ccba1574d6ce496525827d2b10`, SHA256
`b65a7cf2df310b9a009c5d304202a058d45238eb430b1a53a9761e1b98f5ba2f`.
Later changes in this source slice affect only contracts and evidence.
`.local/attachments-pack.log`. No publication or baselines changed.
