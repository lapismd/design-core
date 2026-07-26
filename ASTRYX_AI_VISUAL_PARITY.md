# ASTRYX Chat visual parity

This audit records the rendering comparison between the local Svelte 5 Chat
family and the public ASTRYX component catalog. It complements
[`ASTRYX_AI_COMPONENTS.md`](./ASTRYX_AI_COMPONENTS.md), which remains the
implementation and acceptance tracker.

## Reference boundary

- Implementation authority:
  [`facebook/astryx@25def2f`](https://github.com/facebook/astryx/tree/25def2f10d28ad135760fc594e817a55a86a1144)
- Live comparison surface:
  [`astryx.atmeta.com/components/ChatMessage`](https://astryx.atmeta.com/components/ChatMessage)
  and the corresponding route for each stable component
- Live version observed on 2026-07-26: `@astryxdesign/core v0.1.8`
- Lab components do not have public live catalog routes. Their comparison is
  against the pinned Lab source and examples only.

The pinned commit defines data, variants, behavior, and component boundaries.
The live catalog is used to validate rendered anatomy and geometry. A later
live release changing behavior does not silently move this implementation
boundary.

## Theme decision

No ASTRYX brand theme is added to the package.

An ASTRYX theme would introduce a brand font and palette that are not part of
the local shadcn contract, while hiding the structural differences this pass
is intended to reveal. The parity stories therefore:

- inherit the local shadcn typeface and semantic colors;
- reproduce ASTRYX fixture text, widths, densities, states, and variants;
- match component anatomy, spacing, radii, alignment, and interactive states;
- keep accessible local contrast where the public palette would fail the
  catalog's WCAG gate.

This makes geometry comparisons meaningful without creating a runtime theme
dependency. A future screenshot-only reference decorator may be added if exact
brand-palette comparison becomes a separate requirement.

## Stable catalog comparison

`Compared` means the public render and pinned example source were inspected.
Baseline approval remains a separate human review step.

| ASTRYX page                                                                                 | Upstream examples reproduced locally                                                      | Primary local story                         | Compared             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------- |
| [`ChatLayout`](https://astryx.atmeta.com/components/ChatLayout)                             | Showcase, Panel View                                                                      | `ai-chat-layout--astryx-showcase`           | live                 |
| [`ChatLayoutScrollButton`](https://astryx.atmeta.com/components/ChatLayoutScrollButton)     | States, Labels                                                                            | `ai-chat-layout-scroll-button--states`      | live                 |
| [`ChatMessageList`](https://astryx.atmeta.com/components/ChatMessageList)                   | Showcase, Density, Full Featured                                                          | `ai-chat-message-list--astryx-showcase`     | live                 |
| [`ChatMessage`](https://astryx.atmeta.com/components/ChatMessage)                           | Showcase, Avatar & Name, Ghost, Multi-Bubble                                              | `ai-chat-message--astryx-showcase`          | live                 |
| [`ChatMessageBubble`](https://astryx.atmeta.com/components/ChatMessageBubble)               | Showcase, Density, Grouping, Metadata, Variants                                           | `ai-chat-message-bubble--astryx-showcase`   | live                 |
| [`ChatMessageMetadata`](https://astryx.atmeta.com/components/ChatMessageMetadata)           | Showcase, Footer Actions, Status, Timestamps                                              | `ai-chat-message-metadata--astryx-showcase` | live                 |
| [`ChatSystemMessage`](https://astryx.atmeta.com/components/ChatSystemMessage)               | Showcase, Status Updates, Variants, With Icon                                             | `ai-chat-system-message--astryx-showcase`   | live                 |
| [`ChatComposer`](https://astryx.atmeta.com/components/ChatComposer)                         | Showcase, Attachments, Flat, Footer Actions, Full Featured, Simple, Streaming, Validation | `ai-chat-composer--astryx-showcase`         | live                 |
| [`ChatComposerInput`](https://astryx.atmeta.com/components/ChatComposerInput)               | Showcase, Controlled, Disabled, Mentions, Multiple Triggers, Slash Commands               | `ai-chat-composer-input--astryx-showcase`   | live                 |
| [`ChatComposerDrawer`](https://astryx.atmeta.com/components/ChatComposerDrawer)             | Showcase, Attachments, Collapsible, Feedback, With Progress                               | `ai-chat-composer-drawer--astryx-showcase`  | live                 |
| [`ChatSendButton`](https://astryx.atmeta.com/components/ChatSendButton)                     | Showcase, States, Custom Icon, In Composer                                                | `ai-chat-send-button--astryx-showcase`      | live                 |
| [`ChatComposerTokenElement`](https://astryx.atmeta.com/components/ChatComposerTokenElement) | Badge config and custom render anatomy; upstream publishes no block showcase              | `ai-chat-composer-token--badge-config`      | live page and source |
| [`ChatTokenizedText`](https://astryx.atmeta.com/components/ChatTokenizedText)               | Showcase, Basic, Colors                                                                   | `ai-chat-tokenized-text--astryx-showcase`   | live                 |
| [`ChatToolCalls`](https://astryx.atmeta.com/components/ChatToolCalls)                       | Showcase, Expandable, Statuses, Simple                                                    | `ai-chat-tool-calls--astryx-showcase`       | live                 |
| [`ChatDictationButton`](https://astryx.atmeta.com/components/ChatDictationButton)           | Showcase, Basic                                                                           | `ai-chat-dictation-button--astryx-showcase` | live                 |

## Geometry corrections from the live pass

- Message bubbles now use ASTRYX's density padding, large balanced/spacious
  radius, compact radius, grouped corner treatment, ghost block-padding
  removal, and sender alignment.
- Names and metadata are siblings of the filled bubble surface instead of
  being painted inside it.
- Message lists own their density padding and gaps, keep a flex spacer for
  bottom alignment, and avoid duplicated layout padding.
- The composer uses a separate raised body with a 28px radius, 12px balanced
  padding, 32px send action, and a 14px/22px contenteditable line box.
- The drawer is a muted tray tucked behind the composer body, with the
  expanded handle and collapsed count/label occupying the same toggle row.
- The scroll recovery control is a 32px popover pill with a chevron and
  content-sized expanded label.
- Tool calls are compact, borderless activity rows. A single call renders
  inline; groups show a summary/latest-call surface and expandable detail.

## Experimental source comparison

| Pinned Lab component  | Local story                                                        | Reference status |
| --------------------- | ------------------------------------------------------------------ | ---------------- |
| `ChatReasoning`       | `ai-chat-experimental-reasoning--expands-reasoning`                | pinned source    |
| `ChatReactionBar`     | `ai-chat-experimental-reaction-bar--toggles-and-adds-reactions`    | pinned source    |
| `ChatEmojiPicker`     | `ai-chat-experimental-emoji-picker--searches-and-selects-an-emoji` | pinned source    |
| `ChatTypingIndicator` | `ai-chat-experimental-typing-indicator--names-active-typists`      | pinned source    |
| `ChatUnreadDivider`   | `ai-chat-experimental-unread-divider--marks-unread-messages`       | pinned source    |

## Baseline state

The reference pass is complete, but visual baselines are not approved by this
document. Review the Storybook previews first. Only then use the component
scoped gated updater; do not update unrelated snapshots.
