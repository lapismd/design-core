import { expect, it } from "vitest";
import { customInteraction } from "./custom-interaction.js";
import { TranscriptController } from "./comments.svelte.js";
import { commentAnchor } from "./anchors.js";
import type {
  TranscriptItem,
  TranscriptSubmission,
  TranscriptSubmissionResult,
} from "./model.js";
const block = {
  id: "source",
  revision: "v1",
  kind: "markdown" as const,
  label: "Source",
  text: "First café 👩🏽‍💻.\n\nNext paragraph.",
};
const items: TranscriptItem[] = [
  { id: "message", kind: "message", label: "Message", blocks: [block] },
];
it("resumes exact-anchor drafts and allows multiple entries at that anchor", () => {
  const state = new TranscriptController(() => ({ items }));
  state.open(block, { from: 0, to: 0 }, "First");
  const id = state.active!.commentId;
  state.active = undefined;
  state.open(block, { from: 0, to: 0 }, " continued");
  expect(state.pending).toHaveLength(1);
  expect(state.active!.commentId).toBe(id);
  expect(state.draft).toBe("First continued");
  state.begin(state.threads[0]!, "inline", "Another", true);
  expect(state.pending).toHaveLength(2);
  expect(state.threads[0]!.anchor.quote).toBe("First café 👩🏽‍💻.");
});
it("retains exact quotes when a source revision changes, without fuzzy relocation", () => {
  let current = items;
  const state = new TranscriptController(() => ({ items: current }));
  state.open(block, { from: 0, to: 0 }, "Review");
  const quote = state.threads[0]!.anchor.quote;
  current = [{ ...items[0]!, blocks: [{ ...block, revision: "v2" }] }];
  expect(state.isAvailable(state.threads[0]!)).toBe(false);
  expect(state.threads[0]!.anchor.quote).toBe(quote);
  expect(state.pending).toHaveLength(1);
});
it("comments-only submission is acknowledged explicitly and preserves the sent snapshot", async () => {
  let snapshot: TranscriptSubmission | undefined;
  const state = new TranscriptController(() => ({
    items,
    onSend: (submitted) => {
      snapshot = submitted;
      return { publication: "published", batchId: "accepted" };
    },
  }));
  state.open(block, { from: 0, to: 0 }, "Exact\ncomment");
  expect(await state.send()).toBe(true);
  expect(snapshot!.text).toBe("");
  expect(snapshot!.comments[0]!.text).toBe("Exact\ncomment");
  expect(state.pending).toHaveLength(0);
  expect(state.threads[0]!.comments[0]).toMatchObject({
    status: "sent",
    batchId: "accepted",
  });
});
it("retains rejection and blocks duplicate submission while a snapshot is in flight", async () => {
  let finish!: (result: TranscriptSubmissionResult) => void;
  let calls = 0;
  const state = new TranscriptController(() => ({
    items,
    onSend: () => {
      calls++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  }));
  state.open(block, { from: 0, to: 0 }, "Retain me");
  const sending = state.send();
  expect(await state.send()).toBe(false);
  expect(calls).toBe(1);
  finish({ publication: "refused", error: "Declined" });
  expect(await sending).toBe(false);
  expect(state.pending[0]!.comment.text).toBe("Retain me");
  expect(state.pending[0]!.comment.status).toBe("draft");
});
it("unknown outcomes retain identity until a matching acknowledgement", async () => {
  const state = new TranscriptController(() => ({
    items,
    onSend: () => ({ publication: "unknown" }),
  }));
  state.open(block, { from: 0, to: 0 }, "Retain pending");
  state.message = "Original message";
  expect(await state.send()).toBe(false);
  const snapshot = state.retainedSubmission!;
  state.message = "Newer draft";
  state.confirmPublication("unrelated", true);
  expect(state.retainedSubmission?.id).toBe(snapshot.id);
  state.confirmPublication(snapshot.id, true, "confirmed");
  expect(state.retainedSubmission).toBeUndefined();
  expect(state.message).toBe("Newer draft");
  expect(state.threads[0]!.comments[0]!.status).toBe("sent");
});
it("an absent host outcome is never treated as acknowledged delivery", async () => {
  const state = new TranscriptController(() => ({
    items,
    onSend: (() => undefined) as unknown as () => TranscriptSubmissionResult,
  }));
  state.open(block, { from: 0, to: 0 }, "Keep draft");
  expect(await state.send()).toBe(false);
  expect(state.pending[0]!.comment.status).toBe("draft");
  expect(state.error).toContain("acknowledge");
});
it("an older acknowledgement cannot clear a newer message draft", async () => {
  let finish!: (result: TranscriptSubmissionResult) => void;
  const state = new TranscriptController(() => ({
    items,
    onSend: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  }));
  state.message = "Original";
  const sending = state.send();
  state.message = "Newer";
  finish({ publication: "published" });
  await sending;
  expect(state.message).toBe("Newer");
});
it("read-only and unpublished blocks never create comments", () => {
  const state = new TranscriptController(() => ({ items, canComment: false }));
  state.open(block, { from: 0, to: 0 }, "Blocked");
  expect(state.threads).toHaveLength(0);
  const other = new TranscriptController(() => ({ items }));
  other.open({ ...block, commentable: false }, { from: 0, to: 0 }, "Blocked");
  expect(other.threads).toHaveLength(0);
});
it("source anchors are created from immutable UTF-16 capture text", () => {
  const from = block.text.indexOf("👩"),
    to = from + "👩🏽‍💻".length;
  expect(commentAnchor(block, { from, to }).quote).toBe("👩🏽‍💻");
  expect(block.text).toContain("café 👩🏽‍💻");
});

it("acknowledging a snapshot leaves a host-replaced newer comment draft intact", async () => {
  let finish!: (result: TranscriptSubmissionResult) => void;
  const state = new TranscriptController(() => ({
    items,
    onSend: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  }));
  state.open(block, { from: 0, to: 0 }, "Submitted");
  const id = state.active!.commentId;
  const sending = state.send();
  state.findComment(id)!.text = "Newer host draft";
  state.findComment(id)!.status = "draft";
  finish({ publication: "published" });
  await sending;
  expect(state.findComment(id)).toMatchObject({
    text: "Newer host draft",
    status: "draft",
  });
});

it("host removal during a rejected submission retains failure without throwing", async () => {
  let finish!: (result: TranscriptSubmissionResult) => void;
  const state = new TranscriptController(() => ({
    items,
    onSend: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  }));
  state.open(block, { from: 0, to: 0 }, "Removed during request");
  const sending = state.send();
  state.threads = [];
  finish({ publication: "refused", error: "Declined" });
  expect(await sending).toBe(false);
  expect(state.error).toBe("Declined");
  expect(state.sending).toBe(false);
});
it("queued recovery never replaces newer host drafts or replied state", async () => {
  const state = new TranscriptController(() => ({
    items,
    onSend: () => ({ publication: "unknown" }),
  }));
  state.open(block, { from: 0, to: 0 }, "Submitted");
  state.message = "Original message";
  await state.send();
  const submitted = state.retainedSubmission!;
  const comment = state.findComment(submitted.comments[0]!.commentId)!;
  comment.text = "Newer host draft";
  comment.status = "draft";
  state.message = "Newer message";
  state.recover(submitted.id, { publication: "queued", batchId: "queue-1" });
  expect(comment).toMatchObject({ text: "Newer host draft", status: "draft" });
  expect(state.message).toBe("Newer message");
  expect(state.retainedSubmission).toBeUndefined();
});
it("queued recovery records the host batch on the exact acknowledged draft", async () => {
  const state = new TranscriptController(() => ({
    items,
    onSend: () => ({ publication: "unknown" }),
  }));
  state.open(block, { from: 0, to: 0 }, "Submitted");
  await state.send();
  state.recover(state.retainedSubmission!.id, {
    publication: "queued",
    batchId: "queue-2",
  });
  expect(state.threads[0]!.comments[0]).toMatchObject({
    status: "queued",
    batchId: "queue-2",
  });
});
it("submission snapshots are independent and immutable at every captured level", async () => {
  let snapshot!: TranscriptSubmission;
  const state = new TranscriptController(() => ({
    items,
    onSend: (value) => {
      snapshot = value;
      return { publication: "unknown" };
    },
  }));
  state.open(block, { from: 0, to: 0 }, "Captured");
  await state.send();
  state.threads[0]!.comments[0]!.text = "Later";
  expect(snapshot.comments[0]!.text).toBe("Captured");
  for (const value of [
    snapshot,
    snapshot.author,
    snapshot.comments,
    snapshot.comments[0],
    snapshot.comments[0]!.author,
    snapshot.comments[0]!.anchor,
  ])
    expect(Object.isFrozen(value)).toBe(true);
});

it("disabling comments blocks edits and submission while retaining the draft", async () => {
  let enabled = true;
  const state = new TranscriptController(() => ({
    items,
    canComment: enabled,
    onSend: () => ({ publication: "published" }),
  }));
  state.open(block, { from: 0, to: 0 }, "Retain");
  const id = state.active!.commentId;
  enabled = false;
  state.edit(id, "Blocked edit");
  expect(state.findComment(id)!.text).toBe("Retain");
  expect(await state.send()).toBe(false);
  expect(state.findComment(id)!.status).toBe("draft");
});

it("closing a second reader restores navigation to the still-mounted source", async () => {
  const state = new TranscriptController(() => ({ items }));
  let rootFocused = 0;
  const rootNode = {
    tabIndex: -1,
    addEventListener() {},
    removeEventListener() {},
    focus() {
      rootFocused++;
    },
    scrollIntoView() {},
  } as unknown as HTMLElement;
  const inspectorNode = { ...rootNode, focus() {} } as HTMLElement;
  const root = customInteraction(rootNode, { block, state });
  const inspector = customInteraction(inspectorNode, { block, state });
  inspector.destroy();
  state.readers.get(block.id)?.(commentAnchor(block, { from: 0, to: 0 }));
  expect(rootFocused).toBe(1);
  root.destroy();
  expect(state.readers.has(block.id)).toBe(false);
});
it("out-of-order reader teardown never restores a destroyed source", async () => {
  const state = new TranscriptController(() => ({ items }));
  let inspectorFocused = 0;
  const node = {
    tabIndex: -1,
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    scrollIntoView() {},
  } as unknown as HTMLElement;
  const root = customInteraction(node, { block, state });
  const inspector = customInteraction(
    {
      ...node,
      focus() {
        inspectorFocused++;
      },
    } as HTMLElement,
    { block, state },
  );
  root.destroy();
  state.readers.get(block.id)?.(commentAnchor(block, { from: 0, to: 0 }));
  expect(inspectorFocused).toBe(1);
  inspector.destroy();
  expect(state.readers.has(block.id)).toBe(false);
});

it("message submission remains available when only commenting is disabled", async () => {
  const state = new TranscriptController(() => ({
    items,
    canComment: false,
    onSend: () => ({ publication: "published" }),
  }));
  state.message = "A normal message";
  expect(state.canSend).toBe(true);
  expect(await state.send()).toBe(true);
});
