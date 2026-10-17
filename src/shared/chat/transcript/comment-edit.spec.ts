import { expect, it } from "vitest";
import { TranscriptController } from "./comments.svelte.js";
import type { TranscriptProps, TranscriptSubmission } from "./model.js";

const block = {
  id: "source",
  revision: "r1",
  kind: "markdown" as const,
  label: "Source",
  text: "Exact source",
};
function fixture(overrides: Partial<TranscriptProps> = {}) {
  const state = new TranscriptController(
    () => ({
      items: [
        { id: "item", kind: "message", label: "Message", blocks: [block] },
      ],
      author: { id: "me", name: "You" },
      canEditComment: () => true,
      onSend: () => ({ publication: "published" }),
      ...overrides,
    }),
    [
      {
        id: "thread",
        label: "Source",
        sourceKind: "markdown",
        anchor: {
          blockId: block.id,
          revision: block.revision,
          from: 0,
          to: 12,
          quote: block.text,
        },
        comments: [
          {
            id: "original",
            messageId: "message-1",
            version: "v1",
            author: { id: "me", name: "You" },
            text: "Original comment",
            status: "sent",
          },
        ],
      },
    ],
  );
  return {
    state,
    thread: state.threads[0]!,
    original: state.threads[0]!.comments[0]!,
  };
}

it("versioned comment edits preserve the original and resume one replacement draft", () => {
  const { state, thread, original } = fixture();
  state.editSent(thread, original);
  const id = state.active!.commentId;
  state.edit(id, "Replacement");
  state.editSent(thread, original);
  expect(state.active!.commentId).toBe(id);
  expect(state.pending).toHaveLength(1);
  expect(state.draft).toBe("Replacement");
  expect(original.text).toBe("Original comment");
});

it("comment editing requires capability, authorship, current version and source", () => {
  for (const overrides of [
    { canEditComment: () => false },
    { canComment: false },
    { author: { id: "other", name: "Other" } },
  ]) {
    const { state, thread, original } = fixture(overrides);
    state.editSent(thread, original);
    expect(state.pending).toHaveLength(0);
  }
  for (const invalid of [
    { historical: true },
    { version: undefined },
    { status: "queued" as const },
  ]) {
    const { state, thread, original } = fixture();
    Object.assign(original, invalid);
    state.editSent(thread, original);
    expect(state.pending).toHaveLength(0);
  }
  const { state, thread, original } = fixture();
  thread.anchor.revision = "stale";
  state.editSent(thread, original);
  expect(state.pending).toHaveLength(0);
});

it("published replacements carry version intent and retire only the original", async () => {
  let snapshot!: TranscriptSubmission;
  const { state, thread, original } = fixture({
    onSend: (value) => {
      snapshot = value;
      return {
        publication: "published",
        commentVersions: { [value.comments[0]!.commentId]: "v2" },
      };
    },
  });
  state.editSent(thread, original);
  state.draft = "Replacement";
  await state.send();
  expect(snapshot.comments[0]!.editOf).toEqual({
    commentId: "original",
    messageId: "message-1",
    version: "v1",
  });
  expect(Object.isFrozen(snapshot.comments[0]!.editOf)).toBe(true);
  expect(original).toMatchObject({
    text: "Original comment",
    historical: true,
  });
  expect(thread.comments[1]).toMatchObject({
    text: "Replacement",
    status: "sent",
    version: "v2",
    messageId: "message-1",
  });
});

it("unknown and queued replacements retain the original until publication acknowledgement", async () => {
  for (const publication of ["unknown", "queued"] as const) {
    let submitted!: TranscriptSubmission;
    const { state, thread, original } = fixture({
      onSend: (snapshot) => {
        submitted = snapshot;
        return { publication };
      },
    });
    state.editSent(thread, original);
    state.draft = "Replacement";
    await state.send();
    expect(original.historical).not.toBe(true);
    if (publication === "unknown") {
      const snapshot = state.retainedSubmission!;
      state.recover(snapshot.id, {
        publication: "published",
        commentVersions: { [snapshot.comments[0]!.commentId]: "v2" },
      });
      expect(original.historical).toBe(true);
      expect(thread.comments[1]!.version).toBe("v2");
    } else {
      expect(state.canEditSent(thread, original)).toBe(false);
      state.markPublished(submitted, undefined, {
        [submitted.comments[0]!.commentId]: "v2",
      });
      expect(original.historical).toBe(true);
      expect(thread.comments[1]!.version).toBe("v2");
    }
  }
});

it("an acknowledgement without a version prevents editing the replacement again", async () => {
  const { state, thread, original } = fixture();
  state.editSent(thread, original);
  state.draft = "Replacement";
  await state.send();
  expect(original.historical).toBe(true);
  expect(state.canEditSent(thread, thread.comments[1]!)).toBe(false);
});

it("an edit acknowledgement never retires a newer host version", async () => {
  const { state, thread, original } = fixture({
    onSend: () => {
      original.version = "v2";
      original.text = "Newer host version";
      return { publication: "published" };
    },
  });
  state.editSent(thread, original);
  state.draft = "Replacement of v1";
  await state.send();
  expect(original.historical).not.toBe(true);
  expect(original.text).toBe("Newer host version");
});

it("pending submission prevents opening another sent-comment edit", async () => {
  let acknowledge!: (result: { publication: "published" }) => void;
  const { state, thread, original } = fixture({
    onSend: () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      }),
  });
  state.message = "Waiting";
  const send = state.send();
  state.editSent(thread, original);
  expect(state.pending).toHaveLength(0);
  acknowledge({ publication: "published" });
  await send;
});

it("rejected edits and newer host drafts survive without retiring the original", async () => {
  const { state, thread, original } = fixture({
    onSend: () => ({ publication: "refused", error: "Version changed" }),
  });
  state.editSent(thread, original);
  state.draft = "Replacement";
  await state.send();
  expect(state.draft).toBe("Replacement");
  expect(original.historical).not.toBe(true);
  const draft = thread.comments[1]!;
  const snapshot = {
    id: "snapshot",
    text: "",
    comments: [
      {
        threadId: thread.id,
        commentId: draft.id,
        anchor: thread.anchor,
        author: draft.author,
        text: draft.text,
        ...(draft.editOf ? { editOf: draft.editOf } : {}),
      },
    ],
  };
  draft.text = "Newer edit";
  state.markPublished(snapshot);
  expect(draft.status).toBe("draft");
  expect(original.historical).not.toBe(true);
});
