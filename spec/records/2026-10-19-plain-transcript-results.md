# Plain transcript results

2026-10-19; enclosing Jujutsu change tlwwtrzr; DC-CHAT-006 and DC-CSS-001.

TranscriptBlock adds an explicit optional plain custom surface that removes the
wrapper border and padding while retaining exact source, comment interaction and
default framed presentation for other custom blocks. The Notes host chooses it
for local command reports and results; Search owns its empty result presentation.

Notes exact regression fails the border assertion before this change:
`pnpm exec vitest run --config vitest.catalog.config.ts
catalog/plugins/ai/ChatLayoutReview.stories.ts
-t 'Inline Local Commands|Empty Local Search'`. Its record E-AI-061 owns consumer
counts. The source regression initially used a collapsed context item and could
not find its group, both before and after the implementation; correcting the
fixture to an assistant message exercises the actual surface.
`pnpm test:storybook src/shared/chat/transcript/Transcript.plain.stories.svelte
src/shared/chat/transcript/Transcript.readonly.stories.svelte` then passes 5/5.
Logs `.local/plain-result-before.log`, `plain-result-after.log`,
`plain-result-after-2.log`. No assertion or accessibility policy is weakened.

Wider aggregate, native/provider, release and visual-baseline checks remain
deferred under the user's focus on functional plugin UI; no milestone or release
is promoted.

`pnpm check:types` passes source, shell, filter and source-consumer configs with
zero diagnostics. `pnpm spec:check` passes validation, mdBook and spec-first.
Logs `.local/plain-result-types.log`, `plain-result-spec.log`.
`packLocal` prepares declarations and ordinary browser CSS (3 sheets compiled,
253 audited, zero utilities), archive
`lapismd-design-core-0.5.1-local-results.tgz`, source code snapshot
`ab661bdfadea6e2e690ad94002c94565c0deb7f8`, SHA256
`88a113e1935a61781a977d8245c160aaf059d9cb65ee645ff4891fe2a8475f5a`.
`.local/plain-result-pack.log`. Later source edits are evidence-only.
