<script lang="ts">
  import InfoIcon from "@lucide/svelte/icons/info";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import SystemMessage from "../../ai/system-message/SystemMessage.svelte";
  import { RelativeTime } from "../../shadcn/relative-time/index.js";
  import type { TranscriptItem } from "./model.js";
  let { item }: { item: TranscriptItem } = $props();
  const Icon = $derived(
    item.icon ?? (item.notice === "warning" ? TriangleAlertIcon : InfoIcon),
  );
  const date = $derived(
    item.createdAt && Number.isFinite(Date.parse(item.createdAt))
      ? item.createdAt
      : undefined,
  );
</script>

<div class="system-message">
  <SystemMessage variant="divider">
    <span
      class="system-message-label"
      title={item.label}
      data-warning={item.notice === "warning" || undefined}
    >
      <Icon aria-hidden="true" /><span>{item.label}</span>
    </span>
  </SystemMessage>
  {#if date}<div class="system-message-time">
      <RelativeTime timestamp={date} />
    </div>
  {:else if item.timestamp}<span class="system-message-time"
      >{item.timestamp}</span
    >{/if}
</div>

<style>
  .system-message {
    display: grid;
    gap: 0.25rem;
    width: 100%;
    text-align: center;
  }
  .system-message-time {
    color: var(--muted-foreground);
    font-size: 0.6875rem;
    line-height: 1.25;
  }
  .system-message-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    white-space: nowrap;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius);
    background: var(--muted);
    color: var(--muted-foreground);
    line-height: 1.5;
  }
  .system-message-label > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .system-message-label[data-warning] {
    background: color-mix(in oklab, var(--chart-4) 12%, var(--background));
    color: var(--foreground);
  }
  .system-message-label > :global(svg) {
    width: 0.875rem;
    height: 0.875rem;
    flex: none;
  }
  .system-message-label[data-warning] > :global(svg) {
    color: var(--chart-4);
  }
</style>
