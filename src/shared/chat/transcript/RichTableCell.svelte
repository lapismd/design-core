<script lang="ts">
  import type { Snippet } from "svelte";
  import RichSourceReader from "./RichSourceReader.svelte";
  let {
    tagName = "td",
    ref = $bindable(null),
    children,
    "data-transcript-from": from,
    "data-transcript-to": to,
    ...rest
  }: {
    tagName?: string;
    ref?: HTMLElement | null;
    children?: Snippet;
    "data-transcript-from"?: number;
    "data-transcript-to"?: number;
    [key: string]: unknown;
  } = $props();
</script>

<svelte:element this={tagName} bind:this={ref} {...rest}>
  {#if from !== undefined && to !== undefined}
    <RichSourceReader {from} {to} label="Table cell" />
  {:else}{@render children?.()}{/if}
</svelte:element>
