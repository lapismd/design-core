<script lang="ts">
  import { tick } from "svelte";
  import CommentComposer from "../comment-composer/CommentComposer.svelte";
  import type { CommentComposerHandle } from "../comment-composer/comment-composer.types.js";
  import type { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptCommentThread, TranscriptComment } from "./model.js";
  let {
    state: controller,
    thread,
    comment,
    location,
  }: {
    state: TranscriptController;
    thread: TranscriptCommentThread;
    comment: TranscriptComment;
    location: "inline" | "queue";
  } = $props();
  let focusedFor = "";
  let handle = $state<CommentComposerHandle | null>(null);
  $effect(() => {
    if (
      controller.active?.commentId !== comment.id ||
      controller.active.location !== location
    ) {
      focusedFor = "";
      return;
    }
    if (
      controller.active?.commentId === comment.id &&
      controller.active.location === location &&
      handle
    ) {
      const key = `${comment.id}:${location}`;
      const editor = handle;
      void tick().then(() => {
        if (handle !== editor || focusedFor === key) return;
        focusedFor = key;
        const retained = controller.selections.get(key);
        const lines = comment.text.split("\n");
        const end = { line: lines.length - 1, ch: lines.at(-1)!.length };
        editor.setSelection(retained ?? { anchor: end, head: end });
        editor.focus();
      });
    }
  });
</script>

<div
  class="chat-comment-editor"
  data-comment-editor={comment.id}
  data-location={location}
  onfocusin={() => controller.activate(thread, comment, location)}
>
  <CommentComposer
    bind:handle
    presentation="bare"
    value={comment.text}
    onChange={(text) => controller.edit(comment.id, text)}
    onSelectionChange={(selection) =>
      controller.selections.set(`${comment.id}:${location}`, selection)}
    inputLabel={`Comment on ${thread.label}`}
    readOnly={comment.status !== "draft"}
    disabled={controller.props().canComment === false || controller.sending}
    onSubmit={() => {
      void controller.send();
    }}
    onDismiss={() => controller.close()}
  />
</div>
