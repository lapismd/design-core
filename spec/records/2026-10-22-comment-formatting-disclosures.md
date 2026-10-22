# Inline comment formatting and disclosure outcomes

The user requested a right-aligned formatting T toggle in inline comments, red
denied permission labels/icons and a smaller gap after collapsed outcomes.
CommentComposer now uses the main composer's shared action definitions and
public Mira commands, preserving the editor and selection. Its compact toolbar
opens below the input; blocked editors cannot format. TranscriptItem exposes
optional destructive disclosure tone without changing captured outcome semantics.
Final compact tool/disclosure rows use the existing 0.25rem tool-row gap.

Exact initial source command: `pnpm exec vitest run --project storybook
src/shared/chat/comment-composer/CommentComposer.stories.svelte
src/shared/chat/transcript/Transcript.disclosures.stories.svelte
-t 'InlineFormattingToggle|DestructiveDisclosure'`. Before: three failures
(missing toggle and neutral disclosure tones); after: three passed. Assertions
also cover formatted controlled drafts, preserved selection through toolbar
interaction, collapsed spacing and content disclosure.

Focused source qualification: eight affected story files, 57 interaction/axe
cases passed. These include CommentComposer, MarkdownComposer and drawer,
Transcript comments, tools, filename icons, disclosure tones and comment lifetime.
The test typing lane caught one unsupported Testing Library query option; an
anchored accessible name replaces it and the exact three cases pass again.
Root and strict source-consumer types now report zero errors/warnings.
Canonical validation, original-base spec-first and native CSS audits pass.

This isolated source workspace is packed for review in Agent UI 7590. Broad
qualification, publication, downstream adoption and visual baselines remain
deferred until user review.

Prepared source-inclusive review archive:
`lapismd-design-core-0.6.0-agent-requests-comment-formatting-review.tgz`, SHA-256
`b020dfc6793a89b89983b04eefeeeb3df610ad18aa4007f343e5e60080639e00`.
Compilation audits 267 styles with no remaining utility references.
