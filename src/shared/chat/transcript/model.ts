import type { Snippet, Component } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ComposerStatus } from "../../ai/types.js";
import type { Extension } from "@codemirror/state";
import type { Decoration } from "@codemirror/view";
import type { TranscriptController } from "./comments.svelte.js";
import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
import type { Reaction } from "../../ai/experimental/reaction-bar/reaction-bar.types.js";
import type { MarkdownContentProps } from "../markdown-content/markdown-content.types.js";
import type { SentContextData } from "../sent-context/sent-context.types.js";

/** Display identity only; resolution, permissions and persistence belong to hosts. */
export interface TranscriptAuthor {
  id: string;
  name: string;
  image?: string | undefined;
  emoji?: string | undefined;
  initials?: string | undefined;
  shape?: "circle" | "rounded" | undefined;
  background?: string | undefined;
  role?: string | undefined;
}
/** UI-only profile presentation, kept outside captured author/submission data. */
export interface TranscriptAuthorPopover {
  /** Defaults to click/keyboard popovers; choose hover for profile previews. */
  interaction?: "hover" | "popover" | undefined;
  description?: ((author: TranscriptAuthor) => string | undefined) | undefined;
  details?: Snippet<[TranscriptAuthor]> | undefined;
  actions?:
    | ((author: TranscriptAuthor) => readonly {
        id: string;
        label: string;
        disabled?: boolean;
        onSelect: (author: TranscriptAuthor) => void;
      }[])
    | undefined;
}
/** Immutable captured content. Every range refers to this exact text/revision. */
export interface TranscriptBlock {
  id: string;
  revision: string;
  kind: "markdown" | "code" | "patch" | "custom" | "context";
  label: string;
  text: string;
  path?: string | undefined;
  emojis?: readonly CustomEmoji[] | undefined;
  lineNumbered?: boolean | undefined;
  commentable?: boolean | undefined;
  wholeSection?: boolean | undefined;
}
export interface TranscriptTool {
  id: string;
  revision: string;
  title: string;
  /** Explicit presentation icon; provider/tool-name guessing belongs to adapters. */
  icon?: Component | undefined;
  status: "complete" | "error" | "running" | "unknown";
  blocks: readonly TranscriptBlock[];
  /** Exact host-supplied capture; never inferred from provider names. */
  raw: string;
  commentable?: boolean | undefined;
  detailPlacement?: "inline" | "sidebar" | undefined;
  /** Optional inline source preview beside a separately inspectable title.
   * Projections retain the same block IDs, revisions and exact text as blocks. */
  inlineBlocks?: readonly TranscriptBlock[] | undefined;
}
export interface TranscriptTurn {
  id: string;
  author: string;
  prompt: string;
  summary: string;
  agentName?: string | undefined;
  modelLabel?: string | undefined;
  createdAt?: number | undefined;
}
export interface TranscriptItem {
  id: string;
  /** Captured application context shown before this message, separate from authored text. */
  sentContext?: SentContextData | undefined;
  kind: "message" | "tools" | "context" | "reasoning" | "handoff";
  /** Inline captured status; metadataSupplement supplies any explicit host action. */
  notice?: "error" | "warning" | undefined;
  label: string;
  icon?: Component | undefined;
  role?: "user" | "assistant" | undefined;
  turn?: TranscriptTurn | undefined;
  author?: TranscriptAuthor | undefined;
  blocks: readonly TranscriptBlock[];
  tools?: readonly TranscriptTool[] | undefined;
  defaultExpanded?: boolean | undefined;
  dayLabel?: string | undefined;
  /** Display label; use createdAt for an ISO timestamp and full-date tooltip. */
  timestamp?: string | undefined;
  createdAt?: string | undefined;
  edited?: boolean | undefined;
  replyCount?: number | undefined;
  replyLabel?: string | undefined;
  replyParticipants?: readonly TranscriptAuthor[] | undefined;
  commentBatchId?: string | undefined;
  replyContext?:
    | { threadId: string; commentIds: readonly string[] }
    | undefined;
}
export interface TranscriptCommentAnchor {
  blockId: string;
  revision: string;
  from: number;
  to: number;
  quote: string;
  /** Immutable table row context, with offsets into its original Markdown snapshot. */
  tableContext?: { markdown: string; from: number; to: number } | undefined;
}
/** Optimistic replacement identity supplied to the host, never inferred. */
export interface TranscriptCommentEdit {
  commentId: string;
  messageId: string;
  version: string;
}
export interface TranscriptComment {
  id: string;
  author: TranscriptAuthor;
  text: string;
  status: "draft" | "sending" | "queued" | "sent" | "replied";
  messageId?: string | undefined;
  version?: string | undefined;
  editOf?: TranscriptCommentEdit | undefined;
  historical?: boolean | undefined;
  batchIds?: string[] | undefined;
  batchId?: string | undefined;
  replyItemId?: string | undefined;
  replyDestinations?: { id: string; label: string }[] | undefined;
  replyTo?: string | undefined;
  createdAt?: number | undefined;
}
export interface TranscriptCommentThread {
  id: string;
  anchor: TranscriptCommentAnchor;
  label: string;
  sourceKind?: TranscriptBlock["kind"] | undefined;
  comments: TranscriptComment[];
}
export interface TranscriptSubmissionComment {
  editOf?: TranscriptCommentEdit | undefined;
  threadId: string;
  commentId: string;
  anchor: TranscriptCommentAnchor;
  author: TranscriptAuthor;
  text: string;
}
export interface TranscriptSubmission {
  id: string;
  author?: TranscriptAuthor | undefined;
  text: string;
  comments: readonly TranscriptSubmissionComment[];
}
/** Host acknowledgement. Undefined never implies successful delivery. */
export interface TranscriptSubmissionResult {
  publication: "published" | "queued" | "unknown" | "refused";
  /** Published versions keyed by submitted comment ID. */
  commentVersions?: Readonly<Record<string, string>> | undefined;
  batchId?: string | undefined;
  delivery?:
    | readonly {
        id: string;
        label: string;
        state: string;
        error?: string | null;
      }[]
    | undefined;
  recoveryRequired?: boolean | undefined;
  error?: string | undefined;
}
export interface TranscriptHost {
  items: readonly TranscriptItem[];
  author?: TranscriptAuthor | undefined;
  canComment?: boolean | undefined;
  /** Opt in to editing current authored comments; onSend receives versioned editOf. */
  canEditComment?:
    | ((thread: TranscriptCommentThread, comment: TranscriptComment) => boolean)
    | undefined;
  commentUnavailable?: string | undefined;
  /** Overrides the retained-source explanation, colour and attached edge. */
  unavailableStatus?: ComposerStatus | undefined;
  unavailableStatusPosition?: "top" | "bottom" | undefined;
  reactionsDisabled?: boolean | undefined;
  reactionEmojis?:
    | readonly import("../../shadcn/emoji-picker/index.js").EmojiOption[]
    | undefined;
  externalBlocks?: readonly TranscriptBlock[] | undefined;
  /** Emits immutable snapshots; the host executes and acknowledges delivery. */
  onSend?:
    | ((
        snapshot: TranscriptSubmission,
      ) => TranscriptSubmissionResult | Promise<TranscriptSubmissionResult>)
    | undefined;
  onNavigateSource?:
    | ((thread: TranscriptCommentThread) => void | Promise<void>)
    | undefined;
  onNavigateReply?: ((itemId: string) => void | Promise<void>) | undefined;
  onInspectTool?:
    | ((tool: TranscriptTool, opener: HTMLElement) => void | Promise<void>)
    | undefined;
  resolveFileLink?:
    | ((
        block: TranscriptBlock,
        destination: string,
      ) => (() => void) | undefined)
    | undefined;
  displayPaths?:
    | ((block: TranscriptBlock) => readonly (readonly [string, string])[])
    | undefined;
  readerExtensions?: ((block: TranscriptBlock) => Extension) | undefined;
  inlineReferences?:
    | ((block: TranscriptBlock) => readonly {
        from: number;
        to: number;
        decoration: ReturnType<Decoration["range"]>;
      }[])
    | undefined;
  customEmojis?: readonly CustomEmoji[] | undefined;
  reactionOptions?: readonly string[] | undefined;
  onReact?:
    | ((messageId: string, emoji: string, custom?: CustomEmoji) => void)
    | undefined;
}

/** A host snapshot; showing/cancelling it never acknowledges or mutates delivery. */
export interface TranscriptQueuedMessage {
  id: string;
  submission: TranscriptSubmission;
  recipients: readonly TranscriptQueueRecipient[];
}
export interface TranscriptQueueRecipient {
  id: string;
  label: string;
  state: "queued" | "unknown";
  cancelling?: boolean | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
}
export interface MessageQueueProps extends HTMLAttributes<HTMLElement> {
  entries: readonly TranscriptQueuedMessage[];
  open?: boolean | undefined;
  disabled?: boolean | undefined;
  onCancel?:
    | ((
        entry: TranscriptQueuedMessage,
        recipient: TranscriptQueueRecipient,
      ) => void | Promise<void>)
    | undefined;
  onReview?:
    | ((
        entry: TranscriptQueuedMessage,
        recipient: TranscriptQueueRecipient,
      ) => void | Promise<void>)
    | undefined;
}
export interface TranscriptFooterProps extends HTMLAttributes<HTMLDivElement> {
  state?: TranscriptController | undefined;
  canSend?: boolean | undefined;
  hasContent?: boolean | undefined;
  /** Host-owned activity state; a persistent onStop callback does not imply active work. */
  busy?: boolean | undefined;
  sendPending?: boolean | undefined;
  stopping?: boolean | undefined;
  disabled?: boolean | undefined;
  onSend?: (() => void | Promise<void>) | undefined;
  onStop?: (() => void | Promise<void>) | undefined;
  status?: ComposerStatus | undefined;
  /** Hide only the banner when the host renders status in a separate fixed region. */
  showStatus?: boolean | undefined;
  statusPosition?: "top" | "bottom" | undefined;
  actions?: Snippet | undefined;
  workspace?: Snippet | undefined;
  controls?: Snippet | undefined;
}
export interface TranscriptProps extends TranscriptHost {
  authorPopover?: TranscriptAuthorPopover | undefined;
  /** Controlled presentation of the same items/readers; applied after active IME composition. */
  view?: "document" | "classic" | undefined;
  loading?: boolean | undefined;
  history?: "idle" | "loading" | "retry" | "empty" | undefined;
  onLoadHistory?: (() => void) | undefined;
  emptyState?: Snippet | undefined;
  beforeItems?: Snippet | undefined;
  afterItems?: Snippet | undefined;
  queuedMessages?: Snippet | undefined;
  supplement?: Snippet<[TranscriptItem]> | undefined;
  metadataSupplement?: Snippet<[TranscriptItem]> | undefined;
  onOpenThread?: ((item: TranscriptItem) => void) | undefined;
  messageActions?: Snippet<[string]> | undefined;
  reactions?: Readonly<Record<string, readonly Reaction[]>> | undefined;
  /** Receives the applied view so the host can adapt one retained composer. */
  composer?: Snippet<["document" | "classic"]> | undefined;
  /** Pin the retained Classic composer above the footer while history scrolls. */
  classicComposerPlacement?: "inline" | "fixed" | undefined;
  footer?: Snippet | undefined;
  label?: string | undefined;
  logLabel?: string | undefined;
  customBlock?: Snippet<[TranscriptBlock]> | undefined;
  commentState?: TranscriptController | undefined;
  markdown?: Omit<MarkdownContentProps, "content"> | undefined;
  navigation?: boolean | undefined;
}
