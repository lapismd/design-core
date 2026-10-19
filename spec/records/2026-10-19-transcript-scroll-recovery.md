# Transcript scroll recovery and running activity

DC-CHAT-006 and DC-AI-003; enclosing Jujutsu change mknknznr; 2026-10-19.

The host opts into `Transcript.scrollButton` in Document and Classic. It composes
existing LayoutScrollButton; host `busy` maps to the new controlled `isRunning`
glyph. Three horizontal dots bounce vertically, stop under reduced motion and
pause while hidden. The action remains navigation, with no menu or dispatch.
An instant end jump focuses an enabled composer or final captured item. Classic
placement clears the sticky composer. Explicit upward scrolling releases the
bottom lock; measured content growth retains a lock established at the end.

The current Transcript mounts keyed message rows; CodeMirror virtualizes inner
readers. It does not use the older virtual MessageList. Future row virtualization
must delegate end jumps/measurement and anchoring to that virtualizer. No virtual
row access is assumed here. Document flow uses display:contents: observing only
that wrapper misses late reader growth, so the recovery observer watches its
boxed immediate sections and their insertion/removal. Scroll handling stays
constant-time, child observation is shallow and teardown cancels scheduled work.

Focused regression: `pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.scroll-recovery.stories.svelte`.
Before: both new cases fail for the missing button (before.log). Intermediate:
both fail because the test measured ScrollArea Root instead of its viewport
(after.log); the test now uses the public viewport marker. Next one Document
case fails at a late 176px resize (repaired.log). Watching boxed sections fixes
the actual resize issue without changing content layout or weakening bounds.

`pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.scroll-recovery.stories.svelte
src/shared/ai/layout-scroll-button/LayoutScrollButton.stories.svelte
src/shared/chat/transcript/Transcript.composer-layout.stories.svelte` passes
11 interaction/accessibility cases in a fresh process (qualified.log).
`pnpm check:types` passes the main and three public-consumer type lanes with zero
errors/warnings (types.log). Logs: `.local/verification/chat-scroll`.

The consumer will install the verified private public archive and qualify real
Notes composition separately. No source alias, node_modules edit, publication
or baseline update. DC-AI-003 remains Implemented; DC-CHAT-006 remains In progress
at its original reference/packed/native gates. User requests minimal testing;
aggregate package/browser matrices and visual approval remain separate.

Final source qualification: the same two new cases and all five scroll-button
cases pass (final.log), including the controlled running callback. Source
`pnpm spec:check` initially caught an over-broad acceptance-bullet insertion in
unrelated AI families; narrowed to DC-AI-003, then validation, mdBook and
spec-first all pass (spec-final.log). The final type check caught an untyped
Storybook query generic; typing its DOM region fixes that test annotation.
No product type assertion or public API is weakened.

The corrected main source type lane passes with zero errors/warnings
(types-qualified.log); the prior three public-consumer lanes also passed.
The two recovery cases pass again after retaining the existing active-comment
reading fence (retained-comment-follow.log). Package refresh uses the prepared
public CSS/Svelte exports, not a source override. Formatting, source check and
private archive preparation are recorded under the same log directory.
