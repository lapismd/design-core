<script lang="ts">
  import type { Snippet } from "svelte";
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import ChatContent from "./ChatContent.svelte";
  import type { TranscriptItem, TranscriptProps } from "./model.js";
  import type { TranscriptController } from "./comments.svelte.js";
  let {
    item,
    state,
    customBlock,
    actions,
  }: {
    item: TranscriptItem;
    state: TranscriptController;
    customBlock?: TranscriptProps["customBlock"];
    actions?: Snippet<[TranscriptItem]> | undefined;
  } = $props();
</script>

<div
  class="transcript-notice"
  data-severity={item.notice}
  role={item.notice === "error" ? "alert" : "status"}
  aria-label={item.label}
>
  <span class="transcript-notice-icon" aria-hidden="true"
    ><TriangleAlertIcon /></span
  >
  <div class="transcript-notice-content">
    <strong>{item.label}</strong>
    <ChatContent
      blocks={item.blocks}
      {state}
      {customBlock}
      showHeaders={false}
    />
  </div>
  {#if actions}<div class="transcript-notice-actions">
      {@render actions(item)}
    </div>{/if}
</div>

<style>
  .transcript-notice {
    --notice-tone: var(--destructive);
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--radius);
    color: var(--foreground);
    background: color-mix(in oklab, var(--notice-tone) 12%, var(--background));
    font-size: 0.75rem;
    line-height: 1.5;
  }
  .transcript-notice[data-severity="warning"] {
    --notice-tone: var(--chart-4);
  }
  .transcript-notice-icon {
    display: grid;
    place-items: center;
    flex: none;
    width: 1.625rem;
    height: 1.625rem;
    border-radius: 50%;
    color: var(--notice-tone);
    background: color-mix(in oklab, var(--notice-tone) 18%, var(--background));
  }
  .transcript-notice-icon :global(svg) {
    width: 0.9375rem;
    height: 0.9375rem;
  }
  .transcript-notice-content {
    flex: 1;
    min-width: 0;
  }
  .transcript-notice-content strong {
    display: block;
    font-weight: 600;
    margin-bottom: 0.125rem;
  }
  .transcript-notice-actions {
    flex: none;
    display: flex;
    align-self: center;
    margin-inline-start: auto;
  }
</style>
