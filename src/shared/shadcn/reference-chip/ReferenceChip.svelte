<script lang="ts">
  import { Avatar, avatarIdentityProps } from "../avatar/index.js";
  import { Badge } from "../badge/index.js";
  import * as Tooltip from "../tooltip/index.js";
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
    class: className,
  }: ReferenceChipProps = $props();
  const destination = $derived(disabled ? undefined : safeLink(href));
  const tooltip = $derived(description ? `${label} — ${description}` : label);
</script>

{#snippet inner()}{#if avatar}<Avatar
      {...avatarIdentityProps(avatar)}
      size="xs"
      decorative
    />{:else if Icon}<Icon aria-hidden="true" />{/if}<span
    class="ui-reference-chip__label">{label}</span
  >{/snippet}
{#snippet content()}<Badge {variant}>{@render inner()}</Badge>{/snippet}
<span
  class={["ui-reference-chip", className]}
  data-ui-component="reference-chip"
  data-disabled={disabled}
>
  <Tooltip.Provider
    ><Tooltip.Root
      ><Tooltip.Trigger
        >{#snippet child({ props })}
          {#if destination}<a
              {...props}
              href={destination}
              class="ui-reference-chip__target"
              aria-label={label}
              onclick={onClick}>{@render content()}</a
            >
          {:else if onClick}<button
              {...props}
              type="button"
              class="ui-reference-chip__target"
              {disabled}
              aria-label={label}
              onclick={(event) => {
                if (!disabled) onClick?.(event);
              }}>{@render content()}</button
            >
          {:else}<Badge
              {...props}
              {variant}
              class="ui-reference-chip__target"
              tabindex={disabled ? undefined : 0}
              aria-label={label}
              aria-disabled={disabled || undefined}>{@render inner()}</Badge
            >{/if}
        {/snippet}</Tooltip.Trigger
      ><Tooltip.Content role="tooltip">{tooltip}</Tooltip.Content></Tooltip.Root
    ></Tooltip.Provider
  >
  {#if onRemove}<button
      class="ui-reference-chip__remove"
      type="button"
      {disabled}
      aria-label={`Remove ${label}`}
      onclick={() => {
        if (!disabled) onRemove?.();
      }}><XIcon aria-hidden="true" /></button
    >{/if}
</span>
