<script module lang="ts">
  export type Reaction = {
    emoji: string;
    count: number;
    selected?: boolean;
    label?: string;
  };
</script>

<script lang="ts">
  import * as Tooltip from "@lapismd/design-core/shadcn/tooltip";
  import { Toggle } from "@lapismd/design-core/shadcn/toggle";
  import type { HTMLAttributes } from "svelte/elements";
  import EmojiPicker, {
    type EmojiOption,
  } from "../emoji-picker/EmojiPicker.svelte";
  import "../../chat.css";

  let {
    ref = $bindable(null),
    reactions,
    label = "Reactions",
    addLabel = "Add reaction",
    emojis,
    onToggle,
    onAdd,
    ...restProps
  }: Omit<HTMLAttributes<HTMLDivElement>, "ontoggle"> & {
    ref?: HTMLDivElement | null;
    reactions: Reaction[];
    label?: string;
    addLabel?: string;
    emojis?: readonly EmojiOption[];
    onToggle?: (emoji: string) => void;
    onAdd?: (emoji: string) => void;
  } = $props();

  function reactionLabel(reaction: Reaction): string {
    if (reaction.label) return reaction.label;
    return `${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"} with ${reaction.emoji}`;
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-reaction-bar"
  data-ui-part="root"
  role="group"
  aria-label={label}
>
  <Tooltip.Provider>
    {#each reactions as reaction (reaction.emoji)}
      {@const accessibleLabel = reactionLabel(reaction)}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Toggle
              {...props}
              pressed={reaction.selected ?? false}
              aria-label={accessibleLabel}
              data-ai-chat-part="reaction"
              onPressedChange={() => onToggle?.(reaction.emoji)}
            >
              <span data-ui-part="reaction-emoji" aria-hidden="true">
                {reaction.emoji}
              </span>
              <span data-ui-part="reaction-count">{reaction.count}</span>
            </Toggle>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>{accessibleLabel}</Tooltip.Content>
      </Tooltip.Root>
    {/each}
    {#if onAdd}
      <EmojiPicker
        {emojis}
        label={addLabel}
        triggerLabel={addLabel}
        onSelect={onAdd}
      />
    {/if}
  </Tooltip.Provider>
</div>
