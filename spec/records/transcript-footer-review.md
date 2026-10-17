# Transcript footer and parity review

This review refinement stays above the separate Panel Toggle integration change.
Reference: jj-store `2a479c74`, Apache-2.0, LapisMD contributors. Adapted sources
include `store-agent-chat-body/ChatMessageFooter.svelte`,
`store-agent-chat/StoreAgentPromptQueue.svelte`, `QueuedPromptText.svelte`,
the prompt-element presentation and the sanitized Delta reference catalog.
Host runtime controllers, request dispatch, persistence and recipient resolution
stay outside Design Core. No downstream consumer changes or screenshot updates.

## Before and after evidence

Commands use repository-pinned pnpm 10.32.1. The focused Transcript,
MarkdownContent, MarkdownComposer and Composer baseline passed 36/36 stories
before editing (`/tmp/dc-transcript-footer-baseline.log`).

| Boundary                                     | Before                                                                                                        | After                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Embedded comment foreground                  | 1 exact regression failure: Mira's private colour crossed the nested reader boundary                          | Exact native regression passes with host colour and font inheritance              |
| Affected Storybook interaction and axe cases | First refinement: 43 passed, 2 failed; next run: 23 passed, 1 failed                                          | 45/45 passed after safe XML assertion and captured-reader landmark repairs        |
| Native Transcript and review cases           | 18 passed, 3 failed: cold compilation timeout, absent quote in typography fixture, missing author-dialog role | 22/22 passed after the review repairs, including the original 14 Transcript cases |
| Persistent Stop callback while idle          | 1 new exact native regression failed: Queue stayed selected after busy became false                           | Exact regression passes: Send, Queue and Stop follow explicit host state          |
| Full unit suite                              | Earlier extraction: 776 tests                                                                                 | 788/788 passed, including the ported XML and recording mapping tests              |
| Strict source-consumer types                 | 3 exact optional-property errors                                                                              | All four type configurations pass with zero errors/warnings                       |

The palette regression command is
`SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript.spec.ts --grep 'embedded comments'`.
Its before log is `/tmp/dc-transcript-palette-before.log`.
The complete native after command is
`SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript.spec.ts tests/shadcn/transcript-review.spec.ts`.
Logs: `/tmp/dc-transcript-footer-browser.log` (18/21),
`/tmp/dc-transcript-footer-idle-before.log` (1 failure),
`/tmp/dc-transcript-footer-browser-after.log` (22/22),
`/tmp/dc-transcript-footer-stories-3.log` (45/45),
`/tmp/dc-transcript-footer-types-after.log` and
`/tmp/dc-transcript-footer-units-after.log`.

## Review surface

The full conversation uses jj-store's recorded session, retaining 30 tool
captures, assistant segments, actual returned agent context and source grouping.
Review discussions and linked replies are the original explicitly simulated
overlay; waiting messages and runtime choices are labelled local demos.
`spec/records/transcript-parity-audit.md` records the audit and provenance.

Additional stories expose busy-agent queues, unknown outcomes and cancellation
awaiting acknowledgement, quoted-list typography, status placement/tones, message
reactions/custom emoji and author details/actions. TranscriptFooter composes
custom actions and agent/model choices outside the scrolling document.
The native checks exercise fixed-footer geometry, callbacks, exact quotes,
compact list rows, source/reply navigation, keyboard profile dismissal and focus
restoration, disabled controls, narrow/dark/reduced-motion/forced-colour views,
IME, streaming, retained drafts and inspector teardown.

## Expanded focused checks

The final affected-story run passes 105/105 cases across 13 families: Transcript,
MarkdownContent, MarkdownComposer, CommentComposer, PromptContext, Composer,
ComposerDrawer, ComposerInput, Conversation, DictationButton, Layout, SendButton
and AppShell. The exact invocation is in
`/tmp/dc-transcript-footer-stories-after.log`; it uses
`pnpm test:storybook` with those story files, `--maxWorkers=1` and
`--no-file-parallelism`. These include the baseline targets and every directly
composing Composer catalog family, with interaction and axe checks enabled.
The final recorded-session native recheck opens the actual returned-agent
disclosure and nested XML context: 1/1 passes
(`tests/shadcn/transcript-review.spec.ts --grep 'recorded session'`,
`/tmp/dc-transcript-recorded-xml-browser.log`).

`pnpm spec:check` passes all three lanes, `pnpm check:no-tailwind` passes,
`pnpm fmt:check` passes for the complete repository and `pnpm test:release`
passes 16/16. Logs use `/tmp/dc-transcript-footer-{spec,css,format}-after.log`
and `/tmp/dc-transcript-footer-release-tests.log`.

`pnpm packages:pack` passes (`/tmp/dc-transcript-footer-pack-final.log`): a clean
registry consumer passes types and cold development/production runtime checks
without Tailwind tooling or Svelte diagnostics. Both themes exercise retained
queue cancellation, Queue/Stop callbacks and XML disclosure through public
exports. The first run exposed one fixture failure: the second theme reused the
first theme's cancelling state. An explicit host-fixture reset now remounts the
scenario before each pass; cancellation and disclosure assertions remain intact.
The initial failure is in `/tmp/dc-transcript-footer-pack-after.log`.

Archive SHA-256:
`82c89c2d17d728cd0758e1f673342e5427eaaf6ce1455fca953d72cf10356086`.
Direct archive inspection finds the three new public component files and zero
reference recording/adapter or `.stories.fixture.*` files among 3,964 entries.
The existing approved low-severity KaTeX audit exception is unchanged. This is
local archive acceptance, not publication.

The final `pnpm build-storybook` passes
(`/tmp/dc-transcript-footer-build-final.log`).
`pnpm workspace:visual:audit -- --index=storybook-static/index.json` reports
zero contract errors (`/tmp/dc-transcript-footer-metadata-final.log`).
Changed stories retain `visual-pending`; no screenshot baseline was updated.

After packing and the static build, a fresh Storybook process on 9509 reports
`Catalog client ready`. A fresh native browser passes all three queue,
reaction/profile and recorded-session cases using
`SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript-review.spec.ts --grep 'busy-agent|external controllers|recorded session'`
(`/tmp/dc-transcript-footer-browser-cold-final.log`). This includes restricted
custom-image reaction addition/removal, profile actions and Escape dismissal
with trigger focus restoration, plus actual recorded XML disclosure.
The review catalog remains running on 9509. A review screenshot is saved at
`/tmp/design-core-recorded-transcript-review.png`, outside baseline directories.

## Qualification boundary

The earlier broad Workspace drag lane remains at 8 passed / 7 failed; the exact
centre and empty-sidebar failures reproduce on unchanged main `31b5d2e2`.
The owner is Workspace Tabs/drag: the inactive compact Plan title has zero width.
The earlier full Storybook run passed 782/783 and failed an existing intermittent
EmojiPicker RestrictedReactions focus case; its unchanged focused recheck passed.
These are recorded in `spec/records/transcript-extraction.md` and remain unwaived.
Focused success does not qualify the complete repository or authorize publication.
The review changes remain separate in Jujutsu change `qsotnrqk` pending that
qualification decision and visual review; no release or consumer migration occurs.

## Follow-up: collapsed discussions, icons and XML discovery

The next review compared jj-store `3be80ad2104f`, including its current Thinking
runtime control (`LightbulbIcon`). The user requested all comments under folded
files. The source still limits summaries to the last root comment; this
refinement deliberately replaces that limit with every nonempty current entry,
including replies, in original order. Historical versions remain excluded.
Nested file/patch rows now lead with 14px decorative file/diff icons; reasoning
uses the lightbulb, with existing host item-icon overrides retained. The catalog
Thinking control now uses that same source icon.

The full recording's returned agent-response section starts expanded, exposing
its XML tag. The new Chat / Prompt Context / Recorded agent context story shows
that exact capture directly and opens the XML tag to demonstrate rendered
Markdown and lists. The captured JSON and exact anchors remain unchanged.

Before editing, the three new native regressions all failed (3/3): the folded
file retained only one of three entries, nested headers had no leading icon, and
the recorded XML control was hidden behind the outer agent disclosure.
The exact same target passes 3/3 after the repairs:
`SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript-review.spec.ts --grep 'collapsed files retain|nested file and thinking|recorded agent context is visible'`.
Logs: `/tmp/dc-transcript-disclosure-before.log` and
`/tmp/dc-transcript-disclosure-after.log`. Source revisions, input text, comment
order, control labels and assertions are retained; no screenshot baseline is
updated. Expanded verification follows separately. The earlier broader
qualification boundary still applies. Previous packed/build evidence above
belongs to the preceding review source, not this refinement.

## Follow-up: sent application-context disclosure

The user clarified that the missing component is jj-store's
`StoreAgentSentContext.svelte`, verified at clean revision `3be80ad2104f`.
The new public SentContext family mirrors its compact secondary button with a
trailing chevron, explicit prepared/queued/sent/failed/unknown labels and one
bounded rendered/raw panel. Nested XML readers stay mounted across delivery
updates, raw switching and collapse/reopen. Typography inherits the source's
small context text and 1.55 leading. Shared ScrollArea owns the panel scrolling.

Hosts supply normalized delivery, exact captured Markdown/XML and optional raw
text; payload interpretation, repository/origin schemas and receipts remain
outside Design Core. `TranscriptItem.sentContext` renders before authored blocks.
The full-recording story's context is a separately labelled unknown-delivery
demo, since the recording contains no outgoing context receipt. `cmp` still
confirms that the reference capture is unchanged.

| Boundary                                                            | Before/intermediate                                                                                              | Current result                                                                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Exact disclosure-before-prompt regression                           | 1 failed: missing disclosure                                                                                     | Same target passes 1/1; final matrix repeats it                                         |
| Cold native component and Transcript suites                         | 29 passed / 1 failed: keyboard test retained the old accessible-name locator after the raw button renamed itself | Corrected name-aware focus assertion passes 1/1; final affected matrix passes 8/8       |
| Storybook interaction and axe, SentContext/PromptContext/Transcript | 31 passed / 1 failed: source app expected a normalized href attribute                                            | 32/32 pass; assert the same exact resolved link destination using its DOM href property |
| Types                                                               | 9 errors in new story query options, followed by 1 exact-optional callback error                                 | All four configurations pass with zero errors/warnings                                  |
| Units                                                               | 788 existing tests                                                                                               | 788/788 pass                                                                            |
| Canonical specification and native-CSS audit                        | New requirement DC-CHAT-011                                                                                      | Three specification lanes and native-CSS audit pass                                     |

Commands use pinned pnpm 10.32.1:

- Exact baseline/recheck: `SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript-review.spec.ts --grep 'sent-context disclosure precedes'`.
- Cold matrix: `SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/sent-context.spec.ts tests/shadcn/transcript.spec.ts tests/shadcn/transcript-review.spec.ts`.
- Final affected matrix: `SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/sent-context.spec.ts tests/shadcn/transcript-review.spec.ts --grep 'delivery states|keyboard raw|wide context|narrow context|sent-context disclosure|collapsed files retain|nested file and thinking|recorded agent context is visible'`.
- Catalog: `pnpm test:storybook src/shared/chat/sent-context/SentContext.stories.svelte src/shared/chat/prompt-context/PromptContext.stories.svelte src/shared/chat/transcript/Transcript.stories.svelte`.
- Static/source gates: `pnpm check:types`, `pnpm test:unit`, `pnpm check:no-tailwind` and `pnpm spec:check`.

Logs: `/tmp/dc-sent-context-before.log`, `/tmp/dc-sent-context-after.log`,
`/tmp/dc-sent-context-cold-browser.log`, `/tmp/dc-sent-context-keyboard-after.log`,
`/tmp/dc-sent-context-browser-final.log`, `/tmp/dc-sent-context-stories-final.log`,
`/tmp/dc-sent-context-types-final.log`, `/tmp/dc-sent-context-units.log`,
`/tmp/dc-sent-context-css-final.log` and `/tmp/dc-sent-context-spec-final.log`.
The first warm recheck collided with specification-generated page reloads; its
unchanged isolated rerun passed. The first cold launch also attempted to start
a duplicate server before readiness; the owned server was retained and tested
after readiness. Neither startup attempt ran a failing product assertion.

Manual review opened the actual SentContext story and nested Markdown in the
in-app browser. Screenshot: `/tmp/design-core-sent-context-review.png`.
Storybook remains on 9509; the restart preserved the foreign 9710 listener.
New stories remain visual-pending and screenshot baselines are untouched.
The packed-consumer fixture now includes SentContext, but its runtime run and
the static-build/package gates have not been repeated for these refinements.
The earlier unwaived repository-wide qualification boundary remains. This is a
review checkpoint in `qsotnrqk`, without publication or consumer migration.

## Follow-up: one conversation, two presentations and consistent reply fonts

The full conversation now exposes a controlled Document / Classic selector using
the existing SegmentedControl and Transcript `view` contract. Both modes retain
the same items, exact captured text, comment controller and mounted readers.
The composer snippet consumes the applied view on one MarkdownComposer, selecting
document or framed presentation without dropping drafts or interrupting IME.
The copyable public example documents the same composition; no new export is added.

The subsequent font review found a separate 1rem/16px comment default against the
0.875rem/14px transcript prose. Following that review, rendered comments, quoted
context and comment editors default to the transcript prose size. The existing
`--ui-transcript-comment-font-size` override remains available. Source jj-store
still uses 1rem comments; this smaller default is an intentional review refinement.
Reply prose and comments now resolve the captured host font and foreground across
Mira scopes, preserving syntax colours and muted status/metadata presentation.
DC-CHAT-001, DC-CHAT-006 and the styling contract record these decisions.

| Boundary                       | Before                                                                                    | After                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Full-story view selector       | Exact regression failed 1/1: no Classic control                                           | Same target passes; data/readers, message and comment drafts, folds, context raw state and queued messages survive both directions |
| Reply typography               | Exact regression failed 1/1: quoted reply text was 16px against 14px prose                | Passes in both views and light/dark themes, comparing family, size and foreground across reply body, quote and comment             |
| IME                            | Existing component defers applied view; fixture did not expose switching                  | Native regression proves both view and composer wait for composition end without replacing the editor                              |
| Complete affected native set   | First fresh-server run: 32 passed / 1 initial readiness timeout before product assertions | The unchanged exact failed case passes 1/1 on a second fresh server; all 33 distinct cases pass across those runs                  |
| Transcript interaction and axe | 22/22 before the font refinement                                                          | 22/22 after the refinement                                                                                                         |
| Types, units and native CSS    | Current focused source checks                                                             | All four type configurations have zero errors/warnings, 788/788 units pass and the native-CSS audit passes                         |

The cold run used temporary ports 9609/9610 and preserved the review catalog on 9509. The timeout was the existing 15-second story-finished readiness guard while
the first full-recording story initialized. Its unchanged, isolated fresh-server
recheck passed in 14.4 seconds; no assertion or timeout was loosened. Temporary
services were stopped through the owned workspace stop script afterward.

Commands:

- Exact view baseline: `SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript-view.spec.ts --grep 'document and classic share'`.
- Exact font baseline/recheck: `SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript-view.spec.ts --grep 'reply prose'`.
- Cold set: `SHADCN_STORYBOOK_PORT=9609 SHADCN_VISUAL_SERVER_PORT=9610 pnpm test:shadcn:pointer tests/shadcn/transcript-view.spec.ts tests/shadcn/transcript.spec.ts tests/shadcn/transcript-review.spec.ts tests/shadcn/sent-context.spec.ts`.
- Unchanged cold recovery: `SHADCN_STORYBOOK_PORT=9609 SHADCN_VISUAL_SERVER_PORT=9610 pnpm test:shadcn:pointer tests/shadcn/transcript-review.spec.ts --grep 'sent-context disclosure precedes'`.
- Catalog: `pnpm test:storybook src/shared/chat/transcript/Transcript.stories.svelte`.
- Source gates: `pnpm check:types`, `pnpm test:unit`, `pnpm check:no-tailwind`, `pnpm spec:check` and formatting of the changed files.

Logs: `/tmp/dc-transcript-view-before.log`, `/tmp/dc-transcript-view-after.log`,
`/tmp/dc-transcript-reply-font-before.log`, `/tmp/dc-transcript-reply-font-after.log`,
`/tmp/dc-transcript-view-reply-cold.log`,
`/tmp/dc-transcript-view-reply-cold-recheck.log`,
`/tmp/dc-transcript-view-reply-stories-final.log`,
`/tmp/dc-transcript-view-types.log`, `/tmp/dc-transcript-view-reply-units.log`,
`/tmp/dc-transcript-view-reply-css.log` and `/tmp/dc-transcript-view-spec-final.log`.
The spacing/palette regressions now assert the reviewed 14px size and 21.7px
Markdown leading exactly; padding, palette, late stylesheet and source-retention
assertions remain intact. The recording still matches jj-store byte for byte.

Manual review switched the live full conversation to Classic and captured
`/tmp/design-core-transcript-classic-reply-font-review.png`. Stories remain
visual-pending with no baseline updates. The broader qualification and package
gate boundary above remains unchanged; these refinements stay in the current
review change pending that qualification and review.
