import { tick } from "svelte";
import type { TranscriptController } from "./comments.svelte.js";
import type {
  TranscriptComment,
  TranscriptSubmission,
  TranscriptSubmissionResult,
} from "./model.js";
export function hasContent(state: TranscriptController) {
  return !!state.message.trim() || state.pending.length > 0;
}
export function canSend(state: TranscriptController) {
  return (
    !!state.props().onSend &&
    (!state.pending.length || state.props().canComment !== false) &&
    !state.sending &&
    !state.retainedSubmission &&
    hasContent(state)
  );
}
export async function send(state: TranscriptController) {
  if (!state.canSend) return false;
  const submission: TranscriptSubmission = Object.freeze({
    id: crypto.randomUUID().replaceAll("-", ""),
    author: Object.freeze({ ...state.author }),
    text: state.message,
    comments: Object.freeze(
      state.pending.map(({ thread, comment }) =>
        Object.freeze({
          threadId: thread.id,
          commentId: comment.id,
          anchor: Object.freeze({ ...thread.anchor }),
          author: Object.freeze({ ...comment.author }),
          text: comment.text,
          ...(comment.editOf
            ? { editOf: Object.freeze({ ...comment.editOf }) }
            : {}),
        }),
      ),
    ),
  });
  state.sending = true;
  state.error = "";
  for (const c of submission.comments)
    state.findComment(c.commentId)!.status = "sending";
  try {
    const outcome = await state.props().onSend!(submission);
    if (!outcome)
      throw new Error("The host did not acknowledge this submission.");
    state.submissionResult = outcome;
    if (outcome?.publication === "refused")
      throw new Error(
        outcome.error ??
          "The submission was refused. Your drafts are retained.",
      );
    if (outcome?.publication === "unknown" || outcome?.recoveryRequired) {
      state.retainedSubmission = submission;
      if (outcome.publication === "published")
        state.markPublished(
          submission,
          outcome.batchId,
          outcome.commentVersions,
        );
      state.error =
        outcome.error ??
        "Publication is awaiting confirmation. Check the retained request.";
      return false;
    }
    for (const c of submission.comments) {
      const comment = state.findComment(c.commentId);
      if (!comment || comment.text !== c.text) continue;
      if (comment.status !== "replied")
        comment.status = outcome?.publication === "queued" ? "queued" : "sent";
      comment.batchId = outcome?.batchId ?? submission.id;
    }
    if (outcome.publication === "published")
      state.markPublished(
        submission,
        outcome.batchId ?? submission.id,
        outcome.commentVersions,
      );
    if (state.message === submission.text) state.message = "";
    state.error = outcome?.error ?? "";
    state.active = undefined;
    state.sending = false;
    await tick();
    state.focusMessage?.();
    return true;
  } catch (cause) {
    for (const c of submission.comments) {
      const comment = state.findComment(c.commentId);
      if (comment?.status === "sending" && comment.text === c.text)
        comment.status = "draft";
    }
    state.error =
      cause instanceof Error
        ? cause.message
        : "The message could not be sent. Try again.";
    return false;
  } finally {
    state.sending = false;
  }
}
export function markPublished(
  state: TranscriptController,
  submission: TranscriptSubmission,
  batchId?: string,
  versions?: Readonly<Record<string, string>>,
) {
  for (const entry of submission.comments) {
    const comment = state.findComment(entry.commentId);
    if (comment && comment.text === entry.text) {
      if (comment.status !== "replied") comment.status = "sent";
      comment.batchId = batchId ?? submission.id;
      if (entry.editOf) {
        const original = state.findComment(entry.editOf.commentId);
        if (
          original?.version === entry.editOf.version &&
          (original.messageId ?? original.id) === entry.editOf.messageId
        )
          original.historical = true;
      }
      if (versions?.[entry.commentId])
        comment.version = versions[entry.commentId];
    }
  }
}
export function confirmPublication(
  state: TranscriptController,
  id: string,
  clearMessage = false,
  batchId?: string,
) {
  const submitted = state.retainedSubmission;
  if (!submitted || submitted.id !== id) return;
  state.markPublished(submitted, batchId);
  if (clearMessage && state.message === submitted.text) state.message = "";
  state.retainedSubmission = undefined;
  state.error = "";
}
export function recover(
  state: TranscriptController,
  id: string,
  result: TranscriptSubmissionResult,
) {
  if (state.retainedSubmission?.id !== id) return;
  state.submissionResult = result;
  if (result.publication === "queued" && !result.recoveryRequired) {
    const submitted = state.retainedSubmission;
    for (const entry of submitted.comments) {
      const comment = state.findComment(entry.commentId);
      if (comment && comment.text === entry.text) {
        if (comment.status !== "replied") comment.status = "queued";
        comment.batchId = result.batchId ?? submitted.id;
      }
    }
    if (state.message === submitted.text) state.message = "";
    state.retainedSubmission = undefined;
    state.error = "";
    return;
  }
  if (result.publication === "refused") {
    state.refusePublication(id, result.error ?? "Publication was refused.");
    return;
  }
  if (result.publication === "published") {
    state.markPublished(
      state.retainedSubmission,
      result.batchId,
      result.commentVersions,
    );
    if (!result.recoveryRequired) {
      state.confirmPublication(id, true, result.batchId);
      return;
    }
  }
  state.error =
    result.error ?? "Check the retained request before sending again.";
}
export function refusePublication(
  state: TranscriptController,
  id: string,
  error: string,
) {
  if (state.retainedSubmission?.id !== id) return;
  for (const entry of state.retainedSubmission.comments) {
    const comment = state.findComment(entry.commentId);
    if (comment?.status === "sending") comment.status = "draft";
  }
  state.retainedSubmission = undefined;
  state.error = error;
}

export function recordReply(
  state: TranscriptController,
  threadId: string,
  commentIds: string | readonly string[],
  reply: TranscriptComment,
  itemId: string,
) {
  const thread = state.threads.find((t) => t.id === threadId);
  const ids = typeof commentIds === "string" ? [commentIds] : commentIds;
  const comments = thread?.comments.filter(
    (c) => ids.includes(c.id) && c.status === "sent",
  );
  if (
    !thread ||
    !comments?.length ||
    thread.comments.some((c) => c.id === reply.id)
  )
    return;
  for (const comment of comments) {
    comment.status = "replied";
    comment.replyItemId = itemId;
  }
  thread.comments.push({ ...reply, replyTo: comments[0]!.id });
}
