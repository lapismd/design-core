<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { Button } from "../../shadcn/button/index.js";
  import * as DropdownMenu from "../../shadcn/dropdown-menu/index.js";
  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import { EmojiPicker } from "../../shadcn/emoji-picker/index.js";
  import type {
    MessageAction,
    MessageActionsProps,
  } from "./message-actions.types.js";
  import "./message-actions.css";
  let {
    ref = $bindable(null),
    actions,
    children,
    additionalActions,
    label = "Message actions",
    moreLabel = "More message actions",
    disabled = false,
    alwaysVisible = false,
    tooltips = true,
    presentation,
    customEmojis = [],
    emojis,
    theme = "auto",
    onAddReaction,
    reactionLabel = "Add reaction",
    reactionOptions = [],
    class: className,
    ...restProps
  }: MessageActionsProps = $props();
  const reasonId = $props.id();
  let menuOpen = $state(false),
    emojiOpen = $state(false);
  const primary = $derived(
    actions.filter((action) => !action.hidden && action.primary),
  );
  const overflow = $derived(
    actions.filter((action) => !action.hidden && !action.primary),
  );
  const layout = $derived(presentation ?? (children ? "floating" : "inline"));
  function unavailable(action: MessageAction) {
    return disabled || action.disabled || Boolean(action.disabledReason);
  }
  function select(action: MessageAction) {
    if (!unavailable(action)) action.onSelect();
  }
</script>

{#snippet actionButton(
  action: MessageAction,
  index: number,
  props: Record<string, unknown> = {},
)}
  <Button
    {...props}
    variant="ghost"
    size={action.icon ? "icon-sm" : "sm"}
    aria-label={action.label}
    aria-disabled={unavailable(action)}
    aria-describedby={action.disabledReason
      ? `${reasonId}-${index}`
      : undefined}
    onclick={() => select(action)}
  >
    {#if action.icon}{@render action.icon()}{:else}{action.label}{/if}
  </Button>
{/snippet}

<div
  bind:this={ref}
  {...restProps}
  class={["ui-message-actions", className].filter(Boolean).join(" ")}
  data-ui-component="message-actions"
  data-presentation={layout}
  data-visible={alwaysVisible || menuOpen || emojiOpen}
>
  {@render children?.()}
  {#if primary.length || overflow.length || onAddReaction || additionalActions}
    <div class="ui-message-actions__controls" role="group" aria-label={label}>
      <Tooltip.Provider>
        {#if onAddReaction}
          <EmojiPicker
            bind:open={emojiOpen}
            triggerLabel={reactionLabel}
            presets={reactionOptions}
            {disabled}
            {customEmojis}
            {theme}
            {...emojis === undefined ? {} : { emojis }}
            onSelect={onAddReaction}
          />
        {/if}
        {#each primary as action, index (action.id)}
          {#if tooltips}<Tooltip.Root>
              <Tooltip.Trigger
                >{#snippet child({ props })}
                  {@render actionButton(action, index, props)}
                {/snippet}</Tooltip.Trigger
              >
              <Tooltip.Content
                >{action.disabledReason ?? action.label}</Tooltip.Content
              >
            </Tooltip.Root>{:else}{@render actionButton(action, index)}{/if}
          {#if action.disabledReason}<span
              class="ui-message-actions__reason"
              id={`${reasonId}-${index}`}>{action.disabledReason}</span
            >{/if}
        {/each}
        {#if overflow.length}
          <DropdownMenu.Root bind:open={menuOpen}>
            <DropdownMenu.Trigger
              >{#snippet child({ props })}
                <Button
                  {...props}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={moreLabel}
                  ><EllipsisIcon aria-hidden="true" /></Button
                >
              {/snippet}</DropdownMenu.Trigger
            >
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              preventScroll={false}
              class="ui-message-actions__menu"
            >
              <DropdownMenu.Group>
                {#each overflow as action (action.id)}
                  <DropdownMenu.Item
                    disabled={unavailable(action)}
                    variant={action.destructive ? "destructive" : "default"}
                    onSelect={() => select(action)}
                  >
                    {#if action.icon}{@render action.icon()}{/if}
                    <span class="ui-message-actions__menu-label"
                      ><span>{action.label}</span>
                      {#if action.disabledReason}<span
                          class="ui-message-actions__explanation"
                          >{action.disabledReason}</span
                        >{/if}
                    </span>
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {/if}
        {@render additionalActions?.()}
      </Tooltip.Provider>
    </div>
  {/if}
</div>
