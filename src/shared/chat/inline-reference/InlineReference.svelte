<script lang="ts">
  import { ReferenceChip } from "../../shadcn/reference-chip/index.js";
  import type { ChatReference } from "./inline-reference.types.js";
  import type { Snippet } from "svelte";
  let {
    reference,
    onActivate,
    onRemove,
    popover,
  }: {
    reference: ChatReference;
    onActivate?: ((reference: ChatReference) => void) | undefined;
    onRemove?: (() => void) | undefined;
    popover?: Snippet<[ChatReference]> | undefined;
  } = $props();
</script>

{#if reference.presentation === "emoji" && reference.avatar?.src}
  <span class="ui-chat-inline-emoji">
    <img
      style="width:100%;height:100%;border:0"
      src={reference.avatar.src}
      alt={reference.label}
      title={reference.description ?? reference.label}
    />
  </span>
{:else}
  {#snippet preview()}{@render popover?.(reference)}{/snippet}
  <ReferenceChip
    label={reference.label}
    {...reference.description === undefined
      ? {}
      : { description: reference.description }}
    {...reference.icon ? { icon: reference.icon } : {}}
    {...reference.avatar ? { avatar: reference.avatar } : {}}
    {...reference.href === undefined ? {} : { href: reference.href }}
    appearance={reference.appearance ??
      (onRemove || ["person", "agent"].includes(reference.kind)
        ? "mention"
        : "reference")}
    {...onRemove ? { onRemove } : {}}
    {...popover ? { preview } : {}}
    {...onActivate
      ? {
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            onActivate(reference);
          },
        }
      : {}}
  />
{/if}

<style>
  .ui-chat-inline-emoji {
    display: inline-flex;
    vertical-align: -0.15em;
    width: var(--ui-chat-inline-emoji-size, 1.2em);
    height: var(--ui-chat-inline-emoji-size, 1.2em);
    object-fit: contain;
  }
</style>
