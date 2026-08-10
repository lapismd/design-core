<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { Button } from "../button/index.js";
  import { useColumnCanvas } from "./context.svelte.js";
  import { useColumnCanvasColumn } from "./column-canvas-column-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    onclick,
    ...restProps
  }: ComponentProps<typeof Button> & {
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const controller = useColumnCanvas();
  const column = useColumnCanvasColumn();

  const collapsed = $derived(controller.isCollapsed(column.id));
  const collapsible = $derived(controller.isCollapsible(column.id));
</script>

{#if collapsible}
  <Button
    bind:ref
    variant="ghost"
    size="icon-sm"
    class={className}
    type="button"
    data-ui-part="column-toggle"
    aria-label={collapsed
      ? `Expand ${column.title} column`
      : `Collapse ${column.title} column`}
    title={collapsed ? `Expand ${column.title}` : `Collapse ${column.title}`}
    {...restProps}
    onclick={(event) => {
      onclick?.(event);
      controller.toggle(column.id);
    }}
  >
    {#if collapsed}
      <ChevronRight size={14} aria-hidden="true" />
    {:else}
      <ChevronLeft size={14} aria-hidden="true" />
    {/if}
  </Button>
{/if}
