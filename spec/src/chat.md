# Chat

Chat is the host-neutral presentation family. Existing stable AI chat primitives
remain implemented in their current owners and are re-exported through `/chat`,
including ToolCallDetail, RichToolCallDetail and their normalized presentation types
(DC-AI-025).

## Public surface coverage

| Surface           | Public boundary             | Requirement |
| ----------------- | --------------------------- | ----------- |
| Markdown Content  | `@lapismd/design-core/chat` | DC-CHAT-001 |
| Markdown Composer | `@lapismd/design-core/chat` | DC-CHAT-002 |
| Message Actions   | `@lapismd/design-core/chat` | DC-CHAT-003 |
| Reactions         | `@lapismd/design-core/chat` | DC-CHAT-004 |
| Comment Composer  | `@lapismd/design-core/chat` | DC-CHAT-005 |

## DC-CHAT-001 — Markdown Content

**Requirement.** MarkdownContent MUST compose Mira's public embedded preview with safe HTML and host-owned link, asset and extension hooks.

### Acceptance details

- The Chat entry point MUST re-export stable chat primitives without breaking existing AI imports.
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
- The family MUST own native token-driven styles with independent quote/editor typography, compact inline and context presentations, keyboard-accessible actions and representative Storybook examples without requiring an application comment controller.
