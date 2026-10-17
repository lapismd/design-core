import type { Snippet } from "svelte";
import type { AvatarIdentity } from "../../shadcn/avatar/index.js";
import type { AuthorCardAction } from "../../shadcn/author-card/index.js";
import type { MarkdownContentProps } from "../markdown-content/markdown-content.types.js";
import type { MarkdownComposerTrigger } from "../markdown-composer/composer-suggestions.js";
import type { Reaction } from "../../ai/experimental/reaction-bar/reaction-bar.types.js";
import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
import type { ComposerStatus } from "../../ai/types.js";
import type { MessageAction } from "../message-actions/message-actions.types.js";
export type ThreadMessage = {
  id: string;
  parentId?: string;
  author: AvatarIdentity;
  content: string;
  timestamp?: string;
  createdAt?: string;
  edited?: boolean;
  reactions?: readonly Reaction[];
};
export type ThreadSubmission = { id: string; text: string; parentId: string };
export type ThreadPanelProps = {
  rootId: string;
  messages: readonly ThreadMessage[];
  value?: string;
  replyToId?: string;
  label?: string;
  disabled?: boolean;
  busy?: boolean;
  readOnly?: boolean;
  history?: "idle" | "loading" | "retry" | "empty";
  onLoadOlder?: () => void;
  onSubmit: (submission: ThreadSubmission) => void | Promise<void>;
  onReply?: (message: ThreadMessage) => void;
  onNavigate?: (messageId: string) => void;
  focusMessageId?: string;
  authorActions?: (author: AvatarIdentity) => readonly AuthorCardAction[];
  messageActions?: (message: ThreadMessage) => readonly MessageAction[];
  onReact?: (
    message: ThreadMessage,
    emoji: string,
    custom?: CustomEmoji,
  ) => void;
  customEmojis?: readonly CustomEmoji[];
  triggers?: readonly MarkdownComposerTrigger[];
  markdown?: Omit<MarkdownContentProps, "content">;
  status?: ComposerStatus;
  composerAvatar?: Snippet;
  footer?: Snippet;
  supplement?: Snippet<[ThreadMessage]>;
  class?: string;
};
