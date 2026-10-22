# AI

RichToolCallDetail read/edit headers and search locations use the shared FileTypeIcon only when normalized presentation includes an explicit path. Open-file callbacks retain their exact path, line and column; unknown locations, raw payloads and status/action icons remain distinct.

AI presentation contracts remain provider-neutral and leave transport, model selection, persistence, and product policy downstream. Historical implementation and visual-comparison evidence lives under `spec/records/`; this chapter remains authoritative.

Composer disabled surfaces use the public
`--ui-ai-chat-composer-disabled-opacity` token (default `0.6`). Read-only
MarkdownComposer sets it to `1` to preserve readable drafts and avatars while
retaining disabled control semantics (DC-AI-009, DC-CHAT-002).

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
| Content View Toggle     | `@lapismd/design-core/chat`            | DC-AI-027   |
| Tool Call Detail        | `@lapismd/design-core/ai/chat`         | DC-AI-025   |
| Dictation Button        | `@lapismd/design-core/ai/chat`         | DC-AI-016   |
| Emoji Picker            | `@lapismd/design-core/ai/experimental` | DC-AI-017   |
| Reaction Bar            | `@lapismd/design-core/ai/experimental` | DC-AI-018   |
| Reasoning               | `@lapismd/design-core/ai/experimental` | DC-AI-019   |
| Typing Indicator        | `@lapismd/design-core/ai/experimental` | DC-AI-020   |
| Unread Divider          | `@lapismd/design-core/ai/experimental` | DC-AI-021   |
| Conversation            | Storybook composition                  | DC-AI-022   |
| AI Overview             | Documentation surface                  | DC-AI-023   |

### Chat v0 presentation review

The chat v0 review uses the existing SystemMessage and RelativeTime primitives
for label-only recorded facts. AI public types, composer ownership and error
presentation are unchanged; DC-CHAT-006 owns the transcript composition.

## DC-AI-001 — Shared AI invariants

**Requirement.** The Shared AI invariants family MUST keep AI presentation, input, review, and streaming state independent of model providers, transport, persistence, and product policy.

### Acceptance details

- The public boundary is AI layer.
- Consumers MAY inherit `--ui-ai-chat-type-scale` (default `1`) to scale chat text and fixed line heights without scaling icons, padding, widths or application zoom.
- Mobile composer text MUST retain its 16 px focus floor.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-002 — Layout

**Requirement.** The Layout family MUST compose a bounded chat surface with one scroll-position owner. Consumers MAY supply controlled unread state, conversation identity and saved reading position. Geometry observation MUST only maintain layout and anchoring; it MUST NOT imply message arrival.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The default `scrollMode="stream"` MUST retain existing streaming auto-follow, spring navigation and snippet composition, while `scrollMode="history"` opts in to anchored cached-history navigation.
- The generated ScrollArea wrapper and empty state MUST preserve the bounded viewport height while the composer remains docked, and consumers MAY select the wrapper scroll strategy for latency-sensitive virtualized layouts.
- Manual arrival at the latest content MUST dismiss generic arrival notifications; failed or pending jumps MUST NOT acknowledge controlled unread content, and switching identity MUST reset transient state.

## DC-AI-003 — Layout Scroll Button

**Requirement.** The Layout Scroll Button family MUST expose an accessible action for returning to the latest content when the transcript is displaced.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The control MUST render inside the transcript `scroll-shell`, not in the composer dock.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Host-controlled `isRunning` MUST replace the down icon with three bouncing dots while retaining the scroll action and an accessible running label; reduced motion MUST stop the animation.

## DC-AI-004 — Message List

**Requirement.** The Message List family MUST render ordered message content with stable scrolling and consumer-owned records. Opt-in virtualization MUST retain stable row keys and active interaction anchors while bounding mounted rows; existing snippet consumers MUST remain compatible.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- Existing children, density, gap, streaming, empty-state and manual Load older messages APIs MUST retain their defaults without instantiating a virtualizer, while non-virtual lists with `scrollToTopAction` MUST auto-load older pages when the top sentinel leaves then re-enters the owning scroll viewport.
- `virtualize={true}` MUST enable row rendering, single-flight anchored paging and a guarded 600 px loading boundary with fixed or item-aware estimates before DOM measurement; estimator changes MUST invalidate unmounted sizes while retaining measured sizes and the reading anchor or bottom lock, and virtualized layouts MUST avoid redundant Layout message-geometry scans on every scroll and ScrollArea scrollbar animation while measured rows revise the total size.
- Unchanged virtualizer inputs MUST NOT schedule measurements or position reports; active scrolling MUST coalesce saved-position reports until settlement, native scroll completion MUST flush pending reports when available, teardown MUST preserve the last pending position, and history-mode resize work MUST be coalesced outside observer delivery and cancelled on teardown.

## DC-AI-005 — Message

**Requirement.** The Message family MUST compose role-aware message content, metadata, actions, and tool presentation.

Message layout selectors MUST target their own direct parts so nested Avatar
content retains its shared size, typography and centered alignment.

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

Hosts MAY override `statusLabel` and provide explicit status actions through the
existing footer slot. The timestamp, actions and status retain dot separators.
Error foreground MUST remain readable on light/dark tinted message surfaces;
`--ui-ai-chat-metadata-error-foreground` is the host override.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Error-status text MUST retain at least 4.5:1 contrast on the Lapis conversation and muted surfaces in dark mode, using existing semantic foreground colors without changing status meaning.

## DC-AI-008 — System Message

**Requirement.** The System Message family MUST present system or contextual notices distinctly from conversational turns.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-009 — Composer

**Requirement.** The Composer family MUST coordinate controlled input, tokens, attachments or drawers, and submit affordances. Its elevation and focus chrome MUST remain visible when host shadow tokens are absent and MUST NOT stack a focus border with its focus ring.

Error banners MUST use the semantic destructive foreground for text and icons.
`statusContent` MAY replace the default icon/message with host-owned metadata
inside the existing attached shell, without duplicating live announcements.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract; reusable ComposerStatusBanner MUST preserve the existing curved attached top/bottom treatment with error, warning, info and success semantics, and support standalone placement with every corner rounded and no negative overlap margin for separately owned fixed status regions.
- When `disabled` and `isStopShown` are both true, the stop control MUST remain pointer-interactive while input, send, and other body actions stay blocked.
- `clearOnSubmit` MUST default to the existing clear behavior and allow hosts such as MarkdownComposer to retain the controlled draft after submission intent.

## DC-AI-010 — Composer Input

**Requirement.** The Composer Input family MUST provide accessible multiline controlled input with keyboard submission behavior.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Trigger menus MUST anchor to the caret or input using the composer-input containing block, flip above when space below the nearest clipping ancestor or the viewport is insufficient, and MUST NOT use viewport-fixed coordinates that drift inside isolated or transformed hosts.
- Trigger selection MUST guard indexed search results under unchecked-index consumer semantics.

## DC-AI-026 — Composer Input handle lifetime

**Requirement.** Composer Input MUST release only its own public handle on disposal across reactive consumer bindings.

### Acceptance details

- A handle assigned through `$state` MUST be cleared on teardown without Svelte identity diagnostics.
- A consumer replacement handle MUST remain assigned when the component is disposed.
- Capturing the assigned handle identity MUST NOT subscribe the setup effect to consumer handle changes.

## DC-AI-011 — Composer Drawer

**Requirement.** The Composer Drawer family MUST reveal supplementary composer controls without owning their domain state.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- A collapsed drawer MUST expose a compact summary above the overlapping rounded composer body without reserving expanded-content height; consumers MAY keep the drawer interactive while the disabled composer body blocks input and send except the stop control when `isStopShown` is true.
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

**Requirement.** The Tool Calls family MUST present tool invocation status, arguments, results, and disclosure accessibly without executing tools.

Call and collapsed-group disclosure names include their complete visible labels,
including node, target, change counts, custom statistics and duration when
present; execution status is an accessible description. Per-component IDs keep
repeated call identities independent without changing the flex layout or
wrapper/keyboard behavior.

### Acceptance details

- `--ui-ai-chat-tool-width` MUST allow container-relative sizing with a default of `min(100%, 42rem)`; `--ui-ai-chat-tool-trigger-padding-inline` MUST inset single and grouped trigger contents inside their hit/hover surface without moving the icon on hover; its default is zero.
- The optional `callWrapper?: Snippet<[ToolCallItem, Snippet]>` MUST compose each call’s existing presentation inside its list item, outside disclosure buttons; without it, rendering remains unchanged and grouped calls expose wrappers only when expanded.
- Tool-call disclosure indicators MUST retain their fixed size beside long titles, point right while closed and down while open for both grouped calls and individual call details, and single-call rendering MUST remain safe under unchecked-index consumer semantics.
- Pending and running calls MUST render the public Spinner as a rotating decorative busy indicator with `aria-hidden="true"` while retaining their accessible status text; an explicit `unknown` execution status MUST show a static status-unavailable indicator, preserve observed details, and MUST NOT imply failure or completion.

## DC-AI-016 — Dictation Button

**Requirement.** The Dictation Button family MUST present accessible start and stop dictation state without owning speech services.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/chat`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-AI-017 — Emoji Picker

**Requirement.** The experimental Emoji Picker boundary MUST retain compatibility with the shared keyboard-accessible Emoji Picker under DC-SHA-054.

### Acceptance details

- The compatibility boundary is `@lapismd/design-core/ai/experimental`; its component, option types and default suggestions MUST re-export the shared implementation.
- Explicit `emojis` lists MUST retain their searchable restricted grid; omission opens the full picker.
- Opening MUST focus search without a deferred autofocus callback overriding subsequent user navigation.
- Keyboard users MUST be able to move from search focus into the emoji grid and then navigate adjacent emoji buttons with arrow keys, including after closing and reopening the picker.

## DC-AI-018 — Reaction Bar

**Requirement.** The Reaction Bar family MUST provide explicitly experimental controlled reaction actions and selected state.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`; reaction names MUST retain their visible count alongside supplied participant context.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The experimental import MUST remain compatible with the shared Chat reaction implementation and neutral custom-emoji model defined by DC-CHAT-004.
- Optional emoji choices MUST be omitted rather than forwarded as explicit `undefined` values.

## DC-AI-019 — Reasoning

**Requirement.** The Reasoning family MUST provide explicitly experimental disclosure for reasoning or progress content. Streaming labels MUST use a left-to-right shimmer with opaque, readable theme colours.

### Acceptance details

- The public boundary is `@lapismd/design-core/ai/experimental`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- A streaming reasoning row MUST rotate its progress icon and sweep its label from muted foreground to foreground every two seconds; completed rows MUST remain static, and reduced-motion or forced-colours preferences MUST retain plain readable text without animation.
- Omitting reasoning children MUST render a non-interactive progress status with the same icon and label styling, without an empty disclosure.

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

**Requirement.** Tool Call Detail and Rich Tool Call Detail MUST provide provider-neutral formatted/raw presentation of normalized tool activity without executing tools or interpreting provider schemas.

Unavailable normalized tool output MUST use the public shadcn Empty pattern
with an icon, title and the recorded refusal reason. Raw capture stays reachable.

Tool detail MUST use the shared ContentViewToggle as one icon-only button for
formatted/raw switching. Code offers raw capture and BookOpen returns to formatted
content, with accessible names and tooltips.

### Acceptance details

- Public `/chat` and compatibility `/ai/chat` imports MUST expose the same detail family; existing generic payload props and formatter helpers MUST remain supported; Tool Calls MAY supply normalized `presentation`; an explicit detail snippet takes precedence.
- Formatted views MUST cover shell command/stdout/stderr in one panel with recorded exit state, file reads, complete patches or old/new diffs, and search locations; file navigation MUST use host callbacks; a maximize control MUST fill the page with the same view and restore focus/state on Escape or restore.
- Raw MUST retain the exact host-serialized payload, or exact generic input/output/error strings, without envelope unwrapping; both modes MUST retain host-reported partial, redacted and truncated notices; missing paths, incomplete diffs and unavailable output MUST NOT invent facts.
- Text payloads MUST use public Code Block copy/wrapping/bounded-height presentation and diffs MUST compose public FileDiff; native CSS and catalog examples MUST cover each tool type and raw/formatted switching; one-line legacy errors MAY remain on the summary row.

## DC-AI-027 — Content view toggle

**Requirement.** ContentViewToggle MUST provide a reusable, host-controlled, icon-only switch between formatted content and captured source.

### Acceptance details

- Public `/chat` and `/ai/chat` imports MUST expose the same component and typed view/callback contract.
- Code MUST offer source and BookOpen MUST offer formatted content; configurable action labels MUST supply the accessible name and tooltip, and aria-pressed MUST reflect source mode.
- Native keyboard activation and disabled behavior MUST match Button; changing presentation MUST emit only the selected view without loading, mutating or executing content.
- Native token-driven styling and consumer-ready documentation MUST accompany meaningful toggle, label and disabled stories.
