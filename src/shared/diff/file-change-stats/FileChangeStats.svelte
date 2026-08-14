<script lang="ts">
  import { formatDiffDelta } from "./format-diff-delta.js";
  import "./FileChangeStats.css";

  let {
    additions = 0,
    deletions = 0,
    showZero = false,
  }: {
    additions?: number;
    deletions?: number;
    /** When true, render `+0` / `-0` instead of hiding a zero side. */
    showZero?: boolean;
  } = $props();

  const added = $derived(Math.max(0, additions));
  const removed = $derived(Math.max(0, deletions));
  const showAdded = $derived(showZero || added > 0);
  const showRemoved = $derived(showZero || removed > 0);
</script>

{#if showAdded || showRemoved}
  <span
    class="ui-diff-file-change-stats"
    data-ui-component="file-change-stats"
    data-ui-part="file-change-stats"
  >
    {#if showAdded}
      <span data-tone="added">{formatDiffDelta(added, "+")}</span>
    {/if}
    {#if showRemoved}
      <span data-tone="removed">{formatDiffDelta(removed, "-")}</span>
    {/if}
  </span>
{/if}
