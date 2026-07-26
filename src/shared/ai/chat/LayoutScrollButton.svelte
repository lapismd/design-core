<script lang="ts">
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import "./chat.css";

  let {
    ref = $bindable(null),
    isVisible,
    hasNewMessages = false,
    label,
    onClick,
  }: {
    ref?: HTMLDivElement | null;
    /** Whether the recovery control is visually and semantically available. */
    isVisible: boolean;
    /** Use the stronger new-message label instead of the generic scroll label. */
    hasNewMessages?: boolean;
    label?: string;
    onClick: () => void;
  } = $props();

  const resolvedLabel = $derived(
    label ?? (hasNewMessages ? "New messages" : "Scroll to latest"),
  );
</script>

<div
  bind:this={ref}
  data-ui-component="ai-chat-layout-scroll-button"
  data-ui-part="root"
  data-visible={isVisible}
  aria-hidden={!isVisible}
  inert={!isVisible ? true : undefined}
>
  <Button
    type="button"
    size={hasNewMessages ? "sm" : "icon-sm"}
    variant="outline"
    aria-label={resolvedLabel}
    onclick={onClick}
  >
    <ArrowDownIcon aria-hidden="true" />
    {#if hasNewMessages}
      <span>{resolvedLabel}</span>
    {/if}
  </Button>
</div>
