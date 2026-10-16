import type { Snippet } from "svelte";
import type { Extension } from "@codemirror/state";
import type { Decoration } from "@codemirror/view";
import type { TranscriptController } from "./comments.svelte.js";
import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
import type { Reaction } from "../../ai/experimental/reaction-bar/reaction-bar.types.js";
import type { MarkdownContentProps } from "../markdown-content/markdown-content.types.js";

/** Display identity only; resolution, permissions and persistence belong to hosts. */
export interface TranscriptAuthor {
  id: string;
  name: string;
  image?: string | undefined;
  emoji?: string | undefined;
  initials?: string | undefined;
  shape?: "circle" | "rounded" | undefined;
  background?: string | undefined;
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
  status: "complete" | "error" | "running" | "unknown";
  blocks: readonly TranscriptBlock[];
  /** Exact host-supplied capture; never inferred from provider names. */
  raw: string;
  commentable?: boolean | undefined;
  detailPlacement?: "inline" | "sidebar" | undefined;
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
  kind: "message" | "tools" | "context" | "reasoning" | "handoff";
  label: string;
  role?: "user" | "assistant" | undefined;
  turn?: TranscriptTurn | undefined;
  author?: TranscriptAuthor | undefined;
  blocks: readonly TranscriptBlock[];
  tools?: readonly TranscriptTool[] | undefined;
  defaultExpanded?: boolean | undefined;
  dayLabel?: string | undefined;
  timestamp?: string | undefined;
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
}
export interface TranscriptComment {
  id: string;
  author: TranscriptAuthor;
  text: string;
  status: "draft" | "sending" | "queued" | "sent" | "replied";
  messageId?: string | undefined;
  version?: string | undefined;
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
  commentUnavailable?: string | undefined;
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
export interface TranscriptProps extends TranscriptHost {
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
  messageActions?: Snippet<[string]> | undefined;
  reactions?: Readonly<Record<string, readonly Reaction[]>> | undefined;
  composer?: Snippet<["document" | "classic"]> | undefined;
  footer?: Snippet | undefined;
  label?: string | undefined;
  logLabel?: string | undefined;
  customBlock?: Snippet<[TranscriptBlock]> | undefined;
  commentState?: TranscriptController | undefined;
  markdown?: Omit<MarkdownContentProps, "content"> | undefined;
  navigation?: boolean | undefined;
}
