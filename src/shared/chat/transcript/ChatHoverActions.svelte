<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
  import { EmojiPicker } from "../../shadcn/emoji-picker/index.js";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  import type { TranscriptController } from "./comments.svelte.js";
  let {
    block,
    state,
    onComment,
    reactionTarget,
    messageActions,
  }: {
    block: TranscriptBlock;
    state: TranscriptController;
    onComment: () => void;
    reactionTarget?: string | undefined;
    messageActions?: TranscriptProps["messageActions"];
  } = $props();
</script>

<div
  class="ui-transcript-text-actions"
  role="group"
  aria-label={`Actions for ${block.label}`}
>
  {#if reactionTarget && state.props().onReact}
    <EmojiPicker
      customEmojis={state.props().customEmojis ?? []}
      triggerLabel={`Add reaction to ${block.label}`}
      presets={state.props().reactionOptions ?? []}
      onSelect={(emoji, custom) =>
        state.props().onReact?.(reactionTarget!, emoji, custom)}
    />
  {/if}
  <Button
    variant="ghost"
    size="sm"
    aria-label={`Comment on ${block.label}`}
    disabled={block.commentable === false || state.props().canComment === false}
    title={state.props().canComment === false
      ? (state.props().commentUnavailable ?? "Commenting is unavailable")
      : block.commentable === false
        ? "Waiting for an exact published source"
        : undefined}
    onclick={onComment}><MessageCircleIcon size={14} /> Comment</Button
  >
  {#if reactionTarget}{@render messageActions?.(reactionTarget)}{/if}
</div>
