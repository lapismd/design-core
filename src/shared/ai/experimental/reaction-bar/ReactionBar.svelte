<script module lang="ts">
  export type { Reaction } from "./reaction-bar.types.js";
</script>

<script lang="ts">
  import * as Tooltip from "@lapismd/design-core/shadcn/tooltip";
  import { Toggle } from "@lapismd/design-core/shadcn/toggle";
  import type { Reaction, ReactionBarProps } from "./reaction-bar.types.js";
  import { EmojiPicker } from "../../../shadcn/emoji-picker/index.js";
  import "../../chat.css";
  import "./reaction-bar.css";

  let {
    ref = $bindable(null),
    reactions,
    label = "Reactions",
    addLabel = "Add reaction",
    emojis,
    customEmojis = [],
    disabled = false,
    theme = "auto",
    onToggle,
    onAdd,
    ...restProps
  }: ReactionBarProps = $props();

  function customFor(reaction: Reaction) {
    return (
      reaction.custom ??
      customEmojis.find(
        (emoji) =>
          emoji.id === reaction.emoji ||
          emoji.shortcode === reaction.emoji ||
          `:${emoji.shortcode}:` === reaction.emoji,
      )
    );
  }

  function reactionLabel(reaction: Reaction): string {
    if (reaction.label) return reaction.label;
    const custom = customFor(reaction);
    return `${reaction.count} ${reaction.count === 1 ? "reaction" : "reactions"} with ${custom?.label ?? custom?.shortcode ?? reaction.emoji}`;
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
      {@const custom = customFor(reaction)}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Toggle
              {...props}
              pressed={reaction.selected ?? false}
              {disabled}
              aria-label={accessibleLabel}
              data-ai-chat-part="reaction"
              onPressedChange={() => {
                if (disabled) return;
                if (custom) onToggle?.(reaction.emoji, custom);
                else onToggle?.(reaction.emoji);
              }}
            >
              <span data-ui-part="reaction-emoji" aria-hidden="true">
                {#if custom}<img
                    src={custom.url}
                    alt=""
                  />{:else}{reaction.emoji}{/if}
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
        {...emojis === undefined ? {} : { emojis }}
        label={addLabel}
        triggerLabel={addLabel}
        {disabled}
        {customEmojis}
        {theme}
        onSelect={onAdd}
      />
    {/if}
  </Tooltip.Provider>
</div>
