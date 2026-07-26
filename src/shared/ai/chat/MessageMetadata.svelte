<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import CheckCheckIcon from "@lucide/svelte/icons/check-check";
  import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { useMessageContext } from "./context.svelte.js";
  import type { MessageSender, MessageStatus } from "./types.js";
  import "./chat.css";

  let {
    ref = $bindable(null),
    sender: senderProp,
    timestamp,
    footer,
    status,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    sender?: MessageSender;
    timestamp?: string | Snippet;
    footer?: Snippet;
    status?: MessageStatus;
  } = $props();

  const message = useMessageContext();
  const sender = $derived(senderProp ?? message?.sender ?? "assistant");
  const statusLabel = $derived(
    status === "sending"
      ? "Sending"
      : status === "sent"
        ? "Sent"
        : status === "delivered"
          ? "Delivered"
          : status === "read"
            ? "Read"
            : status === "error"
              ? "Failed to send"
              : "",
  );
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-message-metadata"
  data-ui-part="root"
  data-sender={sender}
>
  {#if timestamp}
    <span data-ui-part="timestamp">
      {#if typeof timestamp === "string"}
        {timestamp}
      {:else}
        {@render timestamp()}
      {/if}
    </span>
  {/if}
  {#if footer}
    <span data-ui-part="footer">
      {@render footer()}
    </span>
  {/if}
  {#if status}
    <span
      data-ui-part="status"
      data-status={status}
      aria-label={statusLabel}
      role={status === "error" ? "alert" : undefined}
    >
      {#if status === "sending"}
        <ClockIcon aria-hidden="true" />
      {:else if status === "delivered" || status === "read"}
        <CheckCheckIcon aria-hidden="true" />
      {:else if status === "error"}
        <CircleAlertIcon aria-hidden="true" />
      {:else}
        <CheckIcon aria-hidden="true" />
      {/if}
      <span>{statusLabel}</span>
    </span>
  {/if}
</div>
