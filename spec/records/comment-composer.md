# Captured-source comment composer

The user requested jj-store's compact inline code/comment reply state during
the ongoing Chat review. This pulls forward its presentation from the later
inline-comment slice; it does not implement transcript selection, exact-anchor
controllers, comment queues or delivery.

## Source and baseline

Reference: jj-store `21370064`, Apache-2.0 (LapisMD contributors),
`web/src/lib/ui/store-agent-chat-body/ChatCommentArea.svelte`,
`ChatCommentEditor.svelte`, `comment-card.css` and `chat-caret.ts`.
The reference checkout is unchanged. Design Core previously had no compact
comment family. Before adding it, the directly affected catalog discovery unit
target passed 12/12 (`/tmp/dc-comment-composer-baseline.log`); the existing seven
MarkdownComposer stories passed in the preceding review follow-up.

## Shared presentation

CommentComposer uses public MiraCodeEditor and CodeMirror APIs for a controlled,
compact comment draft. An optional captured code or safe Markdown quote sits
above the avatar/editor card, with a host-owned source navigation action.
Missing/changed sources retain their quote and explanation. Context changes
retain the same editor. No application member models or controller state are
imported. Long quotes use the shared ScrollArea.

Modifier+Enter emits the exact draft; Enter inserts a newline and IME does not
submit. Escape requests dismissal, and optional removal also remains host-owned.
Disabled, pending and read-only states block editing and submission. The public
handle exposes Mira focus and line/ch selection methods. Stories cover code,
Markdown, inline, narrow, disabled, pending and unavailable-source states.

This is a visual-review delivery. Full aggregate/package qualification, commit,
publication and consumer adoption remain after review; no baselines are updated.

## Focused feedback

The first two-family story run passed 13/14 cases and found one contrast failure
in the pending quote (4.36:1). Pending drafts now retain full contrast while
remaining read-only and busy. No accessibility rule was disabled. Manual review
also found Mira's inherited document margins in the compact input. The exact
`--grep 'compact comment geometry'` browser target failed on card height,
avatar alignment and horizontal inset. Public file-margin/line-width tokens on
the CodeMirror root remove those document margins without private overrides.

The main source and strict public consumer type checks pass with zero errors
and warnings (`/tmp/dc-comment-composer-types.log`,
`/tmp/dc-comment-composer-consumer.log`).

The isolated PendingSubmission story now passes (six unrelated cases skipped),
and the unchanged catalog discovery target passes 12/12 again. Source renderer
injection is available for host-authorized assets and application Markdown syntax.

## Typography review

The user requested an explicit comparison of quote and draft fonts. jj-store's
comment-card stylesheet uses the app sans family and Mira's Markdown/body quote
size (14px with the current foundation defaults); ChatCommentEditor explicitly
uses a 1rem draft. CommunityMarkdownContent uses the host font and message
leading (default 1.55). The installed jj-store foundation also binds the sans
family to DM Sans Variable. Importing Inter for Appearance previews does not
make it the comment font.

The exact `--grep 'typography'` browser target reproduced the shared quote's
incorrect 16px size (`/tmp/dc-comment-fonts-before.log`). Separate quote/editor
tokens now retain 14px quotes, 16px input, and the host sans family; Markdown
quotes use 1.55 leading and code quotes 1.5. Quote defaults are captured on the
outer host to avoid cycles when Mira maps its own font tokens. The combined
typography and compact-geometry target passes 2/2
(`/tmp/dc-comment-fonts-geometry-after.log`), including Markdown quote sizing.

## Final focused result

The exact original two-family story command now passes 14/14 interaction and
accessibility cases (`/tmp/dc-comment-final-stories.log`), reducing its failure
count from one to zero. The full new `tests/shadcn/comment-composer.spec.ts`
target passes 4/4 (`/tmp/dc-comment-final-browser.log`): quote/input fonts,
compact avatar geometry, exact whitespace and multiline submission, retained
drafts, IME/Escape, source switching with stable editor/selection, exact Unicode
quotes, keyboard removal and narrow forced-colors/reduced-motion layout.

The final strict public consumer check passes with zero diagnostics
(`/tmp/dc-comment-composer-consumer-final.log`), catalog units pass 12/12,
specification validation passes all three lanes, and native-CSS and changed-file
formatting checks pass. Aggregate/static/packed-consumer qualification remains
deferred to the agreed visual review checkpoint. No release, migration or
baseline update was performed.
