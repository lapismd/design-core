<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useColumnCanvasColumn } from "./column-canvas-column-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
    children?: Snippet;
  } = $props();

  const column = useColumnCanvasColumn();
</script>

{#if children || column.count !== undefined}
  <span
    bind:this={ref}
    {...restProps}
    class={className}
    data-ui-component="column-canvas"
    data-ui-part="column-count"
  >
    {#if children}
      {@render children()}
    {:else}
      {column.count}
    {/if}
  </span>
{/if}
