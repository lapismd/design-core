<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import "../chat.css";

  let {
    ref = $bindable(null),
    names = [],
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    names?: string[];
  } = $props();

  const label = $derived(
    names.length === 0
      ? null
      : names.length === 1
        ? `${names[0]} is typing…`
        : names.length === 2
          ? `${names[0]} and ${names[1]} are typing…`
          : `${names[0]} and ${names.length - 1} others are typing…`,
  );
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-typing-indicator"
  data-ui-part="root"
  role="status"
  aria-live="polite"
>
  <span data-ui-part="typing-dots" aria-hidden="true">
    <span data-ui-part="typing-dot"></span>
    <span data-ui-part="typing-dot"></span>
    <span data-ui-part="typing-dot"></span>
  </span>
  {#if label}
    <span data-ui-part="typing-label">{label}</span>
  {/if}
</div>
