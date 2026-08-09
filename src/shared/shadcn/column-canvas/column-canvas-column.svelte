<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useColumnCanvas } from "./context.svelte.js";
  import { setColumnCanvasColumnContext } from "./column-canvas-column-context.svelte.js";
  import Header from "./column-canvas-header.svelte";
  import Title from "./column-canvas-title.svelte";
  import Count from "./column-canvas-count.svelte";
  import Toggle from "./column-canvas-toggle.svelte";
  import Close from "./column-canvas-close.svelte";

  let {
    ref = $bindable(null),
    id,
    title,
    count,
    resizable: resizableProp,
    collapsible: collapsibleProp,
    closeable: closeableProp,
    width: widthOverride,
    onWidthChange,
    class: className,
    children,
    ...restProps
  }: WithElementRef<
    Omit<HTMLAttributes<HTMLElement>, "id" | "children" | "title">,
    HTMLElement
  > & {
    /** Stable column id registered on the controller. */
    id: string;
    /**
     * Convenience title for the default header and a11y labels.
     * Omit when composing a custom `Header`.
     */
    title?: string;
    /** Convenience count badge for the default header. */
    count?: number;
    /**
     * When true, renders a trailing resize handle that updates the controller.
     * Defaults to the column config on the controller.
     */
    resizable?: boolean;
    /**
     * When true, Toggle can collapse this column to a rail.
     * Defaults to the column config on the controller.
     */
    collapsible?: boolean;
    /**
     * When true, Close can remove this column from the canvas.
     * Defaults to the column config on the controller.
     */
    closeable?: boolean;
    /** Test/override width. Prefer controller-owned widths. */
    width?: number;
    /** Test/override resize callback. Prefer controller-owned widths. */
    onWidthChange?: (width: number) => void;
    children?: Snippet;
  } = $props();

  const controller = useColumnCanvas();

  const resolvedTitle = $derived(title ?? id);
  const resolvedResizable = $derived(
    resizableProp ?? controller.isResizable(id),
  );
  const resolvedCollapsible = $derived(
    collapsibleProp ?? controller.isCollapsible(id),
  );
  const resolvedCloseable = $derived(
    closeableProp ?? controller.isCloseable(id),
  );
  const closed = $derived(controller.isClosed(id));
  const collapsed = $derived(controller.isCollapsed(id));
  const width = $derived(widthOverride ?? controller.getWidth(id));
  const minWidth = $derived(controller.getMinWidth(id));
  const maxWidth = $derived(controller.getMaxWidth(id));
  const useDefaultHeader = $derived(title !== undefined);

  setColumnCanvasColumnContext({
    get id() {
      return id;
    },
    get title() {
      return resolvedTitle;
    },
    get count() {
      return count;
    },
    get resizable() {
      return resolvedResizable;
    },
    get collapsible() {
      return resolvedCollapsible;
    },
    get closeable() {
      return resolvedCloseable;
    },
  });

  let resizing = $state(false);

  function startHorizontalResize(event: PointerEvent): void {
    if (!resolvedResizable || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = width;
    const ownerDocument =
      event.currentTarget instanceof Element
        ? event.currentTarget.ownerDocument
        : document;
    const body = ownerDocument.body;
    const previousUserSelect = body.style.userSelect;
    const previousCursor = body.style.cursor;
    resizing = true;

    function handlePointerMove(pointerEvent: PointerEvent): void {
      const next = Math.min(
        maxWidth,
        Math.max(
          minWidth,
          Math.round(startWidth + pointerEvent.clientX - startX),
        ),
      );
      if (onWidthChange) {
        onWidthChange(next);
      } else {
        controller.setWidth(id, next);
      }
    }

    function stopResize(): void {
      resizing = false;
      body.style.userSelect = previousUserSelect;
      body.style.cursor = previousCursor;
      ownerDocument.defaultView?.removeEventListener(
        "pointermove",
        handlePointerMove,
      );
      ownerDocument.defaultView?.removeEventListener("pointerup", stopResize);
      ownerDocument.defaultView?.removeEventListener(
        "pointercancel",
        stopResize,
      );
    }

    body.style.userSelect = "none";
    body.style.cursor = "ew-resize";
    ownerDocument.defaultView?.addEventListener(
      "pointermove",
      handlePointerMove,
    );
    ownerDocument.defaultView?.addEventListener("pointerup", stopResize);
    ownerDocument.defaultView?.addEventListener("pointercancel", stopResize);
  }
</script>

{#if !closed}
  {#if collapsed && resolvedCollapsible}
    <section
      bind:this={ref}
      {...restProps}
      class={className}
      data-ui-component="column-canvas"
      data-ui-part="collapsed-column"
      data-column-id={id}
    >
      <button
        type="button"
        data-ui-component="column-canvas"
        data-ui-part="collapsed-trigger"
        aria-label={`Expand ${resolvedTitle} column`}
        title={count === undefined
          ? resolvedTitle
          : `${resolvedTitle} (${count})`}
        onclick={() => controller.expand(id)}
      >
        <span data-ui-component="column-canvas" data-ui-part="collapsed-label">
          <span>{resolvedTitle}</span>
          {#if count !== undefined}
            <span
              data-ui-component="column-canvas"
              data-ui-part="collapsed-count"
            >
              {count}
            </span>
          {/if}
        </span>
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </section>
  {:else}
    <section
      bind:this={ref}
      {...restProps}
      class={className}
      data-ui-component="column-canvas"
      data-ui-part="column"
      data-column-id={id}
      data-resizable={resolvedResizable ? "true" : undefined}
      style:width={`${width}px`}
      style:min-width={`${width}px`}
    >
      {#if useDefaultHeader}
        <Header>
          <div
            data-ui-component="column-canvas"
            data-ui-part="column-header-main"
          >
            <Title>{resolvedTitle}</Title>
            <Count />
          </div>
          <Toggle />
          <Close />
        </Header>
      {/if}

      {@render children?.()}

      {#if resolvedResizable}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${resolvedTitle} column`}
          title={`Resize ${resolvedTitle}`}
          data-ui-component="column-canvas"
          data-ui-part="resize-handle"
          data-resizing={resizing ? "true" : undefined}
          onpointerdown={startHorizontalResize}
        ></div>
      {/if}
    </section>
  {/if}
{/if}
