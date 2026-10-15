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
