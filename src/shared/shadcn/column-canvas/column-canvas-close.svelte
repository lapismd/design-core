<script lang="ts">
  import type { ComponentProps } from "svelte";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "../button/index.js";
  import { useColumnCanvasContext } from "./context.svelte.js";
  import { useColumnCanvasColumn } from "./column-canvas-column-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    onclick,
    ...restProps
  }: ComponentProps<typeof Button> & {
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const canvas = useColumnCanvasContext();
  const controller = canvas.controller;
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
      canvas.requestAlignment();
    }}
  >
    <XIcon aria-hidden="true" />
  </Button>
{/if}
