import * as submission from "./comment-submission.js";
import { tick } from "svelte";
import type {
  TranscriptBlock,
  TranscriptCommentAnchor,
  TranscriptProps,
  TranscriptCommentThread,
  TranscriptComment,
  TranscriptSubmission,
  TranscriptSubmissionResult,
} from "./model.js";
import { anchorKey, commentAnchor, validAnchor } from "./anchors.js";
import {
  commentSources,
  revealCommentSource,
  revealCommentMessage,
} from "./comment-navigation.js";

const localAuthor = {
  id: "local-user",
  name: "You",
  initials: "YO",
};
export class TranscriptController {
  active = $state<{
    anchor: TranscriptCommentAnchor;
    label: string;
    threadId: string;
    commentId: string;
    location: "inline" | "queue";
  }>();
  threads = $state<TranscriptCommentThread[]>([]);
  message = $state("");
  sending = $state(false);
  error = $state("");
  retainedSubmission = $state<TranscriptSubmission>();
  submissionResult = $state<TranscriptSubmissionResult>();
  disclosures = $state<Record<string, boolean>>({});
  rawTools = $state<Record<string, boolean>>({});
  bookmarkedTurns = $state<Record<string, boolean>>({});
  highlightedThread = $state<string>();
  root: HTMLElement | null = null;
  focusMessage?: () => void;
  sourceSelections = new Map<string, { from: number; to: number }>();
  embeddedReaders = new Map<
    string,
    Set<{
      from: number;
      to: number;
      revision: string;
      reveal: (from: number, to: number, scroll: boolean) => void;
    }>
  >();
  selections = new Map<
    string,
    NonNullable<
      ReturnType<
        import("../comment-composer/comment-composer.types.js").CommentComposerHandle["getSelection"]
      >
    >
  >();
  readers = new Map<
    string,
    (anchor: TranscriptCommentAnchor, scroll?: boolean) => void
  >();
  constructor(
    readonly props: () => TranscriptProps,
    initial: TranscriptCommentThread[] = [],
  ) {
    this.threads = structuredClone($state.snapshot(initial));
  }
  get author() {
    return this.props().author ?? localAuthor;
  }
  get pending() {
    return this.threads.flatMap((thread) =>
      thread.comments
        .filter(
          (c) =>
            (c.status === "draft" || c.status === "sending") && !!c.text.trim(),
        )
        .map((comment) => ({ thread, comment })),
    );
  }
  get visibleThreads() {
    return this.threads.filter(
      (t) =>
        t.comments.some((c) => c.text.trim()) || this.active?.threadId === t.id,
    );
  }
  get canSend() {
    return submission.canSend(this);
  }
  get key() {
    return this.active ? anchorKey(this.active.anchor) : "";
  }
  get draft() {
    return this.findComment(this.active?.commentId)?.text ?? "";
  }
  set draft(text: string) {
    if (this.active) this.edit(this.active.commentId, text);
  }
  findComment(id?: string) {
    return this.threads.flatMap((t) => t.comments).find((c) => c.id === id);
  }
  isAvailable(thread: TranscriptCommentThread) {
    return [
      ...commentSources(this.props().items).map((s) => s.block),
      ...(this.props().externalBlocks ?? []),
    ].some((block) => validAnchor(block, thread.anchor));
  }
  forBlocks(blocks: readonly TranscriptBlock[]) {
    return this.visibleThreads.filter((t) =>
      blocks.some((b) => validAnchor(b, t.anchor)),
    );
  }
  open(
    block: TranscriptBlock,
    selection: { from: number; to: number },
    initial = "",
    threadId?: string,
  ) {
    if (
      this.sending ||
      this.props().canComment === false ||
      block.commentable === false
    )
      return;
    const anchor = commentAnchor(block, selection);
    let thread = this.threads.find((t) =>
      threadId ? t.id === threadId : anchorKey(t.anchor) === anchorKey(anchor),
    );
    if (!thread) {
      thread = {
        id: crypto.randomUUID().replaceAll("-", ""),
        anchor,
        label: block.label,
        sourceKind: block.kind,
        comments: [],
      };
      this.threads.push(thread);
      thread = this.threads.at(-1)!;
    }
    this.begin(thread, "inline", initial);
  }
  begin(
    thread: TranscriptCommentThread,
    location: "inline" | "queue",
    initial = "",
    newEntry = false,
  ) {
    if (this.sending || this.props().canComment === false) return;
    let comment = newEntry
      ? undefined
      : thread.comments
          .filter((c) => c.author.id === this.author.id && c.status === "draft")
          .at(-1);
    if (!comment) {
      thread.comments.push({
        id: crypto.randomUUID().replaceAll("-", ""),
        author: this.author,
        text: "",
        status: "draft",
        createdAt: Date.now(),
      });
      comment = thread.comments.at(-1)!;
    }
    if (initial) comment.text += initial;
    this.active = {
      anchor: thread.anchor,
      label: thread.label,
      threadId: thread.id,
      commentId: comment.id,
      location,
    };
  }
  canEditSent(thread: TranscriptCommentThread, original: TranscriptComment) {
    return (
      !this.sending &&
      !this.retainedSubmission &&
      this.props().canComment !== false &&
      !original.historical &&
      (original.status === "sent" || original.status === "replied") &&
      original.author.id === this.author.id &&
      !!original.version &&
      this.isAvailable(thread) &&
      this.props().canEditComment?.(thread, original) === true &&
      !thread.comments.some(
        (c) =>
          c.editOf?.commentId === original.id &&
          c.status !== "draft" &&
          !c.historical,
      )
    );
  }
  editSent(thread: TranscriptCommentThread, original: TranscriptComment) {
    if (!this.canEditSent(thread, original)) return;
    let draft = thread.comments.find(
      (c) => c.status === "draft" && c.editOf?.commentId === original.id,
    );
    if (!draft) {
      thread.comments.push({
        id: crypto.randomUUID().replaceAll("-", ""),
        messageId: original.messageId ?? original.id,
        editOf: {
          commentId: original.id,
          messageId: original.messageId ?? original.id,
          version: original.version!,
        },
        author: { ...original.author },
        text: original.text,
        status: "draft",
      });
      draft = thread.comments.at(-1)!;
    }
    this.activate(thread, draft, "inline");
  }
  activate(
    thread: TranscriptCommentThread,
    comment: TranscriptComment,
    location: "inline" | "queue",
  ) {
    if (
      this.active?.commentId === comment.id &&
      this.active.location === location
    )
      return;
    this.active = {
      anchor: thread.anchor,
      label: thread.label,
      threadId: thread.id,
      commentId: comment.id,
      location,
    };
  }
  edit(id: string, text: string) {
    if (this.props().canComment === false || this.sending) return;
    const comment = this.findComment(id);
    if (comment?.status === "draft") comment.text = text;
  }
  remove(id: string) {
    const comment = this.findComment(id);
    if (comment?.status !== "draft") return;
    if (this.active?.commentId === id) this.close();
    this.threads = this.threads
      .map((t) => ({ ...t, comments: t.comments.filter((c) => c.id !== id) }))
      .filter((t) => t.comments.length);
  }
  close(discard = false) {
    const active = this.active;
    this.active = undefined;
    if (active && (discard || !this.findComment(active.commentId)?.text.trim()))
      this.remove(active.commentId);
    if (active)
      void tick().then(() => {
        if (!this.active)
          this.readers.get(active.anchor.blockId)?.(active.anchor);
      });
  }
  send() {
    return submission.send(this);
  }
  markPublished(
    value: TranscriptSubmission,
    batchId?: string,
    versions?: Readonly<Record<string, string>>,
  ) {
    submission.markPublished(this, value, batchId, versions);
  }
  confirmPublication(id: string, clearMessage = false, batchId?: string) {
    submission.confirmPublication(this, id, clearMessage, batchId);
  }
  recover(id: string, result: TranscriptSubmissionResult) {
    submission.recover(this, id, result);
  }
  refusePublication(id: string, error: string) {
    submission.refusePublication(this, id, error);
  }
  recordReply(
    threadId: string,
    commentIds: string | readonly string[],
    reply: TranscriptComment,
    itemId: string,
  ) {
    submission.recordReply(this, threadId, commentIds, reply, itemId);
  }
  async goToSource(thread: TranscriptCommentThread, opener: HTMLElement) {
    try {
      return await revealCommentSource(this, thread, opener);
    } catch (cause) {
      this.error =
        cause instanceof Error ? cause.message : "The source is unavailable.";
    }
  }
  async goToMessage(
    thread: TranscriptCommentThread,
    comment: TranscriptComment,
  ) {
    try {
      await revealCommentMessage(this, thread, comment);
    } catch (cause) {
      this.error =
        cause instanceof Error
          ? cause.message
          : "The submitted message is unavailable.";
    }
  }
  async goToReply(itemId: string) {
    try {
      await this.props().onNavigateReply?.(itemId);
    } catch (cause) {
      this.error =
        cause instanceof Error ? cause.message : "The reply is unavailable.";
      return;
    }
    await tick();
    const item = Array.from(
      this.root?.querySelectorAll<HTMLElement>("[data-chat-item]") ?? [],
    ).find((node) => node.dataset.chatItem === itemId);
    item?.scrollIntoView({ block: "center" });
    item?.focus({ preventScroll: true });
    return !!item;
  }
}
