<script lang="ts">
  import { getContext } from "svelte";
  import MessageActions from "../message-actions/MessageActions.svelte";
  import type { MessageAction } from "../message-actions/message-actions.types.js";
  import {
    reactionContext,
    type TranscriptReactionContext,
  } from "./reaction-context.js";
  import {
    presentationContext,
    type TranscriptPresentationContext,
  } from "./presentation-context.js";
  import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
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
  const presentation = getContext<TranscriptPresentationContext | undefined>(
    presentationContext,
  );
  const reactions = $derived(inherited ?? state.props());
  const commentsEnabled = $derived(
    state.props().canComment !== false && block.commentable !== false,
  );
  const actions = $derived<MessageAction[]>([
    ...(commentsEnabled
      ? [
          {
            id: "comment",
            label: `Comment on ${block.label}`,
            primary: true,
            icon: commentIcon,
            onSelect: onComment,
          },
        ]
      : []),
    ...(reactionTarget
      ? ((presentation?.getMessageActions ?? state.props().getMessageActions)?.(
          reactionTarget,
          block,
        ) ?? [])
      : []),
  ]);
  const canReact = $derived(
    !!reactionTarget && !!reactions.onReact && !reactions.reactionsDisabled,
  );
  const visible = $derived(
    canReact ||
      actions.some(
        (action) =>
          !action.hidden && !action.disabled && !action.disabledReason,
      ) ||
      !!(reactionTarget && messageActions),
  );
</script>

{#snippet commentIcon()}<MessageCircleIcon aria-hidden="true" />{/snippet}
{#snippet legacyActions()}{#if reactionTarget}{@render messageActions?.(
      reactionTarget,
    )}{/if}{/snippet}
{#if visible}<div class="ui-transcript-text-actions">
    <MessageActions
      {actions}
      presentation="inline"
      label={`Actions for ${block.label}`}
      moreLabel={`More actions for ${block.label}`}
      tooltips={presentation?.actionTooltips ??
        state.props().actionTooltips ??
        true}
      customEmojis={reactions.customEmojis ?? []}
      {...reactions.reactionEmojis === undefined
        ? {}
        : { emojis: reactions.reactionEmojis }}
      reactionLabel={`Add reaction to ${block.label}`}
      reactionOptions={reactions.reactionOptions ?? []}
      {...canReact
        ? {
            onAddReaction: (emoji, custom) =>
              reactions.onReact?.(reactionTarget!, emoji, custom),
          }
        : {}}
      {...reactionTarget && messageActions
        ? { additionalActions: legacyActions }
        : {}}
    />
  </div>{/if}
