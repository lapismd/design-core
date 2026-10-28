/** Stable chat presentation; legacy AI entry points remain supported. */
export { default as CommentComposer } from "./comment-composer/CommentComposer.svelte";
export type {
  CommentComposerProps,
  CommentComposerSource,
  CommentComposerHandle,
} from "./comment-composer/comment-composer.types.js";
export * from "../ai/chat.js";
export { default as MarkdownContent } from "./markdown-content/MarkdownContent.svelte";
export type { MarkdownContentProps } from "./markdown-content/markdown-content.types.js";
export { default as MarkdownComposer } from "./markdown-composer/MarkdownComposer.svelte";
export type {
  MarkdownComposerProps,
  MarkdownComposerHandle,
  MarkdownComposerActions,
  MarkdownComposerReply,
} from "./markdown-composer/markdown-composer.types.js";
export { default as MessageActions } from "./message-actions/MessageActions.svelte";
export type {
  MessageAction,
  MessageActionsProps,
} from "./message-actions/message-actions.types.js";
export { default as ReactionBar } from "../ai/experimental/reaction-bar/ReactionBar.svelte";
export type {
  Reaction,
  ReactionBarProps,
} from "../ai/experimental/reaction-bar/reaction-bar.types.js";

export { default as Transcript } from "./transcript/Transcript.svelte";
export { default as TranscriptFooter } from "./transcript/TranscriptFooter.svelte";
export { default as MessageQueue } from "./transcript/MessageQueue.svelte";
export { default as PromptContext } from "./prompt-context/PromptContext.svelte";
export { default as SentContext } from "./sent-context/SentContext.svelte";
export type {
  ContextDelivery,
  SentContextData,
  SentContextProps,
} from "./sent-context/sent-context.types.js";
export { promptElementsExtension } from "./prompt-context/prompt-elements-extension.js";
export { default as HistoryEdge } from "./history-edge/HistoryEdge.svelte";
export { default as CommentQueue } from "./transcript/ChatCommentBatch.svelte";
export { TranscriptController } from "./transcript/comments.svelte.js";
export { commentAnchor, validAnchor } from "./transcript/anchors.js";
export type * from "./transcript/model.js";
export { default as TranscriptContent } from "./transcript/ChatContent.svelte";
export { default as TranscriptToolContent } from "./transcript/ChatToolBlocks.svelte";

export {
  composerSuggestions,
  suggestionQuery,
  type MarkdownComposerTrigger,
  type MarkdownSuggestionItem,
} from "./markdown-composer/composer-suggestions.js";

export { default as ThreadPanel } from "./thread-panel/ThreadPanel.svelte";
export type {
  ThreadPanelProps,
  ThreadMessage,
  ThreadSubmission,
} from "./thread-panel/thread-panel.types.js";
export {
  projectThreadTree,
  threadTreeIndentRem,
  type ThreadTreeRow,
} from "./thread-panel/thread-tree.js";

export { spoilerExtension } from "./markdown-content/spoiler-extension.js";
export { default as InlineReference } from "./inline-reference/InlineReference.svelte";
export {
  createChatReferenceExtension,
  chatReferenceTriggers,
} from "./inline-reference/reference-extension.js";
export {
  chatReferenceRanges,
  serializeChatReference,
} from "./inline-reference/reference-ranges.js";
export { chatReferenceDecorations } from "./inline-reference/reference-widget.js";
export type {
  ChatReference,
  ChatReferenceMatch,
  ChatReferenceOptions,
  ChatReferenceSource,
} from "./inline-reference/inline-reference.types.js";
