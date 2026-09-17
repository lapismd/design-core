# AI

AI presentation contracts remain provider-neutral and leave transport, model selection, persistence, and product policy downstream. Historical implementation and visual-comparison evidence lives under `spec/records/`; this chapter remains authoritative.

## Public surface coverage

| Surface                 | Public boundary                        | Requirement |
| ----------------------- | -------------------------------------- | ----------- |
| Shared AI invariants    | AI layer                               | DC-AI-001   |
| Layout                  | `@lapismd/design-core/ai/chat`         | DC-AI-002   |
| Layout Scroll Button    | `@lapismd/design-core/ai/chat`         | DC-AI-003   |
| Message List            | `@lapismd/design-core/ai/chat`         | DC-AI-004   |
| Message                 | `@lapismd/design-core/ai/chat`         | DC-AI-005   |
| Message Bubble          | `@lapismd/design-core/ai/chat`         | DC-AI-006   |
| Message Metadata        | `@lapismd/design-core/ai/chat`         | DC-AI-007   |
| System Message          | `@lapismd/design-core/ai/chat`         | DC-AI-008   |
| Composer                | `@lapismd/design-core/ai/chat`         | DC-AI-009   |
| Composer Input          | `@lapismd/design-core/ai/chat`         | DC-AI-010   |
| Composer trigger submit | `@lapismd/design-core/ai/chat`         | DC-AI-024   |
| Composer Drawer         | `@lapismd/design-core/ai/chat`         | DC-AI-011   |
| Send Button             | `@lapismd/design-core/ai/chat`         | DC-AI-012   |
| Composer Token          | `@lapismd/design-core/ai/chat`         | DC-AI-013   |
| Tokenized Text          | `@lapismd/design-core/ai/chat`         | DC-AI-014   |
| Tool Calls              | `@lapismd/design-core/ai/chat`         | DC-AI-015   |
| Tool Call Detail        | `@lapismd/design-core/ai/chat`         | DC-AI-025   |
| Dictation Button        | `@lapismd/design-core/ai/chat`         | DC-AI-016   |
| Emoji Picker            | `@lapismd/design-core/ai/experimental` | DC-AI-017   |
| Reaction Bar            | `@lapismd/design-core/ai/experimental` | DC-AI-018   |
| Reasoning               | `@lapismd/design-core/ai/experimental` | DC-AI-019   |
| Typing Indicator        | `@lapismd/design-core/ai/experimental` | DC-AI-020   |
| Unread Divider          | `@lapismd/design-core/ai/experimental` | DC-AI-021   |
| Conversation            | Storybook composition                  | DC-AI-022   |
| AI Overview             | Documentation surface                  | DC-AI-023   |

## DC-AI-001 — Shared AI invariants

**Requirement.** The Shared AI invariants family MUST keep AI presentation, input, review, and streaming state independent of model providers, transport, persistence, and product policy.

### Acceptance details

- The public boundary is AI layer.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-002 — Layout

**Requirement.** The Layout family MUST compose a bounded chat surface with one scroll-position owner. Consumers MAY supply controlled unread state, conversation identity and saved reading position. Geometry observation MUST only maintain layout and anchoring; it MUST NOT imply message arrival.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The default `scrollMode="stream"` MUST retain existing streaming auto-follow, spring navigation and snippet composition, while `scrollMode="history"` opts in to anchored cached-history navigation.
- The generated ScrollArea wrapper and empty state MUST preserve the bounded viewport height while the composer remains docked.
- Manual arrival at the latest content MUST dismiss generic arrival notifications; failed or pending jumps MUST NOT acknowledge controlled unread content, and switching identity MUST reset transient state.

## DC-AI-003 — Layout Scroll Button

**Requirement.** The Layout Scroll Button family MUST expose an accessible action for returning to the latest content when the transcript is displaced.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The control MUST render inside the transcript `scroll-shell`, not in the composer dock.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-004 — Message List

**Requirement.** The Message List family MUST render ordered message content with stable scrolling and consumer-owned records. Opt-in virtualization MUST retain stable row keys and active interaction anchors while bounding mounted rows; existing snippet consumers MUST remain compatible.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- Existing children, density, gap, streaming, empty-state and manual Load older messages APIs MUST retain their defaults without instantiating a virtualizer; `virtualize={true}` opts in to row rendering, single-flight anchored paging and the guarded 600 px loading boundary.
- User intent and Jump to latest MUST invalidate pending positioning work while accessible Load older messages and Retry controls remain available, with the virtualizer alone owning row anchoring and deferred measurements preserving the reader's following intent.
- Unchanged virtualizer inputs MUST NOT schedule new measurements or position reports, while history-mode resize work MUST be coalesced outside observer delivery and cancelled on teardown.

## DC-AI-005 — Message

**Requirement.** The Message family MUST compose role-aware message content, metadata, actions, and tool presentation.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-006 — Message Bubble

**Requirement.** The Message Bubble family MUST present role-aware message content with readable width and token-driven surfaces. Filled user and assistant messages MUST remain visually distinguishable without consumer overrides.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-007 — Message Metadata

**Requirement.** The Message Metadata family MUST present timestamps, status, model, and related message metadata accessibly.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-008 — System Message

**Requirement.** The System Message family MUST present system or contextual notices distinctly from conversational turns.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-009 — Composer

**Requirement.** The Composer family MUST coordinate controlled input, tokens, attachments or drawers, and submit affordances. Its elevation and focus chrome MUST remain visible when host shadow tokens are absent and MUST NOT stack a focus border with its focus ring.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- When `disabled` and `isStopShown` are both true, the stop control MUST remain pointer-interactive while input, send, and other body actions stay blocked.

## DC-AI-010 — Composer Input

**Requirement.** The Composer Input family MUST provide accessible multiline controlled input with keyboard submission behavior.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Trigger menus MUST anchor to the caret or input using the composer-input containing block, flip above when space below the nearest clipping ancestor or the viewport is insufficient, and MUST NOT use viewport-fixed coordinates that drift inside isolated or transformed hosts.
- Trigger selection MUST guard indexed search results under unchecked-index consumer semantics.

## DC-AI-011 — Composer Drawer

**Requirement.** The Composer Drawer family MUST reveal supplementary composer controls without owning their domain state.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- A consumer MAY keep the drawer interactive while the disabled composer body blocks input and send except the stop control when `isStopShown` is true.
- File chips and lettered feedback options MUST use distinct rest and hover attachment fill tokens plus the compact radius: chips stay darker than the drawer at rest, focused remove controls expose their interactive paint, and selected feedback paint stays distinct from the drawer.

## DC-AI-012 — Send Button

**Requirement.** The Send Button family MUST provide accessible submit, stop, disabled, and busy presentation for consumer actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The stop presentation MUST stay enabled, fully opaque, and clickable even when the parent Composer is disabled.
- The stop presentation MUST use a solid inverse fill (dark background, light icon) with a distinct hover state.

## DC-AI-013 — Composer Token

**Requirement.** The Composer Token family MUST present removable or selectable composer context as a compact accessible token.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-014 — Tokenized Text

**Requirement.** The Tokenized Text family MUST render mixed text and structured inline tokens without losing readable text semantics.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-015 — Tool Calls

**Requirement.** The Tool Calls family MUST present tool invocation status, arguments, results, and disclosure without executing tools.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Tool-call disclosure indicators MUST point right while closed and down while open for both grouped calls and individual call details, and single-call rendering MUST remain safe under unchecked-index consumer semantics.
- Pending and running calls MUST render the public Spinner as a rotating busy indicator.

## DC-AI-016 — Dictation Button

**Requirement.** The Dictation Button family MUST present accessible start and stop dictation state without owning speech services.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-017 — Emoji Picker

**Requirement.** The Emoji Picker family MUST provide an explicitly experimental keyboard-accessible emoji selection surface.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-018 — Reaction Bar

**Requirement.** The Reaction Bar family MUST provide explicitly experimental controlled reaction actions and selected state.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Optional emoji choices MUST be omitted rather than forwarded as explicit `undefined` values.

## DC-AI-019 — Reasoning

**Requirement.** The Reasoning family MUST provide explicitly experimental disclosure for reasoning or progress content.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- A streaming reasoning row MUST rotate its progress icon unless the user prefers reduced motion.

## DC-AI-020 — Typing Indicator

**Requirement.** The Typing Indicator family MUST provide an explicitly experimental accessible indication of remote composition.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-021 — Unread Divider

**Requirement.** The Unread Divider family MUST provide an explicitly experimental semantic boundary between read and unread messages.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-022 — Conversation

**Requirement.** The Conversation family MUST demonstrate an end-to-end chat composition using only public AI presentation contracts.

### Acceptance details

- The public boundary is Storybook composition.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-023 — AI Overview

**Requirement.** The AI Overview family MUST describe stable and experimental AI ownership boundaries and public entry points.

### Acceptance details

- The public boundary is Documentation surface.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-024 — Composer trigger submit

**Requirement.** Composer Input trigger items MAY declare `submitOnSelect`. Selecting such an item MUST insert the trigger value and submit immediately. Other items MUST insert and leave the composer editable.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- `submitOnSelect` MUST work for pointer and Enter selection of the highlighted item.
- Items without the flag MUST keep the existing insert-and-continue behavior.

## DC-AI-025 — Tool Call Detail

**Requirement.** Tool Call Detail MUST provide a presentation-only, provider-neutral view of structured tool input, output, and errors, including safe envelope unwrapping and readable code formatting.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- Input, output, and multiline errors MUST use the public Code Block with copy support, wrapping, and bounded height.
- Short one-line errors MAY remain on the Tool Calls summary row; formatter helpers MUST distinguish those alerts without executing or mutating tool data.
- The catalog MUST demonstrate JSON input, command output, and an error without introducing a runtime contract.
