<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useMessageContext } from "../context.svelte.js";
  import type {
    Density,
    MessageBubbleGroup,
    MessageBubbleVariant,
    MessageSender,
  } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    sender: senderProp,
    density: densityProp,
    variant = "filled",
    group,
    name,
    metadata,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    sender?: MessageSender;
    density?: Density;
    variant?: MessageBubbleVariant;
    group?: MessageBubbleGroup;
    name?: Snippet;
    metadata?: Snippet;
    children: Snippet;
  } = $props();

  const message = useMessageContext();
  const sender = $derived(senderProp ?? message?.sender ?? "assistant");
  const density = $derived(densityProp ?? message?.density ?? "balanced");
</script>

{#if name}
  <div data-ui-part="bubble-name-row" data-chat-name>
    {@render name()}
  </div>
{/if}

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-message-bubble"
  data-ui-part="root"
  data-sender={sender}
  data-density={density}
  data-variant={variant}
  data-group={group}
>
  {@render children()}
</div>

{#if metadata}
  <div data-ui-part="bubble-metadata">
    {@render metadata()}
  </div>
{/if}
