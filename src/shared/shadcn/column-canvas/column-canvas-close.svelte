<script lang="ts">
  import type { ComponentProps } from "svelte";
  import XIcon from "@lucide/svelte/icons/x";
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

  const closeable = $derived(controller.isCloseable(column.id));
</script>

{#if closeable}
  <Button
    bind:ref
    variant="ghost"
    size="icon-sm"
    class={className}
    type="button"
    data-ui-part="column-close"
    aria-label={`Close ${column.title} column`}
    title={`Close ${column.title}`}
    {...restProps}
    onclick={(event) => {
      onclick?.(event);
      controller.close(column.id);
    }}
  >
    <XIcon aria-hidden="true" />
  </Button>
{/if}
