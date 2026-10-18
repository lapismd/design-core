# Chat

Chat is the host-neutral presentation family. Existing stable AI chat primitives
remain implemented in their current owners and are re-exported through `/chat`,
including ToolCallDetail, RichToolCallDetail and their normalized presentation types
(DC-AI-025).

### Presentation notes

Classic presentation uses the shared Message primitive with an author/role header,
larger avatar and hover surface while retaining the document's mounted readers.
Optional metadata includes edited state, reply participants/count and a host reply
callback, with display timestamps separate from valid machine-readable dates.
Reply contexts have one padded outer border around the quote and comment list.
Jump to end focuses the enabled composer when present, otherwise the last item.
The full-conversation example retains multiline Enter in either view.

### Composition notes

MarkdownComposer can expose its live formatting/emoji actions through a bound
snippet for a fixed footer, removing the inline duplicate while retaining editor
selection and releasing the snippet on teardown. Long queued messages use the
compact fold row with a trailing divider.

## Public surface coverage

| Surface                             | Public boundary             | Requirement |
| ----------------------------------- | --------------------------- | ----------- |
| Markdown Content                    | `@lapismd/design-core/chat` | DC-CHAT-001 |
| Markdown Composer                   | `@lapismd/design-core/chat` | DC-CHAT-002 |
| Message Actions                     | `@lapismd/design-core/chat` | DC-CHAT-003 |
| Reactions                           | `@lapismd/design-core/chat` | DC-CHAT-004 |
| Comment Composer                    | `@lapismd/design-core/chat` | DC-CHAT-005 |
| Transcript                          | `@lapismd/design-core/chat` | DC-CHAT-006 |
| Transcript Comments                 | `@lapismd/design-core/chat` | DC-CHAT-007 |
| Comment Queue                       | `@lapismd/design-core/chat` | DC-CHAT-008 |
| Transcript Footer and Message Queue | `@lapismd/design-core/chat` | DC-CHAT-009 |
| Prompt Context                      | `@lapismd/design-core/chat` | DC-CHAT-010 |
| Sent Context                        | `@lapismd/design-core/chat` | DC-CHAT-011 |
| Versioned comment editing           | `@lapismd/design-core/chat` | DC-CHAT-012 |

| Composer Suggestions | `@lapismd/design-core/chat` | DC-CHAT-013 |
| Thread Panel | `@lapismd/design-core/chat` | DC-CHAT-014 |

## DC-CHAT-001 — Markdown Content

**Requirement.** MarkdownContent MUST compose Mira's public embedded preview with safe HTML and host-owned link, asset and extension hooks.

### Acceptance details

- The Chat entry point MUST re-export stable chat primitives without breaking existing AI imports.
- Transcript reply prose, quoted context and comments MUST share the host prose font and foreground across Mira reader boundaries, with comments defaulting to the transcript prose size (0.875rem) rather than a separate 1rem; retain no additional Markdown inset, compact quoted lists and no first/last block margins while standalone MarkdownContent keeps its configurable small outer padding.
- Markdown MUST retain transparent parent-composed backgrounds, left-aligned compact/full-width presentation with small token-driven padding, streaming updates, public preview hooks and late stylesheet loading without copying Mira internals.
- Published Mira 0.0.5 MUST be qualified before the new preview is added; domain-specific references and authorization remain consumer extensions.

## DC-CHAT-002 — Markdown Composer

**Requirement.** MarkdownComposer MUST compose the existing Composer shell and public Mira editor APIs with controlled drafts and host-owned submission intent.

### Acceptance details

- The component MUST support framed and document presentations with left-aligned editor content, top reply quotes, form serialization, contextual content, host actions, disabled/busy state and bottom formatting actions with accessible tooltips; document presentation uses a transparent prose surface, a host-supplied avatar vertically centred beside the first draft line and a tall writing area.
- Formatting, emoji insertion, optional host-owned reply cancellation and presentation changes MUST retain the draft and editor selection through public Mira and CodeMirror APIs, with custom emoji syntax and editor extensions supplied through host hooks.
- Keyboard submission MUST distinguish Enter, Shift+Enter, modifier submission and IME composition, while disabled/busy controls MUST block submission and editing.
- Submission MUST emit the exact draft snapshot without clearing it, leaving acknowledgement, failed delivery feedback, persistence and any clearing to the host.

## DC-CHAT-003 — Message Actions

**Requirement.** MessageActions MUST expose host-supplied message actions through hover, keyboard focus and touch without embedding application policy.

### Acceptance details

- Hosts MUST supply action identifiers, labels, availability, optional icons and callbacks, with primary actions and an overflow menu supported.
- Actions MUST remain reachable through keyboard focus and touch, stay visible while their menu or reaction picker is open, and restore trigger focus after dismissal.
- Disabled actions MUST expose their explanations and never invoke host callbacks.
- The component MAY compose the shared emoji picker with custom or explicitly restricted choices, retaining host-owned reaction updates.

## DC-CHAT-004 — Reactions

**Requirement.** The shared ReactionBar MUST present controlled Unicode and custom-image reactions while preserving its experimental import and callback compatibility.

### Acceptance details

- Custom emoji MUST use neutral shared registration records, with accessible reaction counts and independently controlled selected state.
- Explicit restricted choices, including an empty list, MUST remain authoritative over the full picker and registered custom emoji.
- Disabled state MUST block reaction changes and picker opening while host callbacks continue receiving the string and optional custom record.
- The stable Chat and experimental AI imports MUST resolve to the same implementation and retain existing Unicode-only usage.

## DC-CHAT-005 — Comment Composer

**Requirement.** CommentComposer MUST present a controlled compact comment editor with optional captured source context and host-owned navigation and delivery.

### Acceptance details

- Captured code or safe Markdown quotes MUST appear above the avatar/editor card, retain their original text and expose optional source navigation and unavailable-source explanation without relocating anchors.
- Enter MUST insert a newline, modifier+Enter MUST emit the exact nonblank draft without clearing it, and IME composition MUST never submit.
- Optional dismissal and removal MUST request host actions while context changes retain editor identity, draft and selection; disabled, pending and read-only states MUST block edits and submission.
- The family MUST support a bare presentation for composition inside an existing comment card and own native token-driven styles with independent quote/editor typography, compact inline and context presentations, keyboard-accessible actions and representative Storybook examples without requiring an application comment controller.

## DC-CHAT-006 — Transcript and history edge

**Requirement.** Transcript MUST present immutable host-owned conversations in document and classic views, preserving jj-store reference geometry, exact source text and reader identity during streaming and history loading.

GFM tables and complete fenced code blocks MUST render through the existing safe
Markdown reader while keeping the original captured source and offsets.
Incomplete captures remain source content and fenced table examples remain
literal code; reader widgets never write captured text.

### Acceptance details

- Stable item and block identities MUST retain selection, folds and scroll anchors across append, prepend and source updates, and overlapping inspector readers MUST restore still-mounted source registrations under either teardown order; host extensions own application syntax and authorized navigation.
- Markdown, code, captured line numbers, patches, compact grouped tools with host-supplied icons, uniform disclosure heights and activity gaps, raw captures, metadata and custom blocks MUST use native CSS with family-owned tokens and keyboard-accessible controls, with optional author details/actions through the shared AuthorCard in hover or popover mode across messages, comments, queues and composer avatars; nested file disclosures MUST lead with file/patch icons and reasoning MUST have a distinct lightbulb icon unless overridden by the host.
- HistoryEdge MUST expose loading, empty, load and retry presentation without discarding retained content or executing transport.
- Controlled document/classic switching MUST reuse the same items and controller, retain captured readers, comments, drafts and disclosures, defer through IME composition and supply the applied view to the composer snippet, as demonstrated by the full-conversation example.

## DC-CHAT-007 — Anchored transcript comments

**Requirement.** TranscriptController MUST keep caller-owned comment state attached to exact block IDs, revisions, UTF-16 ranges and quotes without editing captured text or relocating stale anchors.

### Acceptance details

- Selection, keyboard, typing, paste and IME MUST create equivalent exact anchors; multiple comments and whole-section anchors MUST retain drafts through folding and raw/rich transitions, and collapsed files/tools/sections MUST show only the last nonempty current root comment per anchored discussion, with earlier comments restored on expansion and agent responses retained in their linked messages.
- Changed or missing sources MUST retain quotes and unavailable explanations, and source navigation MUST reveal folded content before restoring selection and focus.
- Comment editors MUST compose CommentComposer, retain host typography and block edits/submission while disabled or sending.
- Unavailable-source status MUST reuse Composer's curved status banner with host-selected semantic colour and top/bottom placement, while retaining the exact quote and explanation.

## DC-CHAT-008 — Comment queue and reply navigation

**Requirement.** CommentQueue and transcript turn navigation MUST present host-acknowledged submitted snapshots and destinations without owning persistence, retries or agent execution.

### Acceptance details

- Mixed and comments-only submissions MUST preserve exact snapshots and newer edits; only explicit acknowledgement MAY mark submitted entries delivered or clear the corresponding message.
- Rejection and unknown outcomes MUST retain drafts and request identity; an absent outcome MUST never count as delivery.
- Source, queue and reply navigation MUST expose named keyboard/touch targets, reveal disclosures and retain discussion state and opener focus.

## DC-CHAT-009 — Transcript footer, queued messages and reactions

**Requirement.** Transcript MUST offer host-neutral queued-message and fixed-footer presentation matching jj-store, alongside controlled message reactions.

### Acceptance details

- TranscriptFooter MUST select Send, Queue or Stop from host-supplied busy/content/pending state, use jj-store's paper-plane icon for idle Send, upward arrow for Queue and square for Stop, preserve accessible names and keyboard activation, and accept custom actions, workspace content and controls without executing agent operations.
- MessageQueue MUST retain exact immutable submission text/comments, recipients, cancellation/error/unknown states and expansion; callbacks request host actions and MUST NOT remove entries or infer delivery.
- Transcript examples MUST show busy-agent message queues, comments-only submission, retained/rejected drafts, extensible footer controls and reaction addition/toggling including custom emoji and disabled controls; the full conversation MUST demonstrate a host-acknowledged stop returning to idle and a new idle submission starting a busy response.
- Footer and reactions MUST work with externally owned TranscriptController instances; MarkdownComposer MUST allow its send control to be omitted when the fixed footer owns sending, without losing editor identity or formatting controls.

## DC-CHAT-012 — Editing acknowledged comments

**Requirement.** TranscriptController MUST preserve acknowledged comments while submitting host-authorized, versioned replacement drafts.

### Acceptance details

- Editing MUST require an available source, an authored current sent/replied comment with a host version and explicit host capability, and MUST resume an existing replacement draft rather than duplicate it.
- Submission MUST include the exact original comment/message/version identity without mutating the acknowledged text or source anchor.
- Only explicit publication acknowledgement MAY retire the replaced version, while rejection, queued delivery and unknown outcomes retain it alongside the replacement draft or pending version.
- Acknowledgement MUST preserve newer draft edits and use host-returned comment versions for subsequent editing, with missing versions preventing another edit until the host supplies one.

## DC-CHAT-010 — XML prompt context

**Requirement.** PromptContext and promptElementsExtension MUST adapt jj-store's inert XML-style context presentation through Mira's public preview extension API.

### Acceptance details

- Arbitrary tag names and attributes MUST remain escaped display text, with nested safe Markdown, compact single-line sections and accessible disclosures; source tags MUST NOT execute HTML, scripts or host commands.
- Inline/fenced code, malformed or excessively nested elements MUST retain their original text without guessed hidden boundaries, while UTF-16 offsets, Unicode and document references remain intact.
- The extension MUST compose with host-owned Markdown hooks in standalone previews and Transcript context blocks, retaining the exact captured text and anchors independently of rendering; the catalog MUST expose a direct recorded XML/Markdown example and keep that context discoverable in the full transcript.

## DC-CHAT-011 — Sent-context disclosure

**Requirement.** SentContext MUST reproduce jj-store's compact application-context disclosure before authored prompt content, with explicit host-owned delivery and one rendered/raw panel.

### Acceptance details

- Prepared, queued, sent, failed and unknown delivery MUST retain distinct labels, with a trailing expansion chevron, subtle resting surface and neutral hover; absent or blank captured content MUST render no disclosure regardless of raw data.
- Expansion, raw selection and nested XML reader identity MUST survive delivery acknowledgements, raw/rendered switching and collapse/reopen without rewriting captured content; keyboard controls MUST retain visible focus and accessible names.
- The bounded panel MUST use shared ScrollArea, safe PromptContext Markdown/XML and an icon-only raw toggle; hosts supply exact raw text and Markdown hooks without shared schema interpretation, transport or receipt inference.
- TranscriptItem MAY provide this context separately from authored blocks; the disclosure MUST precede message content, and recorded examples MUST distinguish demo context from captured delivery evidence.

## DC-CHAT-013 — Markdown composer suggestions

**Requirement.** MarkdownComposer MUST support neutral asynchronous trigger suggestions through public Mira and CodeMirror APIs.

### Acceptance details

- Suggestions MUST retain existing ComposerTrigger search and insertion contracts with keyboard navigation, selection replacement and host-supplied labels.
- Aborted, stale, disabled or disposed searches MUST never replace newer results or mutate the retained draft.
- IME composition and escaped inline or fenced code MUST not trigger unintended insertion or message submission.
- Completion handling MUST claim Enter only for a registered trigger query; Shift+Enter and ordinary document newlines MUST retain their existing editing behavior.

## DC-CHAT-014 — Thread panel

**Requirement.** ThreadPanel MUST compose host-owned nested messages, reactions, history and controlled drafts without owning transport or persistence.

### Acceptance details

- Stable message IDs and explicit parent IDs MUST determine reply order and bounded connector geometry while missing parents and cycles remain readable.
- Reply selection and source navigation MUST focus the retained composer without clearing its draft.
- Submission MUST emit exact text and parent identity while failed or unacknowledged submissions retain the draft and newer edits.
- Message actions, author details, Markdown extensions, loading history and disabled controls MUST compose existing shared primitives.

## DC-CHAT-015 — Reply participant summaries

**Requirement.** Transcript reply metadata MUST reuse the shared AvatarGroup in document and classic presentations with separate participant details and reply navigation controls.

### Acceptance details

- The compact group MUST use the `xs` size and preserve supplied participant order, images, emoji, initials, shape and background.
- The separate labelled reply control MUST own keyboard activation and navigation callbacks while participant details remain outside it without nested buttons.
- Optional author presentation MUST compose the same shared AuthorCard for reply participants, retaining host-owned descriptions, details and actions.
- Reply-link decoration MUST apply only to the count label, leaving participant avatars separate and undecorated.
