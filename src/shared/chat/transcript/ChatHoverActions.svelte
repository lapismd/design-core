<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import { getContext } from "svelte";
  import {
    reactionContext,
    type TranscriptReactionContext,
  } from "./reaction-context.js";
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
  const inherited = getContext<TranscriptReactionContext | undefined>(
    reactionContext,
  );
  const reactions = $derived(inherited ?? state.props());
  const commentsEnabled = $derived(state.props().canComment !== false);
  const visible = $derived(
    commentsEnabled ||
      !!(reactionTarget && (reactions.onReact || messageActions)),
  );
</script>

{#if visible}<div
    class="ui-transcript-text-actions"
    role="group"
    aria-label={`Actions for ${block.label}`}
  >
    {#if reactionTarget && reactions.onReact}
      <EmojiPicker
        customEmojis={reactions.customEmojis ?? []}
        disabled={reactions.reactionsDisabled ?? false}
        {...reactions.reactionEmojis === undefined
          ? {}
          : { emojis: reactions.reactionEmojis }}
        triggerLabel={`Add reaction to ${block.label}`}
        presets={reactions.reactionOptions ?? []}
        onSelect={(emoji, custom) =>
          reactions.onReact?.(
            reactionTarget!,
            emoji,
            custom ??
              reactions.customEmojis?.find(
                (item) =>
                  item.id === emoji ||
                  item.shortcode === emoji ||
                  `:${item.shortcode}:` === emoji,
              ),
          )}
      />
    {/if}
    {#if commentsEnabled}<Button
        variant="ghost"
        size="sm"
        aria-label={`Comment on ${block.label}`}
        disabled={block.commentable === false}
        title={block.commentable === false
          ? "Waiting for an exact published source"
          : undefined}
        onclick={onComment}><MessageCircleIcon size={14} /> Comment</Button
      >{/if}
    {#if reactionTarget}{@render messageActions?.(reactionTarget)}{/if}
  </div>{/if}
