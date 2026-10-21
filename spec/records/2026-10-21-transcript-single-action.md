# Single composer action through submission

2026-10-21; source parent `54e142bc`; DC-CHAT-009. No public prop, host
callback, cancellation authority or delivery policy changes.

The shared footer previously rendered a second Stop button while a nonempty
submission was pending, leaving its disabled Queue arrow beside it. Pending
submission now selects Stop in the ordinary action slot. Active empty drafts
without host cancellation omit Queue, rather than showing a disabled arrow.
Ready nonempty follow-ups retain Queue, whitespace retains Stop and idle Send
behavior is unchanged.

- Initial target `pnpm test:storybook src/shared/chat/transcript/Transcript.composer-layout.stories.svelte -t 'Single action during submission'`: zero tests ran (case mismatch); not acceptance.
- Exact before target `pnpm test:storybook src/shared/chat/transcript/Transcript.composer-layout.stories.svelte -t Single`: one failure, two buttons instead of one (`.local/single-action-before-exact.log`).
- The same exact after target passes: one interaction/accessibility story, including submission, acknowledgement, whitespace, queue submission and host Stop, with the draft retained (`.local/single-action-after.log`).

- `pnpm test:storybook src/shared/chat/transcript/Transcript.stories.svelte -t 'BusyAgent|FullConversation'`: two related interaction/accessibility stories pass (`.local/single-action-related.log`).
- `pnpm exec svelte-check --tsconfig tsconfig.json --fail-on-warnings`: zero errors/warnings (`.local/single-action-types.log`).
- `pnpm spec:check`: validate, mdBook and spec-first all pass (`.local/single-action-spec.log`).
- Changed-file Prettier check is run before committing. Node v26.9.0; pnpm 10.32.1; Storybook 10.5.7.

The exact regression runs in a fresh Vitest browser process. This qualifies the
bounded presentation repair, with no implication of full-suite qualification. Package intake and native Desktop launch are consumer evidence;
no provider prompts or visual baseline updates are authorized by this slice.
Full catalog, unrelated browser suites and visual comparisons remain deferred
under the user request to keep verification minimal.
