# jj-store transcript parity audit

Audit source: jj-store `2a479c74` (17 October 2026), compared with the current
Design Core chat-transcript workspace. Apache-2.0, LapisMD contributors.
This is a presentation audit. Runtime/session authority, identity resolution,
durable delivery and application routing remain in consumer adapters.

| Source boundary                                                                                  | Finding and shared outcome                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CommunityMarkdownContent, appearance.css, comment-card.css                                       | jj-store maps Mira's palette to host colours, uses 1rem comments, compact paragraph spacing and zero preview inset. Bind those values before nested Mira readers; remove preserved whitespace from rendered quotes and collapse list-row margins.     |
| StoreAgentChatBody, ChatTools, ChatToolBlocks                                                    | Existing immutable readers, raw/rich transitions, tool groups and file folds were present. Add explicit tool/group icon inputs and a compact row-gap token. Keep tool-name inference in the catalog adapter.                                          |
| StoreAgentPromptQueue, QueuedPromptText                                                          | Missing from the original extraction. Add MessageQueue for exact host submission snapshots, long-text expansion, recipient state and cancellation/status-review requests; never remove or acknowledge data internally.                                |
| ChatMessageFooter, StoreAgentMessageFooter, ChatRuntimeControls                                  | The original stories supplied only a composer. Add fixed TranscriptFooter with Send/Queue/Stop states, pending stop access and custom actions/workspace/controls. Runtime and model choices in stories are local host examples.                       |
| ChatHoverActions, CommunityReactions                                                             | Hover reaction hooks existed but the story supplied none, and external controllers could hide Transcript callbacks. Supply explicit reactive presentation context, custom/restricted emoji, controlled addition/toggling and a review story.          |
| prompt-elements-extension, prompt-element-ranges, remark-prompt-elements, StorePromptElement/Tag | Missing XML-style ACP/prompt context. Port as PromptContext and public promptElementsExtension, using Mira's public safe preview pipeline. Keep malformed/code examples literal and attributes inert. Adapt the original boundary/highlighting tests. |
| ChatReplyContext, referenceDiscussions, next-message                                             | Comment reply rendering/navigation existed, but the review fixture did not show a complete conversation. Reuse the sanitized recorded session, the source adapter's grouping/byte offsets, and its explicitly simulated review reply overlay.         |
| CommunityMemberAvatar                                                                            | Add an optional shared author popover with host-supplied details and buttons; identity/profile routes stay with the host. Use shared Popover/ScrollArea and restore trigger focus.                                                                    |
| ChatToolPanel, source/file navigation, live conversation/queue controllers                       | Preserve generic inspector and navigation callbacks. Live reads, execution, durable queues, cancellation acknowledgement, session stop policy and domain routes are host concerns, not shared presentation gaps.                                      |

## Recorded story provenance

The full story copies jj-store's already sanitized
`catalog/fixtures/delta-chat/reference.json` without changing it: Delta 0.1.0,
“Add configurable screen lock overlay”, captured 8 October 2026, original capture
SHA-256 `1f5a9006beecf8c62c671ef19bb6a3dbe60bfe65a21b7e66f97257912259ec24`.
The copied sanitized JSON itself has SHA-256
`883fc81be0eb9aa5a359c40d9d6bd4987b4feb5904d284e721874cb3047c30c4`;
`cmp` confirms it matches jj-store's fixture byte for byte.
Its existing adapter retains 30 tool captures, assistant segments between groups,
returned agent responses and UTF-8-to-UTF-16 conversion. Raw tool metadata is a
labelled JSON projection retaining the source input/output strings, not a claim
to reproduce wire bytes. The source reference discussion overlay labels its
comments/replies simulated. The extra waiting message and footer controls are
also demos; no agent is contacted or captured command executed.

All reference data/adapters use `.stories.fixture.*` filenames so they stay out
of the published archive. Production components import no jj-store models or
fixture data. This audit identifies the above presentation gaps as addressed in
source; verification results are recorded separately in transcript-footer-review.md.

The subsequent review rechecked jj-store `3be80ad2104f` and its lightbulb Thinking
control. As explicitly requested, collapsed discussions now show all current
entries and replies rather than the source's last-comment summary. Nested file
and patch disclosures gain leading icons. The recorded agent XML section is
exposed in the full transcript and has a direct Prompt Context story with
rendered Markdown. These are presentation refinements; the captured JSON and
exact source/anchor ownership remain unchanged.

## Sent-context correction

The later user clarification identifies `StoreAgentSentContext.svelte` at
jj-store `3be80ad2104f`, rather than the returned-agent XML block. SentContext
now preserves its compact trailing-chevron disclosure, explicit delivery labels,
subtle surface, one rendered/raw panel and mounted nested XML readers.
TranscriptItem accepts separate context before authored blocks. Hosts supply
normalized delivery and exact content/raw text; repository-specific fallback
schemas and origin resolution stay in adapters. The full recording includes an
explicitly labelled demo with unknown delivery, since the capture has no outgoing
context receipt. Shared ScrollArea replaces the source native scrolling.

The later full-conversation review exposes both controlled presentations using
one data set and controller. It intentionally replaces jj-store's 1rem comment
default with the surrounding transcript prose size (0.875rem by default), and
binds reply prose, quotes and comments to the captured host font/foreground.
The existing comment-size override remains available. See the review record for
exact before/after typography, retained-state and cold-browser evidence.

## Subsequent repair pass

The follow-up comparison against jj-store `3be80ad2104f` identified eight remaining
gaps: duplicate reply-card chrome, jump-to-end focus, Classic message anatomy,
Enter behaviour across views, acknowledged-comment editing, docked composer
actions, message metadata and long-queue expansion styling. These are addressed
in the separate repair change. See [the repair record](transcript-parity-repairs.md)
for behaviour, exact regression evidence and the remaining qualification boundary.
The recorded fixture and intentional 14px comments are preserved. A subsequent
user request restores jj-store's last-root-comment summary per collapsed discussion;
expanding reveals earlier comments and linked agent responses remain in the transcript.
Transport, durable edits and conflict resolution remain host-owned.
