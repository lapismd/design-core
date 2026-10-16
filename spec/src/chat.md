# Chat

Chat is the host-neutral presentation family. Existing stable AI chat primitives
remain implemented in their current owners and are re-exported through `/chat`,
including ToolCallDetail, RichToolCallDetail and their normalized presentation types
(DC-AI-025).

## Public surface coverage

| Surface             | Public boundary             | Requirement |
| ------------------- | --------------------------- | ----------- |
| Markdown Content    | `@lapismd/design-core/chat` | DC-CHAT-001 |
| Markdown Composer   | `@lapismd/design-core/chat` | DC-CHAT-002 |
| Message Actions     | `@lapismd/design-core/chat` | DC-CHAT-003 |
| Reactions           | `@lapismd/design-core/chat` | DC-CHAT-004 |
| Comment Composer    | `@lapismd/design-core/chat` | DC-CHAT-005 |
| Transcript          | `@lapismd/design-core/chat` | DC-CHAT-006 |
| Transcript Comments | `@lapismd/design-core/chat` | DC-CHAT-007 |
| Comment Queue       | `@lapismd/design-core/chat` | DC-CHAT-008 |

## DC-CHAT-001 — Markdown Content

**Requirement.** MarkdownContent MUST compose Mira's public embedded preview with safe HTML and host-owned link, asset and extension hooks.

### Acceptance details

- The Chat entry point MUST re-export stable chat primitives without breaking existing AI imports.
- Embedded transcript comments MUST inherit jj-store typography with no additional Markdown inset, compact paragraph spacing and no first/last block margins; standalone MarkdownContent retains its configurable small outer padding.
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

### Acceptance details

- Stable item and block identities MUST retain selection, folds and scroll anchors across append, prepend and source updates, and overlapping inspector readers MUST restore still-mounted source registrations under either teardown order; host extensions own application syntax and authorized navigation.
- Markdown, code, captured line numbers, patches, grouped tools, raw captures, metadata and custom blocks MUST use native CSS with family-owned tokens and keyboard-accessible controls.
- HistoryEdge MUST expose loading, empty, load and retry presentation without discarding retained content or executing transport.

## DC-CHAT-007 — Anchored transcript comments

**Requirement.** TranscriptController MUST keep caller-owned comment state attached to exact block IDs, revisions, UTF-16 ranges and quotes without editing captured text or relocating stale anchors.

### Acceptance details

- Selection, keyboard, typing, paste and IME MUST create equivalent exact anchors; multiple comments and whole-section anchors MUST retain drafts through folding and raw/rich transitions.
- Changed or missing sources MUST retain quotes and unavailable explanations, and source navigation MUST reveal folded content before restoring selection and focus.
- Comment editors MUST compose CommentComposer, retain host typography and block edits/submission while disabled or sending.

## DC-CHAT-008 — Comment queue and reply navigation

**Requirement.** CommentQueue and transcript turn navigation MUST present host-acknowledged submitted snapshots and destinations without owning persistence, retries or agent execution.

### Acceptance details

- Mixed and comments-only submissions MUST preserve exact snapshots and newer edits; only explicit acknowledgement MAY mark submitted entries delivered or clear the corresponding message.
- Rejection and unknown outcomes MUST retain drafts and request identity; an absent outcome MUST never count as delivery.
- Source, queue and reply navigation MUST expose named keyboard/touch targets, reveal disclosures and retain discussion state and opener focus.
