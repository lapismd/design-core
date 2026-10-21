<script lang="ts">
  import { onDestroy, onMount, untrack } from "svelte";
  import type { Action } from "svelte/action";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { PanelToggleIcon } from "../panel-toggle/index.js";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useColumnCanvasContext } from "./context.svelte.js";
  import { setColumnCanvasColumnContext } from "./column-canvas-column-context.svelte.js";
  import Header from "./column-canvas-header.svelte";
  import Title from "./column-canvas-title.svelte";
  import Count from "./column-canvas-count.svelte";
  import Toggle from "./column-canvas-toggle.svelte";
  import Close from "./column-canvas-close.svelte";
  import type { ColumnCanvasCollapsedRailContext } from "./column-canvas-types.js";

  let {
    ref = $bindable(null),
    id,
    title,
    columnTitle,
    count,
    pathLevel: pathLevelProp,
    resizable: resizableProp,
    collapsible: collapsibleProp,
    closeable: closeableProp,
    sticky = false,
    fixed = false,
    stickyRail,
    collapsedRail,
    previewOnHover = true,
    previewDelay = 600,
    previewDismissDelay = 120,
    revealOnEdgeHover = false,
    edgeRevealLabel,
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
    /** Accessible title for custom headers and collapsed rails, without a default header. */
    columnTitle?: string;
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
    /** Pin the original expanded panel or collapsed rail. Overrides sticky; compact ignores it. */
    fixed?: boolean;
    /** Custom contents for the floating rail's return button. */
    stickyRail?: Snippet;
    /** Consumer-owned collapsed rail. The default title/count trigger remains the fallback. */
    collapsedRail?: Snippet<[ColumnCanvasCollapsedRailContext]>;
    /** Preview collapsed and floating sticky rails on mouse hover. Defaults true. */
    previewOnHover?: boolean;
    /** Hover reveal delay in milliseconds. Defaults 600. */
    previewDelay?: number;
    /** Pointer/focus handoff grace period in milliseconds. Defaults 120. */
    previewDismissDelay?: number;
    /** Preview a collapsed or closed column from its inline boundary. */
    revealOnEdgeHover?: boolean;
    /** Accessible name for the optional edge-preview control. */
    edgeRevealLabel?: string;
    /** Test/override width. Prefer controller-owned widths. */
    width?: number;
    /** Test/override resize callback. Prefer controller-owned widths. */
    onWidthChange?: (width: number) => void;
    children?: Snippet;
  } = $props();

  const canvas = useColumnCanvasContext();
  const controller = canvas.controller;

  const resolvedTitle = $derived(columnTitle ?? title ?? id);
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
  const previewed = $derived(controller.isPreviewed(id));
  let stuck = $state(false);
  const previewAvailable = $derived(
    pathVisible &&
      (collapsed || closed || stuck) &&
      canvas.displayMode !== "compact",
  );
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
  let previewRef = $state<HTMLElement | null>(null);
  let contentMounted = $state(untrack(() => visible && !collapsed));
  let suppressHoverPreview = false;
  let hoverOwned = false;
  let disposed = false;
  let previewGeometry = $state({ left: 0, top: 0, width: 0, height: 0 });

  function enterRail(event: PointerEvent): void {
    if (
      disposed ||
      event.pointerType !== "mouse" ||
      !previewOnHover ||
      !previewAvailable ||
      suppressHoverPreview
    )
      return;
    if (previewed) {
      keepPreview();
      return;
    }
    hoverOwned = true;
    controller.schedulePreview(id, previewDelay);
  }

  function leaveRail(event: PointerEvent): void {
    if (disposed) return;
    suppressHoverPreview = false;
    if (isPreviewInteractionTarget(event.relatedTarget)) {
      keepPreview();
      return;
    }
    schedulePreviewDismiss();
  }

  function pressRail(event: PointerEvent): void {
    if (disposed) return;
    if (previewRef?.contains(event.target as Node)) return;
    suppressHoverPreview = true;
    controller.dismissPreview(id);
  }

  const railInteractions: Action<HTMLElement> = (node) => {
    node.addEventListener("pointerenter", enterRail);
    node.addEventListener("pointerleave", leaveRail);
    node.addEventListener("pointerdown", pressRail);
    return {
      destroy() {
        node.removeEventListener("pointerenter", enterRail);
        node.removeEventListener("pointerleave", leaveRail);
        node.removeEventListener("pointerdown", pressRail);
      },
    };
  };

  function restorePreviewFocus(): void {
    if (disposed) return;
    if (!previewRef?.contains(previewRef.ownerDocument.activeElement)) return;
    if (!collapsed && !closed && !stuck) return;
    const rail = canvas.getPreviewRail(id) ?? ref;
    rail
      ?.querySelector<HTMLElement>(
        "button:not([data-ui-part='column-edge-trigger']), [tabindex='0']",
      )
      ?.focus({ preventScroll: true });
  }

  function dismissPreview(): void {
    if (disposed) return;
    suppressHoverPreview = true;
    restorePreviewFocus();
    controller.dismissPreview(id);
  }

  function updatePreviewGeometry(): void {
    const viewport = canvas.viewport;
    if (!ref || !viewport || !previewed) return;
    const source = ref.getBoundingClientRect();
    const anchor = (canvas.getPreviewRail(id) ?? ref).getBoundingClientRect();
    const view = viewport.getBoundingClientRect();
    const start = Math.max(0, view.left + viewport.clientLeft);
    const end = Math.min(
      window.innerWidth,
      view.left + viewport.clientLeft + viewport.clientWidth,
    );
    const expandedWidth = Math.min(width, Math.max(0, end - start));
    const rtl = getComputedStyle(viewport).direction === "rtl";
    const left = Math.max(
      start,
      Math.min(
        rtl ? anchor.right - expandedWidth : anchor.left,
        end - expandedWidth,
      ),
    );
    const top = Math.max(0, anchor.top, view.top);
    previewGeometry = {
      left: left - source.left - ref.clientLeft,
      top: top - source.top - ref.clientTop,
      width: expandedWidth,
      height: Math.max(
        0,
        Math.min(anchor.bottom, view.bottom, window.innerHeight) - top,
      ),
    };
  }

  const accessibleEdgeRevealLabel = $derived(
    edgeRevealLabel ?? `Preview ${resolvedTitle} column`,
  );

  function expandColumn(): void {
    controller.expand(id);
    canvas.requestAlignment();
  }

  function toggleColumn(): void {
    controller.toggle(id);
    canvas.requestAlignment();
  }

  function keepPreview(): void {
    if (disposed) return;
    controller.keepPreview(id);
  }

  function schedulePreviewDismiss(): void {
    if (disposed || !previewRef?.isConnected) return;
    if (
      previewRef &&
      isPreviewInteractionTarget(previewRef.ownerDocument.activeElement)
    )
      return;
    controller.schedulePreviewDismiss(id, previewDismissDelay);
  }

  function isPreviewInteractionTarget(target: EventTarget | null): boolean {
    if (disposed || !(target instanceof Node) || !previewRef?.isConnected)
      return false;
    if (previewRef.contains(target)) return true;
    if (canvas.getPreviewRail(id)?.contains(target)) return true;
    // DOM removal can emit focusout after the derived state has been released.
    // Read the rendered rail state here rather than that destroyed derivation.
    if (ref?.dataset.uiPart === "collapsed-column" && ref.contains(target))
      return true;

    const controlIds = new Set<string>();
    for (const owner of previewRef.querySelectorAll<HTMLElement>(
      "[aria-controls], [aria-owns]",
    )) {
      for (const attribute of ["aria-controls", "aria-owns"] as const) {
        for (const controlledId of owner
          .getAttribute(attribute)
          ?.split(/\s+/) ?? []) {
          if (controlledId) controlIds.add(controlledId);
        }
      }
    }

    for (const controlledId of controlIds) {
      const controlledElement =
        previewRef.ownerDocument.getElementById(controlledId);
      if (controlledElement?.contains(target)) return true;
    }

    if (!(target instanceof Element)) return false;
    const hasOpenPopupOwner = previewRef.querySelector(
      '[aria-haspopup][aria-expanded="true"], [role="combobox"][aria-expanded="true"]',
    );
    if (!hasOpenPopupOwner) return false;
    return Boolean(
      target.closest(
        '[role="dialog"], [role="grid"], [role="listbox"], [role="menu"], [role="tooltip"], [role="tree"]',
      ),
    );
  }

  function handlePreviewBlur(event: FocusEvent): void {
    if (isPreviewInteractionTarget(event.relatedTarget)) {
      keepPreview();
      return;
    }
    schedulePreviewDismiss();
  }

  function handlePreviewPointerLeave(event: MouseEvent): void {
    if (isPreviewInteractionTarget(event.relatedTarget)) {
      keepPreview();
      return;
    }
    schedulePreviewDismiss();
  }

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
      get previewOnHover() {
        return previewOnHover;
      },
      pointerEnter: enterRail,
      pointerLeave: leaveRail,
      pointerDown: pressRail,
      setStuck(value) {
        stuck = value;
        controller.setStickyPreviewAvailable(id, value);
      },
    }),
  );

  onDestroy(() => {
    disposed = true;
    controller.dismissPreview(id);
    controller.setStickyPreviewAvailable(id, false);
  });

  $effect(() => {
    if ((visible && !collapsed) || previewed) contentMounted = true;
    else if (closed) contentMounted = false;
    if (!previewAvailable) suppressHoverPreview = false;
    if (!previewAvailable || (!previewOnHover && hoverOwned)) {
      controller.dismissPreview(id);
      hoverOwned = false;
    }
  });

  $effect.pre(() => {
    if (!previewed && previewRef?.dataset.uiPart === "column-preview")
      restorePreviewFocus();
  });

  $effect(() => {
    if (!previewed || !previewRef || typeof window === "undefined") return;
    width;
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updatePreviewGeometry();
      });
    };
    updatePreviewGeometry();
    const observer = new ResizeObserver(schedule);
    if (ref) observer.observe(ref);
    if (canvas.viewport) observer.observe(canvas.viewport);
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  });

  $effect(() => {
    if (typeof document === "undefined" || !previewed || !previewRef) return;
    const ownerDocument = previewRef.ownerDocument;
    const handleDocumentPointerOver = (event: PointerEvent) => {
      if (isPreviewInteractionTarget(event.target)) keepPreview();
      else schedulePreviewDismiss();
    };
    const handleDocumentFocusIn = (event: FocusEvent) => {
      if (isPreviewInteractionTarget(event.target)) keepPreview();
      else schedulePreviewDismiss();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!isPreviewInteractionTarget(event.target)) dismissPreview();
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        // Nested popups own the first Escape and restore focus to their trigger
        // while this live content host is still in its overlay presentation.
        if (
          previewRef?.querySelector(
            '[aria-haspopup][aria-expanded="true"], [role="combobox"][aria-expanded="true"]',
          )
        )
          return;
        event.preventDefault();
        dismissPreview();
      }
    };
    ownerDocument.addEventListener("pointerdown", handlePointerDown, true);
    ownerDocument.addEventListener("keydown", handleKeydown);
    ownerDocument.addEventListener(
      "pointerover",
      handleDocumentPointerOver,
      true,
    );
    ownerDocument.addEventListener("focusin", handleDocumentFocusIn, true);
    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown, true);
      ownerDocument.removeEventListener("keydown", handleKeydown);
      ownerDocument.removeEventListener(
        "pointerover",
        handleDocumentPointerOver,
        true,
      );
      ownerDocument.removeEventListener("focusin", handleDocumentFocusIn, true);
    };
  });

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
    fixed;
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
    const gestureBehavior = canvas.activateResizePair(id);
    if (gestureBehavior.kind === "hidden") return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth =
      gestureBehavior.kind === "pair"
        ? gestureBehavior.leadingWidth
        : (ref?.getBoundingClientRect().width ?? width);
    const pairTotal =
      gestureBehavior.kind === "pair"
        ? gestureBehavior.leadingWidth + gestureBehavior.trailingWidth
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
      if (gestureBehavior.kind === "pair" && pairTotal > 0) {
        controller.setPairSplit(
          gestureBehavior.leadingColumnId,
          gestureBehavior.trailingColumnId,
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
      if (gestureBehavior.kind === "pair") canvas.finishResizePair();
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
    body.style.cursor = "col-resize";
    ownerDocument.defaultView?.addEventListener(
      "pointermove",
      handlePointerMove,
    );
    ownerDocument.defaultView?.addEventListener("pointerup", stopResize);
    ownerDocument.defaultView?.addEventListener("pointercancel", stopResize);
  }

  function resizeWithKeyboard(event: KeyboardEvent): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const keyboardBehavior = canvas.activateResizePair(id);
    if (keyboardBehavior.kind === "hidden") return;
    event.preventDefault();
    event.stopPropagation();
    const delta =
      (event.shiftKey ? 32 : 8) * (event.key === "ArrowRight" ? 1 : -1);
    if (keyboardBehavior.kind === "pair") {
      const total =
        keyboardBehavior.leadingWidth + keyboardBehavior.trailingWidth;
      if (total <= 0) return;
      controller.setPairSplit(
        keyboardBehavior.leadingColumnId,
        keyboardBehavior.trailingColumnId,
        (keyboardBehavior.leadingWidth + delta) / total,
      );
      canvas.requestStickyLayout();
      canvas.finishResizePair();
      return;
    }
    if (onWidthChange) {
      onWidthChange(constrainedWidth(width + delta));
    } else {
      controller.setWidth(id, width + delta);
    }
    canvas.requestStickyLayout();
    canvas.finishResizePair();
  }

  function resetResize(): void {
    const resetBehavior = canvas.activateResizePair(id);
    if (resetBehavior.kind === "pair") {
      controller.resetPairSplit(
        resetBehavior.leadingColumnId,
        resetBehavior.trailingColumnId,
      );
    } else {
      controller.resetWidth(id);
    }
    canvas.requestStickyLayout();
    canvas.finishResizePair();
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

{#snippet expandedContents()}
  {#if useDefaultHeader}
    <Header>
      <div data-ui-component="column-canvas" data-ui-part="column-header-main">
        <Title>{resolvedTitle}</Title>
        <Count />
      </div>
      <Toggle />
      <Close />
    </Header>
  {/if}

  {@render children?.()}
{/snippet}

{#if pathVisible && (visible || (previewAvailable && (revealOnEdgeHover || previewed)))}
  <section
    bind:this={ref}
    {...restProps}
    class={className}
    hidden={restProps.hidden === "" ||
      restProps.hidden ||
      (!visible && !(previewAvailable && (revealOnEdgeHover || previewed)))}
    data-ui-component="column-canvas"
    data-ui-part={closed
      ? "column-preview-anchor"
      : collapsed && resolvedCollapsible
        ? "collapsed-column"
        : "column"}
    data-column-id={id}
    data-column-title={resolvedTitle}
    data-resizable={resolvedResizable ? "true" : undefined}
    data-sticky={sticky ? "true" : undefined}
    data-fixed={fixed ? "true" : undefined}
    data-previewed={previewed ? "true" : undefined}
    style:--ui-column-canvas-expanded-width={`${width}px`}
    use:railInteractions
  >
    {#if revealOnEdgeHover && previewAvailable}
      <button
        type="button"
        data-ui-component="column-canvas"
        data-ui-part="column-edge-trigger"
        data-state={controller.getState(id)}
        aria-label={accessibleEdgeRevealLabel}
        aria-expanded={previewed}
        title={accessibleEdgeRevealLabel}
        onmouseenter={() => controller.preview(id)}
        onmouseleave={schedulePreviewDismiss}
        onfocus={() => controller.preview(id)}
        onblur={handlePreviewBlur}
        onclick={toggleColumn}
      ></button>
    {/if}
    {#if collapsed && resolvedCollapsible}
      {#if collapsedRail}
        {@render collapsedRail({
          id,
          title: resolvedTitle,
          count,
          expand: expandColumn,
        })}
      {:else}
        <button
          type="button"
          data-ui-component="column-canvas"
          data-ui-part="collapsed-trigger"
          data-panel-toggle
          aria-label={`Expand ${resolvedTitle} column${count === undefined ? "" : `: ${resolvedTitle} ${count}`}`}
          aria-expanded={previewed}
          title={count === undefined
            ? resolvedTitle
            : `${resolvedTitle} (${count})`}
          onclick={expandColumn}
        >
          <PanelToggleIcon expanded={false} />
          <span
            data-ui-component="column-canvas"
            data-ui-part="collapsed-label"
          >
            <span>{resolvedTitle}</span>
            {#if count !== undefined}<span
                data-ui-component="column-canvas"
                data-ui-part="collapsed-count">{count}</span
              >{/if}
          </span>
        </button>
      {/if}
    {/if}
    {#if contentMounted}
      <div
        bind:this={previewRef}
        role={previewed ? "complementary" : undefined}
        aria-label={previewed ? `${resolvedTitle} column preview` : undefined}
        hidden={(collapsed || closed) && !previewed}
        inert={(collapsed || closed) && !previewed}
        data-ui-component="column-canvas"
        data-ui-part={previewed ? "column-preview" : "column-content"}
        data-column-id={previewed ? id : undefined}
        data-column-title={previewed ? resolvedTitle : undefined}
        data-state={controller.getState(id)}
        data-presentation={previewed ? "overlay" : undefined}
        style:left={previewed ? `${previewGeometry.left}px` : undefined}
        style:top={previewed ? `${previewGeometry.top}px` : undefined}
        style:width={previewed ? `${previewGeometry.width}px` : undefined}
        style:height={previewed ? `${previewGeometry.height}px` : undefined}
        onmouseenter={keepPreview}
        onmouseleave={handlePreviewPointerLeave}
        onfocusin={keepPreview}
        onfocusout={handlePreviewBlur}
      >
        {@render expandedContents()}
      </div>
    {/if}
    {#if !collapsed && !closed && resolvedResizable && resizeBehavior.kind !== "hidden"}
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
          resizeBehavior.kind === "pair" ? resizeBehavior.leadingWidth : width,
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
