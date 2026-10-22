<script lang="ts">
  import {
    Avatar,
    avatarIdentityProps,
    avatarInitials,
  } from "../avatar/index.js";
  import { Badge } from "../badge/index.js";
  import * as Tooltip from "../tooltip/index.js";
  import * as HoverCard from "../hover-card/index.js";
  import type { HTMLAttributes } from "svelte/elements";
  import XIcon from "@lucide/svelte/icons/x";
  import { safeLink } from "../link-preview/safe-link.js";
  import type { ReferenceChipProps } from "./reference-chip.types.js";
  import "./reference-chip.css";
  let {
    label,
    description,
    icon: Icon,
    avatar,
    href,
    onClick,
    onRemove,
    disabled = false,
    variant = "secondary",
    appearance = "reference",
    preview,
    class: className,
  }: ReferenceChipProps = $props();
  const destination = $derived(disabled ? undefined : safeLink(href));
  const tooltip = $derived(description ? `${label} — ${description}` : label);
  let previewOpen = $state(false);
  const accessibleLabel = $derived(
    avatar
      ? `${avatar.emoji || avatar.initials || avatarInitials(avatar.name)} ${label}`
      : label,
  );
</script>

{#snippet inner()}{#if avatar}<Avatar
      {...avatarIdentityProps(avatar)}
      size="xs"
      decorative
    />{:else if Icon}<Icon aria-hidden="true" />{/if}<span
    class="ui-reference-chip__label">{label}</span
  >{/snippet}
{#snippet content()}<Badge {variant}>{@render inner()}</Badge>{/snippet}
{#snippet target(props: HTMLAttributes<HTMLElement>)}
  {#if destination}<a
      {...props}
      href={destination}
      role={undefined}
      class="ui-reference-chip__target"
      aria-label={accessibleLabel}
      onclick={(event) => {
        props.onclick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      }}>{@render content()}</a
    >
  {:else if onClick || preview}<button
      {...props}
      type="button"
      class="ui-reference-chip__target"
      {disabled}
      aria-label={accessibleLabel}
      onclick={(event) => {
        if (!disabled) {
          props.onclick?.(event);
          if (!event.defaultPrevented) onClick?.(event);
        }
      }}>{@render content()}</button
    >
  {:else}<Badge
      {...props}
      {variant}
      class="ui-reference-chip__target"
      tabindex={disabled ? undefined : 0}
      aria-label={accessibleLabel}
      aria-disabled={disabled || undefined}>{@render inner()}</Badge
    >
  {/if}
{/snippet}
<span
  class={["ui-reference-chip", className]}
  data-ui-component="reference-chip"
  data-disabled={disabled}
  data-appearance={appearance}
>
  {#if preview && !disabled}<HoverCard.Root
      bind:open={previewOpen}
      openDelay={280}
      closeDelay={120}
    >
      <HoverCard.Trigger
        >{#snippet child({ props })}{@render target(
            props,
          )}{/snippet}</HoverCard.Trigger
      >
      <HoverCard.Content
        forceMount
        hidden={!previewOpen}
        class="ui-reference-chip__preview"
        side="right"
        align="start"
        sideOffset={8}
        role="group"
        aria-label={`About ${label}`}
      >
        {@render preview()}
      </HoverCard.Content>
    </HoverCard.Root>
  {:else}<Tooltip.Provider
      ><Tooltip.Root
        ><Tooltip.Trigger
          >{#snippet child({ props })}
            {@render target(props)}
          {/snippet}</Tooltip.Trigger
        ><Tooltip.Content role="tooltip">{tooltip}</Tooltip.Content
        ></Tooltip.Root
      ></Tooltip.Provider
    >{/if}
  {#if onRemove}<button
      class="ui-reference-chip__remove"
      type="button"
      {disabled}
      aria-label={`Remove ${label}`}
      onmousedown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onclick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) onRemove?.();
      }}><XIcon aria-hidden="true" /></button
    >{/if}
</span>
