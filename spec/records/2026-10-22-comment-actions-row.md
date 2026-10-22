# Inline comment action-row correction

The user observed that the toolbar polish moved hover actions above the comment.
This follow-up supersedes that part of the prior layout review. CommentComposer
now owns an optional actions snippet before the persistent T. Transcript editors
put navigation, removal and reply controls into that slot. Hidden actions stay
out of flow; hover/focus and touch reveal them in the same first row before the
T, without covering the text. The emoji picker and first-glyph alignment remain.

The exact `CommentFormattingControls` regression failed once before the repair
with a 24px vertical offset. The repaired focused check, formatting/emoji check
and disabled-controls case pass (3 passed). Assertions prove the right edge,
hidden action width, shared row and action order. The initial display-none
attempt passed geometry but hid disabled controls from the accessibility tree;
the eight-file lane reported 59 passed and 1 failed. Keeping hidden controls out
of flow with their existing accessible focus treatment repaired that regression.
An intermediate strict optional-prop error was repaired using a conditional
snippet spread. Root and strict consumer types now have zero errors/warnings.

Canonical validation, spec-first from `11de5adf`, native CSS and the prepared
package audit pass. Preparing the archive invalidated a concurrent Vite run;
that run was cancelled. The fresh final affected lane after packaging passes all
60 interaction/accessibility stories across the eight comment/transcript files.

Review archive (source included):
`lapismd-design-core-0.6.0-agent-requests-inline-actions-review.tgz`.
SHA-256: `fbd723037593a44a7ed1f8e1af2db73241e054bd4be5985af7f6ff3e9bbf13a6`.
CSS audit: 267 styles, zero remaining utility references.

Broad qualification, publication, downstream application adoption and visual
baselines remain deferred for user review.
