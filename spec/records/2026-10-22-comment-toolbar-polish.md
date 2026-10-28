# Comment toolbar layout and emoji review

The user requested the formatting T at the far right, no space reserved for
hidden hover actions, an emoji picker in the expanded formatting row, and the
first formatting glyph aligned with the editor text.

CommentComposer now places its T after removal actions. Transcript comment
hover links follow the existing floating hover-action pattern above the comment
rather than consuming inline width. Touch controls reserve visible action space
above the editor. The toolbar offsets the first icon's built-in 6px inset and
uses the public EmojiPicker with optional palettes/custom serialization. Emoji
insertion uses the retained public Mira selection without rebuilding the editor.

Exact target: CommentComposer.stories.svelte and
Transcript.comment-lifetime.stories.svelte, selected with
`-t 'InlineFormattingToggle|CommentFormattingControls'`. Before: two failures
(6px glyph inset and 58px reserved control width). After: two passed, including
selection formatting, emoji insertion and full draft retention while closing.
The eight-file focused source lane passes 58 interaction/accessibility cases.
Root and strict source-consumer types have zero errors/warnings. Canonical
validation, original-base spec-first and the native CSS audit pass.

The shared source is prepared for Agent UI review only. Broad suites,
publication, downstream services/apps and visual baselines remain deferred.

Prepared source-inclusive archive:
`lapismd-design-core-0.6.0-agent-requests-feedback-toolbar-review.tgz`, SHA-256
`ae4b79995d0ff3b6b15585a45f0a99a0371aff9b3d961feb7eea3f3b2b987171`.
The package compiler audits 267 styles with zero remaining utility references.
