# Markdown composer, message actions and reactions

Requested after the reviewed app-component batch was qualified and committed at
`4827c0f3`, in the existing isolated Design Core workspace. This implements the
next two requested plan pieces together; transcript/comment work, consumer
migrations, release and the pending Panel Toggle integration remain separate.

## Baseline and reference

Before editing, `pnpm checks` passed 741 units, 731 Storybook cases and 99 native
browser scenarios (one existing platform skip); Composer's 11 stories and the
experimental ReactionBar's one story are included in that baseline. The preceding
batch record retains exact commands and the clean packed-consumer qualification.

Reference-only source is jj-store `21370064`, Apache-2.0 (LapisMD contributors):
`community-chat-composer/CommunityComposerToolbar.svelte`,
`CommunityComposerSurface.svelte`, `composer-extension.ts`,
`composer-selection.ts`, `community-message-actions/CommunityMessageActions.svelte`
and `community-reactions/CommunityReactions.svelte`. Presentation patterns are
adapted without member types, Nostr identity, queue controllers or persistence.
The published Mira 0.0.5 public editor, extension and CodeMirror APIs are used.

## Implementation and qualification

MarkdownComposer composes the existing Composer shell with published Mira, using
public selection/formatting/extension APIs and CodeMirror event/theme APIs.
`clearOnSubmit` defaults true for existing Composer users; MarkdownComposer sets
it false and emits exact draft snapshots, leaving delivery, failure feedback and
acknowledged clearing to hosts. Framed and document modes retain the same editor,
with a hidden named form value, controlled disabled/busy state, bottom tooltips,
custom emoji, context and host actions. Native Mira padding tokens and a public
CodeMirror gutter theme provide compact input without copying Mira internals.

MessageActions supplies primary and overflow actions, disabled explanations,
hover/focus/touch visibility and retained portal interaction. No application
copy/edit/report policy is built in. The existing ReactionBar implementation is
also exported through Chat and supports neutral custom registrations/captured
records, disabled state and authoritative restricted choices while preserving
Unicode callbacks and experimental imports.

The first type run found 15 errors from incorrectly using numerical positions
with Mira's line/ch selection API and an invalid editor mode; public fromOffset
conversion and live-preview mode repaired them. All four `pnpm check:types` lanes
then passed with zero diagnostics (`/tmp/dc-chat-types-after.log`), and the extended
strict consumer exercises all three new Chat contracts with zero diagnostics
(`/tmp/dc-chat-strict-final.log`). Specification registration initially lacked two
mapped chapters; the canonical mappings and evidence were completed, and
`pnpm spec:check` passed all three lanes (`/tmp/dc-chat-spec-final.log`).

The first five-file story run had 22 passes and six handle-cleanup failures from
comparing a proxied bound handle with its raw object. Cleanup now uses an owned
function identity, preserving external replacements without runtime diagnostics.
The exact five-file command, including all 11 existing Composer stories and the
existing ReactionBar story, passes 28/28 interaction/accessibility cases after the
final compact styling change (`/tmp/dc-chat-stories-final.log`). The two affected
catalog/prebundle unit files pass 14/14 (`/tmp/dc-chat-unit.log`), and the native-CSS
audit passes (`/tmp/dc-chat-css.log`).

After restarting this checkout's Storybook, an initial browser attempt raced the
readiness endpoint and ran no tests; the server was allowed to finish without a
timeout or readiness-rule change. Browser iteration then corrected two test
expectations: selected text must gain bold markup, and a synthetic IME event may
change the draft through the editor but must never emit submission intent.
A stronger framed-mode IME assertion exposed one real failure in keymap-only
submission; the exact `-g 'keyboard submission'` target failed once and passed
once after routing submission through the shared key helper and public
CodeMirror DOM-event API, checking event composition flags as well as view state.

`SHADCN_STORYBOOK_PORT=9409 SHADCN_VISUAL_SERVER_PORT=9410 pnpm test:shadcn:pointer tests/shadcn/chat-composer-actions.spec.ts`
passes all five native scenarios in 16.6 seconds after final styling
(`/tmp/dc-chat-browser-compact.log`): exact whitespace/draft retention, newer edits
surviving old acknowledgements, stable editor/selection across presentation and
emoji, document/IME/modifier submission, menu focus restoration, touch access,
narrow layout, reduced motion and forced-colors visibility.

These are focused qualification results for the new review batch, not a rerun of
the previous batch's aggregate or packed-consumer results. Continuing the user's
review-first workflow, final aggregate/static/package qualification and this
batch's commit wait for review. The preceding batch is already fully qualified
and committed. New stories remain visual-pending; no baselines, publication,
release or consumer migration was performed.

## Composer review follow-up

The requested leading-edge content and top reply quote were reproduced with
`SHADCN_STORYBOOK_PORT=9409 SHADCN_VISUAL_SERVER_PORT=9410 pnpm test:shadcn:pointer tests/shadcn/chat-composer-actions.spec.ts --grep 'composer text|reply preview'`:
two failures, a 44px inset and no quoted-reply group
(`/tmp/dc-composer-review-before.log`). Mira's document surface locally defines
2rem file margins and a 700px line width, overriding inherited composer tokens.
The public CodeMirror theme now composes Mira's file-margin/line-width tokens
on that editor root with a host-configurable 0.5rem inset.

`reply` accepts neutral author/content data and uses the existing ComposerDrawer
above the editor, adapted from jj-store's Apache-2.0
`community-reply-context/CommunityReplyContext.svelte` and
`community-reply-preview/CommunityReplyPreview.svelte` at `21370064`.
The preview retains the original quote with visual ellipsis and a full-text title.
Optional `onCancelReply` remains host-owned and restores editor focus without
replacing the editor, draft or selection. No empty drawer is mounted without
reply context. Disabled/busy state also disables cancellation.

The first after-run passed the inset check and exposed a test geometry mistake:
ComposerDrawer deliberately extends its decorative background behind the body.
The assertion now measures the visible quoted text, which must remain above
the editor, rather than that overlapping background. Product layout was not
changed to accommodate the mistaken assertion. The focused composer stories
pass 7/7 interaction/accessibility cases (`/tmp/dc-composer-review-stories.log`).
Native-CSS auditing also passes (`/tmp/dc-composer-review-css.log`).

The complete `tests/shadcn/chat-composer-actions.spec.ts` target passes 7/7
native scenarios after these changes, including the two new regressions
(`/tmp/dc-composer-review-browser-final.log`). Wide/narrow framed and document
layouts stay at the leading edge; cancellation keeps the same editor node,
exact draft, selection and focus. All four `pnpm check:types` lanes pass with
zero errors or warnings (`/tmp/dc-composer-review-types.log`), including the
strict public consumer's new reply contract.
The exact two-regression command also passes 2/2
(`/tmp/dc-composer-review-focused-final.log`), reducing its baseline failure
count from two to zero.

## Document design comparison

The next review compared document mode with jj-store's Apache-2.0
`CommunityComposerSurface.svelte`, `ChatNextMessage.svelte` and `chat-caret.ts`
at the same reference revision. The original shared presentation merely removed
the frame: it retained a white Mira pane, a 40px text area, different line height,
no avatar gutter and an offset toolbar. The exact `--grep 'document composition'`
browser target failed once on those five comparison assertions
(`/tmp/dc-document-parity-before.log`).

Document mode now uses a transparent surface through public Mira tokens,
host-supplied avatar content in a 1.5rem gutter with 0.5rem gap, 14px host-font
prose at 1.65 line height, and `max(16rem, 45vh)` writing space. Public CodeMirror
theme APIs provide source-matching caret clearance and minimum height. The first
after-run exposed a competing Mira content rule; adding the public `.cm-editor`
root to the theme selector resolved its specificity without private DOM repairs.
The exact comparison target then passed 1/1
(`/tmp/dc-document-parity-focused-final.log`).

The document reply story starts with collapsed formatting controls, a host-owned
Avatar snippet and a separate quote above the open editor. Actions and the hint
align to the prose column. Avatar, input and editor wrappers remain stable while
changing presentation. Framed mode retains its controls and compact dimensions;
no agent routing, comment queue or app-owned action docking was imported.

The main source type check and strict public consumer check pass with zero
errors or warnings (`/tmp/dc-document-parity-types.log`,
`/tmp/dc-document-parity-consumer.log`). The native-CSS audit also passes
(`/tmp/dc-document-parity-css.log`). This remains the same visual review batch;
aggregate/package qualification and its commit still follow review.

The seven composer interaction/accessibility stories pass after the document
changes (`/tmp/dc-document-parity-stories.log`). An initial eight-case browser
run passed seven cases, with the menu case interrupted before assertions by the
readiness helper reading a missing body during a documentation-triggered reload
(`/tmp/dc-document-parity-browser-final.log`). Without product or helper changes,
the exact menu target passed 1/1 (`/tmp/dc-document-parity-menu-retry.log`).
No assertions, readiness rules or timeouts were weakened.

With source/document writes complete, the full eight-case browser target passed
8/8 (`/tmp/dc-document-parity-browser-clean.log`). Subsequent review requested
vertical centring of the first draft line beside the avatar. Its exact
`--grep 'vertically centred'` target failed once with a 1.42px centre offset
(`/tmp/dc-document-avatar-before.log`). The avatar wrapper now uses a flex row
sized from the first line's prose metrics and caret inset, removing inline-avatar
baseline spacing while keeping multiline drafts aligned to their first line.
The unchanged target passes 1/1 for single-line, multiline and narrow drafts
(`/tmp/dc-document-avatar-after.log`); manual browser measurement shows matching
avatar and text-line centres. All seven composer stories pass again, including
accessibility (`/tmp/dc-document-avatar-stories.log`), and the native-CSS audit
passes (`/tmp/dc-document-avatar-css.log`). No broad batch qualification or
baseline updates were run during this review follow-up.
