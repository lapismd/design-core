<script lang="ts">
  import { onMount } from "svelte";
  import type { Action } from "svelte/action";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useColumnCanvasContext } from "./context.svelte.js";
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
    pathLevel: pathLevelProp,
    resizable: resizableProp,
    collapsible: collapsibleProp,
    closeable: closeableProp,
    sticky = false,
    stickyRail,
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
     * Minimum path length required before this column is path-visible.
     * Defaults to the column config on the controller (`0` when omitted).
     */
    pathLevel?: number;
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
    /**
     * Replaces this column with a floating collapsed rail after it crosses the
     * canvas start edge in wide and fixed layouts. Consecutive leading sticky
     * columns form a stack. Compact presentation ignores this prop.
     */
    sticky?: boolean;
    /** Custom contents for the floating rail's return button. */
    stickyRail?: Snippet;
    /** Test/override width. Prefer controller-owned widths. */
    width?: number;
    /** Test/override resize callback. Prefer controller-owned widths. */
    onWidthChange?: (width: number) => void;
    children?: Snippet;
  } = $props();

  const canvas = useColumnCanvasContext();
  const controller = canvas.controller;

  const resolvedTitle = $derived(title ?? id);
  const resolvedPathLevel = $derived(
    pathLevelProp ?? controller.getPathLevel(id),
  );
  const resolvedResizable = $derived(
    resizableProp ?? controller.isResizable(id),
  );
  const resolvedCollapsible = $derived(
    collapsibleProp ?? controller.isCollapsible(id),
  );
  const resolvedCloseable = $derived(
    closeableProp ?? controller.isCloseable(id),
  );
  const pathVisible = $derived(controller.path.length >= resolvedPathLevel);
  const closed = $derived(controller.isClosed(id));
  const visible = $derived(pathVisible && !closed);
  const collapsed = $derived(controller.isCollapsed(id));
  const width = $derived(widthOverride ?? controller.getWidth(id));
  const minWidth = $derived(controller.getMinWidth(id));
  const maxWidth = $derived(controller.getMaxWidth(id));
  const useDefaultHeader = $derived(title !== undefined);
  const resizeBehavior = $derived.by(() =>
    resolvedResizable
      ? canvas.getResizeBehavior(id)
      : ({ kind: "hidden" } as const),
  );
  const resizeMinimum = $derived.by(() => {
    if (resizeBehavior.kind !== "pair") return minWidth;
    const trailingMaximum = controller.getMaxWidth(
      resizeBehavior.trailingColumnId,
    );
    return Math.max(
      minWidth,
      trailingMaximum === null
        ? minWidth
        : resizeBehavior.leadingWidth +
            resizeBehavior.trailingWidth -
            trailingMaximum,
    );
  });
  const resizeMaximum = $derived.by(() => {
    if (resizeBehavior.kind !== "pair") {
      return maxWidth ?? Number.MAX_SAFE_INTEGER;
    }
    return Math.max(
      resizeMinimum,
      Math.min(
        maxWidth ?? Number.MAX_SAFE_INTEGER,
        resizeBehavior.leadingWidth +
          resizeBehavior.trailingWidth -
          controller.getMinWidth(resizeBehavior.trailingColumnId),
      ),
    );
  });

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

  function constrainedWidth(requestedWidth: number): number {
    return Math.max(
      minWidth,
      maxWidth === null ? requestedWidth : Math.min(maxWidth, requestedWidth),
    );
  }

  onMount(() =>
    canvas.registerStickyColumn({
      get id() {
        return id;
      },
      get title() {
        return resolvedTitle;
      },
      get rail() {
        return stickyRail;
      },
    }),
  );

  $effect(() => {
    // Structural column changes are the only child-side alignment trigger.
    visible;
    collapsed;
    canvas.requestAlignment();
  });

  $effect(() => {
    // Floating-rail geometry is transient presentation state and must not
    // trigger active-column alignment.
    sticky;
    stickyRail;
    width;
    canvas.requestStickyLayout();
  });

  function startHorizontalResize(event: PointerEvent): void {
    if (
      !resolvedResizable ||
      resizeBehavior.kind === "hidden" ||
      !event.isPrimary ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth =
      resizeBehavior.kind === "pair"
        ? resizeBehavior.leadingWidth
        : (ref?.getBoundingClientRect().width ?? width);
    const pairTotal =
      resizeBehavior.kind === "pair"
        ? resizeBehavior.leadingWidth + resizeBehavior.trailingWidth
        : 0;
    const ownerDocument =
      event.currentTarget instanceof Element
        ? event.currentTarget.ownerDocument
        : document;
    const body = ownerDocument.body;
    const previousUserSelect = body.style.userSelect;
    const previousCursor = body.style.cursor;
    resizing = true;

    function handlePointerMove(pointerEvent: PointerEvent): void {
      const requestedWidth = Math.round(
        startWidth + pointerEvent.clientX - startX,
      );
      if (resizeBehavior.kind === "pair" && pairTotal > 0) {
        controller.setPairSplit(
          resizeBehavior.leadingColumnId,
          resizeBehavior.trailingColumnId,
          requestedWidth / pairTotal,
        );
        canvas.requestStickyLayout();
        return;
      }
      const next = constrainedWidth(requestedWidth);
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

  function resizeWithKeyboard(event: KeyboardEvent): void {
    if (resizeBehavior.kind === "hidden") return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const delta =
      (event.shiftKey ? 32 : 8) * (event.key === "ArrowRight" ? 1 : -1);
    if (resizeBehavior.kind === "pair") {
      const total = resizeBehavior.leadingWidth + resizeBehavior.trailingWidth;
      if (total <= 0) return;
      controller.setPairSplit(
        resizeBehavior.leadingColumnId,
        resizeBehavior.trailingColumnId,
        (resizeBehavior.leadingWidth + delta) / total,
      );
      canvas.requestStickyLayout();
      return;
    }
    if (onWidthChange) {
      onWidthChange(constrainedWidth(width + delta));
    } else {
      controller.setWidth(id, width + delta);
    }
    canvas.requestStickyLayout();
  }

  function resetResize(): void {
    if (resizeBehavior.kind === "pair") {
      controller.resetPairSplit(
        resizeBehavior.leadingColumnId,
        resizeBehavior.trailingColumnId,
      );
    } else {
      controller.resetWidth(id);
    }
    canvas.requestStickyLayout();
  }

  const resizeHandleInteractions: Action<HTMLElement> = (node) => {
    node.addEventListener("pointerdown", startHorizontalResize);
    node.addEventListener("keydown", resizeWithKeyboard);
    node.addEventListener("dblclick", resetResize);
    return {
      destroy() {
        node.removeEventListener("pointerdown", startHorizontalResize);
        node.removeEventListener("keydown", resizeWithKeyboard);
        node.removeEventListener("dblclick", resetResize);
      },
    };
  };
</script>

{#if visible}
  {#if collapsed && resolvedCollapsible}
    <section
      bind:this={ref}
      {...restProps}
      class={className}
      data-ui-component="column-canvas"
      data-ui-part="collapsed-column"
      data-column-id={id}
      data-column-title={resolvedTitle}
      data-sticky={sticky ? "true" : undefined}
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
        <ChevronRight size={14} aria-hidden="true" />
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
      data-column-title={resolvedTitle}
      data-resizable={resolvedResizable ? "true" : undefined}
      data-sticky={sticky ? "true" : undefined}
      style:--ui-column-canvas-expanded-width={`${width}px`}
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

      {#if resolvedResizable && resizeBehavior.kind !== "hidden"}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          aria-label={resizeBehavior.kind === "pair"
            ? `Resize ${resolvedTitle} and ${resizeBehavior.trailingTitle} columns`
            : `Resize ${resolvedTitle} column`}
          aria-valuemin={Math.round(resizeMinimum)}
          aria-valuemax={Math.round(resizeMaximum)}
          aria-valuenow={Math.round(
            resizeBehavior.kind === "pair"
              ? resizeBehavior.leadingWidth
              : width,
          )}
          title={resizeBehavior.kind === "pair"
            ? `Resize ${resolvedTitle} and ${resizeBehavior.trailingTitle}`
            : `Resize ${resolvedTitle}`}
          data-ui-component="column-canvas"
          data-ui-part="resize-handle"
          data-resize-mode={resizeBehavior.kind}
          data-resizing={resizing ? "true" : undefined}
          use:resizeHandleInteractions
        ></div>
      {/if}
    </section>
  {/if}
{/if}
