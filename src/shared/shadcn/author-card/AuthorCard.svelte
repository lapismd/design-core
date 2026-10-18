<script lang="ts">
  import {
    Avatar,
    avatarIdentityProps,
    avatarInitials,
  } from "../avatar/index.js";
  import * as HoverCard from "../hover-card/index.js";
  import * as Popover from "../popover/index.js";
  import { ScrollArea } from "../scroll-area/index.js";
  import { Button } from "../button/index.js";
  import type { AuthorCardProps } from "./author-card.types.js";
  import "./author-card.css";
  let {
    author,
    description,
    handle,
    role,
    actions = [],
    details,
    trigger = "avatar",
    interaction = "hover",
    size = "md",
    open = $bindable(false),
    disabled = false,
    label,
    class: className,
  }: AuthorCardProps = $props();
  // Include the visible fallback label for speech-input users as well as the name.
  const triggerLabel = $derived.by(() => {
    const base = label ?? `About ${author.name}`;
    const fallback =
      author.emoji || author.initials || avatarInitials(author.name);
    return fallback &&
      !base
        .toLocaleLowerCase()
        .split(/\s+/u)
        .includes(fallback.toLocaleLowerCase())
      ? `${base}, ${fallback}`
      : base;
  });
</script>

{#snippet face()}<Avatar
    {...avatarIdentityProps(author)}
    {size}
    decorative
  />{#if trigger === "mention"}<span>{author.name}</span>{/if}{/snippet}
{#snippet content()}
  <ScrollArea
    scrollStrategy="styled"
    class="ui-author-card__scroll"
    style="max-height:min(22rem, var(--bits-popover-content-available-height, var(--bits-link-preview-content-available-height, 70vh)))"
  >
    <div class="ui-author-card__body" data-ui-component="author-card">
      <div class="ui-author-card__identity">
        <Avatar {...avatarIdentityProps(author)} size="lg" /><span
          ><strong>{author.name}</strong>{#if handle}<small>{handle}</small
            >{/if}</span
        >
      </div>
      {#if role}<p class="ui-author-card__role">{role}</p>{/if}
      {#if description}<p class="ui-author-card__description">
          {description}
        </p>{/if}
      {@render details?.(author)}
      {#if actions.length}<div class="ui-author-card__actions">
          {#each actions as action (action.id)}<Button
              variant="ghost"
              size="sm"
              disabled={action.disabled ?? false}
              onclick={() => {
                if (!action.disabled) {
                  action.onSelect(author);
                  open = false;
                }
              }}
            >
              {#if action.icon}<action.icon
                  data-icon="inline-start"
                  aria-hidden="true"
                />{/if}{action.label}
            </Button>{/each}
        </div>{/if}
    </div>
  </ScrollArea>
{/snippet}
{#if disabled}<button
    type="button"
    disabled
    class={["ui-author-card__trigger", className]}
    data-trigger={trigger}
    data-size={size}
    aria-label={triggerLabel}>{@render face()}</button
  >
{:else if interaction === "popover"}
  <Popover.Root bind:open
    ><Popover.Trigger
      class={["ui-author-card__trigger", className]}
      data-trigger={trigger}
      data-size={size}
      aria-label={triggerLabel}>{@render face()}</Popover.Trigger
    >
    <Popover.Content
      class="ui-author-card"
      align="start"
      role="dialog"
      aria-label={`About ${author.name}`}>{@render content()}</Popover.Content
    >
  </Popover.Root>
{:else}
  <HoverCard.Root bind:open openDelay={280} closeDelay={120}
    ><HoverCard.Trigger
      >{#snippet child({ props })}<button
          {...props}
          type="button"
          class={["ui-author-card__trigger", className]}
          data-trigger={trigger}
          data-size={size}
          aria-label={triggerLabel}
          onclick={() => (open = !open)}>{@render face()}</button
        >{/snippet}</HoverCard.Trigger
    >
    <HoverCard.Content
      class="ui-author-card"
      side="right"
      align="start"
      sideOffset={8}
      role="group"
      aria-label={`About ${author.name}`}>{@render content()}</HoverCard.Content
    >
  </HoverCard.Root>
{/if}
