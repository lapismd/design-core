<script lang="ts">
  import { untrack, type ComponentProps, type Snippet } from "svelte";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { Button } from "../button/index.js";
  import { useColumnCanvasContext } from "./context.svelte.js";
  import { useColumnCanvasColumn } from "./column-canvas-column-context.svelte.js";
  import type { ColumnCanvasColumnState } from "./column-canvas-types.js";

  let {
    ref = $bindable(null),
    columnId,
    columnTitle,
    previewOnHover = false,
    previewDelay = 600,
    previewDismissDelay = 120,
    icon,
    class: className,
    onclick,
    onmouseenter,
    onmouseleave,
    onpointerdown,
    ...restProps
  }: ComponentProps<typeof Button> & {
    /** Explicit target when the toggle is rendered outside its column. */
    columnId?: string;
    /** Human-readable target title for generated labels. */
    columnTitle?: string;
    /** Preview a collapsed or closed target after pointer hover. */
    previewOnHover?: boolean;
    /** Delay before the optional preview opens. */
    previewDelay?: number;
    /** Grace period before the optional preview closes. */
    previewDismissDelay?: number;
    /** Optional consumer icon. Receives the current target state. */
    icon?: Snippet<[ColumnCanvasColumnState]>;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const canvas = useColumnCanvasContext();
  const controller = canvas.controller;
  const column = untrack(() =>
    columnId === undefined ? useColumnCanvasColumn() : undefined,
  );
  const targetId = $derived(columnId ?? column?.id ?? "");
  const targetTitle = $derived(columnTitle ?? column?.title ?? targetId);
  const state = $derived(controller.getState(targetId));
  const previewed = $derived(controller.isPreviewed(targetId));
  const collapsed = $derived(state === "collapsed");
  const closed = $derived(state === "closed");
  const collapsible = $derived(controller.isCollapsible(targetId));
  const actionable = $derived(collapsible || closed);
  let suppressHoverPreview = false;

  function resolveAccessibleLabel(): string {
    if (restProps["aria-label"]) return String(restProps["aria-label"]);
    if (closed) return `Open ${targetTitle} column`;
    return `${collapsed ? "Expand" : "Collapse"} ${targetTitle} column`;
  }
</script>

{#if actionable}
  <Button
    bind:ref
    variant="ghost"
    size="icon-sm"
    class={className}
    type="button"
    data-ui-part="column-toggle"
    data-target-column-id={targetId}
    data-state={state}
    aria-label={resolveAccessibleLabel()}
    aria-expanded={previewed || state === "expanded"}
    title={closed
      ? `Open ${targetTitle}`
      : `${collapsed ? "Expand" : "Collapse"} ${targetTitle}`}
    {...restProps}
    onmouseenter={(event) => {
      if (
        canvas.displayMode !== "compact" &&
        previewOnHover &&
        !suppressHoverPreview
      ) {
        controller.schedulePreview(targetId, previewDelay);
      }
      onmouseenter?.(event);
    }}
    onmouseleave={(event) => {
      suppressHoverPreview = false;
      if (canvas.displayMode !== "compact" && previewOnHover) {
        controller.schedulePreviewDismiss(targetId, previewDismissDelay);
      }
      onmouseleave?.(event);
    }}
    onpointerdown={(event) => {
      suppressHoverPreview = true;
      controller.dismissPreview(targetId);
      onpointerdown?.(event);
    }}
    onclick={(event) => {
      onclick?.(event);
      controller.dismissPreview(targetId);
      controller.toggle(targetId);
    }}
  >
    {#if icon}
      {@render icon(state)}
    {:else if collapsed || closed}
      <ChevronRight size={14} aria-hidden="true" />
    {:else}
      <ChevronLeft size={14} aria-hidden="true" />
    {/if}
  </Button>
{/if}
