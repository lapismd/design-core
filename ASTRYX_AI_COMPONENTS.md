# ASTRYX Chat/AI implementation tracker

This tracker is the source of truth for the ASTRYX-inspired Chat family in
`@stevejuma/ui`. It records observed upstream anatomy and behavior separately
from the local Svelte 5 implementation and its verification status.

## Reference and attribution

- Upstream: [facebook/astryx](https://github.com/facebook/astryx)
- Pinned commit:
  [`25def2f10d28ad135760fc594e817a55a86a1144`](https://github.com/facebook/astryx/tree/25def2f10d28ad135760fc594e817a55a86a1144)
- Stable reference:
  [`packages/core/src/Chat/index.ts`](https://github.com/facebook/astryx/blob/25def2f10d28ad135760fc594e817a55a86a1144/packages/core/src/Chat/index.ts)
- Experimental reference:
  [`packages/lab/src/Chat/index.ts`](https://github.com/facebook/astryx/blob/25def2f10d28ad135760fc594e817a55a86a1144/packages/lab/src/Chat/index.ts)
  and
  [`ChatReasoning.tsx`](https://github.com/facebook/astryx/blob/25def2f10d28ad135760fc594e817a55a86a1144/packages/lab/src/ChatReasoning/ChatReasoning.tsx)
- License: MIT, copyright 2026 Meta Platforms, Inc. The local implementation
  adapts public anatomy and behavior to Svelte 5 and the local shadcn
  primitives; it does not copy the React/StyleX source.

## Component matrix

Status values are `planned`, `implemented`, `tested`, and `reviewed`. Visual
status stays `pending-review` until a human reviews the Storybook previews.

| Upstream component         | Local export                       | Stability    | Story       | Tests   | Visual         |
| -------------------------- | ---------------------------------- | ------------ | ----------- | ------- | -------------- |
| `ChatLayout`               | `Chat.Layout`                      | stable       | implemented | passing | pending-review |
| `ChatLayoutScrollButton`   | `Chat.LayoutScrollButton`          | stable       | implemented | passing | pending-review |
| `ChatMessageList`          | `Chat.MessageList`                 | stable       | implemented | passing | pending-review |
| `ChatMessage`              | `Chat.Message`                     | stable       | implemented | passing | pending-review |
| `ChatMessageBubble`        | `Chat.MessageBubble`               | stable       | implemented | passing | pending-review |
| `ChatMessageMetadata`      | `Chat.MessageMetadata`             | stable       | implemented | passing | pending-review |
| `ChatSystemMessage`        | `Chat.SystemMessage`               | stable       | implemented | passing | pending-review |
| `ChatComposer`             | `Chat.Composer`                    | stable       | implemented | passing | pending-review |
| `ChatComposerInput`        | `Chat.ComposerInput`               | stable       | implemented | passing | pending-review |
| `ChatComposerDrawer`       | `Chat.ComposerDrawer`              | stable       | implemented | passing | pending-review |
| `ChatSendButton`           | `Chat.SendButton`                  | stable       | implemented | passing | pending-review |
| `ChatComposerTokenElement` | `Chat.ComposerToken`               | stable       | implemented | passing | pending-review |
| `ChatTokenizedText`        | `Chat.TokenizedText`               | stable       | implemented | passing | pending-review |
| `ChatToolCalls`            | `Chat.ToolCalls`                   | stable       | implemented | passing | pending-review |
| `ChatDictationButton`      | `Chat.DictationButton`             | stable       | implemented | passing | pending-review |
| `ChatReasoning`            | `ExperimentalChat.Reasoning`       | experimental | implemented | passing | pending-review |
| `ChatReactionBar`          | `ExperimentalChat.ReactionBar`     | experimental | implemented | passing | pending-review |
| `ChatEmojiPicker`          | `ExperimentalChat.EmojiPicker`     | experimental | implemented | passing | pending-review |
| `ChatTypingIndicator`      | `ExperimentalChat.TypingIndicator` | experimental | implemented | passing | pending-review |
| `ChatUnreadDivider`        | `ExperimentalChat.UnreadDivider`   | experimental | implemented | passing | pending-review |

The package subpaths are:

```ts
import * as AiChat from "@stevejuma/ui/ai/chat";
import * as ExperimentalAiChat from "@stevejuma/ui/ai/chat/experimental";
```

The root `@stevejuma/ui/ai` barrel exposes the same families as `Chat` and
`ExperimentalChat`. Existing AI exports remain compatible.

## Svelte controllers and composition

| Public API                | Purpose                                                                  | Status      |
| ------------------------- | ------------------------------------------------------------------------ | ----------- |
| `createStreamScroll`      | lock thresholds, reduced-motion-aware spring scrolling, resize lifecycle | tested      |
| `createNewMessages`       | new-message state, content observation, dismissal                        | tested      |
| `createComposerTokens`    | token DOM lifecycle, selection boundaries, serialization                 | tested      |
| `createPasteAsToken`      | long-paste conversion with configurable threshold                        | tested      |
| `createSpeechRecognition` | progressive Web Speech/Web Audio adapter and cleanup                     | tested      |
| `createDictation`         | composer-aware dictation orchestration                                   | tested      |
| `useLayoutContext`        | custom message-list composition                                          | implemented |
| `useComposerContext`      | custom composer/input composition                                        | implemented |

Trigger-menu internals are intentionally private.

## Compatibility composites

- `AiChatTranscript` now renders its legacy message and review props through
  `MessageList`, `Message`, `MessageBubble`, and `SystemMessage`.
- `AiPromptInput` now renders its legacy bindable value and `onSend` callback
  through `Composer` and `ComposerInput`.
- `AiChatPanel` remains a host-controlled composition with no networking,
  persistence, routing, model SDK, or application store.

## Required acceptance

- Unit: token serialization and boundary deletion, paste threshold, history and
  IME behavior, async trigger cancellation, scroll locking/reduced motion,
  pagination deduplication, and injected speech/audio adapters.
- Storybook: one colocated entry per public component plus complete conversation
  and compatibility stories. Interaction tests cover submission, triggers,
  tokens, paste/drop, pagination, scroll recovery, tools, reactions, emoji
  keyboard navigation, reasoning, and unsupported dictation.
- Browser: real `contenteditable` keyboard/selection, clipboard/drop, and
  mouse-wheel scroll acceptance.
- Final commands: no-Tailwind gate, type checking, unit tests, Storybook tests,
  static build, browser acceptance, visual comparison, and `pnpm checks`.
- Catalog: `pnpm ui components --layer ai` lists the existing five components
  and these twenty additions with docs.
- Visual: remove unjustified AI `skip-visual` tags and create only
  component-scoped baselines after explicit human review. Do not rewrite
  unrelated baselines.

## Boundaries and exclusions

- The pinned commit is authoritative. Later upstream beta changes are a
  separate refresh.
- `ChatPastedTextToken`, internal trigger-menu implementation, complete AI page
  templates, networking, model SDKs, persistence, routing, and artifact state
  are excluded.
- Markdown, code blocks, and citation rendering stay consumer-supplied through
  Svelte snippets.
- Browser APIs are SSR-safe, capability-detected, and progressively enhanced.
- `AiChatPanel` remains host-controlled. Existing consumers require no
  migration.
