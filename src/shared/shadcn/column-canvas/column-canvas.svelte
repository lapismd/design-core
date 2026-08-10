<script lang="ts">
  import "./column-canvas.css";
  import { onDestroy, onMount, tick, untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";
  import { setColumnCanvasContext } from "./context.svelte.js";
  import type {
    ColumnCanvasDisplayMode,
    ColumnCanvasResolvedDisplayMode,
  } from "./column-canvas-types.js";

  const DEFAULT_COMPACT_BREAKPOINT = 960;
  const COMPACT_WHEEL_SNAP_DURATION_MS = 650;
  type WheelDirection = -1 | 1;

  let {
    ref = $bindable(null),
    controller,
    displayMode = "auto",
    compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
    tabindex = 0,
    role = "region",
    "aria-label": ariaLabel = "Column canvas",
    onkeydown,
    onscroll,
    onwheel,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /**
     * App-owned controller. Do not destructure reactive fields.
     * Narrow column-id generics are accepted via structural cast at the call
     * site or by typing the const as `ColumnCanvasController`.
     */
    controller: ColumnCanvasController;
    /** Adaptive by default; `fixed` preserves the original free-scroll canvas. */
    displayMode?: ColumnCanvasDisplayMode;
    /** Root-width threshold in CSS pixels used by `displayMode="auto"`. */
    compactBreakpoint?: number;
    children?: Snippet;
  } = $props();

  const rootController = untrack(() => controller);
  let rowElement = $state<HTMLDivElement | null>(null);
  let stickyPeekProbe = $state<HTMLDivElement | null>(null);
  let rootWidth = $state<number | null>(null);
  let alignmentFrame: number | null = null;
  let stickyLayoutFrame: number | null = null;
  let stickyStateFrame: number | null = null;
  let wheelAnimationFrame: number | null = null;
  let wheelAnimationRoot: HTMLElement | null = null;
  let wheelAnimationDirection: WheelDirection | null = null;

  const resolvedCompactBreakpoint = $derived(
    Number.isFinite(compactBreakpoint) && compactBreakpoint >= 0
      ? compactBreakpoint
      : DEFAULT_COMPACT_BREAKPOINT,
  );
  const resolvedDisplayMode = $derived.by<ColumnCanvasResolvedDisplayMode>(
    () => {
      if (displayMode === "fixed") return "fixed";
      if (displayMode === "compact") return "compact";
      return rootWidth !== null && rootWidth < resolvedCompactBreakpoint
        ? "compact"
        : "wide";
    },
  );

  function visibleColumns(): HTMLElement[] {
    if (!rowElement) return [];
    return Array.from(
      rowElement.querySelectorAll<HTMLElement>(
        ":scope > [data-ui-part='column'], :scope > [data-ui-part='collapsed-column']",
      ),
    );
  }

  function contentEnd(root: HTMLElement): number {
    const padding = Number.parseFloat(getComputedStyle(root).paddingInlineEnd);
    return (
      root.getBoundingClientRect().right -
      (Number.isFinite(padding) ? padding : 0)
    );
  }

  function targetScrollLeft(root: HTMLElement, target: HTMLElement): number {
    const delta = target.getBoundingClientRect().right - contentEnd(root);
    return Math.min(
      Math.max(0, root.scrollWidth - root.clientWidth),
      Math.max(0, root.scrollLeft + delta),
    );
  }

  function finitePixels(value: string): number {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function clearStickyLayout(column: HTMLElement): void {
    column.removeAttribute("data-sticky-state");
    column.style.removeProperty("--ui-column-canvas-sticky-stack-offset");
    column.style.removeProperty(
      "--ui-column-canvas-sticky-effective-peek-width",
    );
  }

  function scheduleStickyStateUpdate(): void {
    if (stickyStateFrame !== null) cancelAnimationFrame(stickyStateFrame);
    stickyStateFrame = requestAnimationFrame(() => {
      stickyStateFrame = null;
      updateStickyStates();
    });
  }

  function syncStickyLayout(): void {
    const root = ref;
    if (!root || !rowElement) return;

    const columns = visibleColumns();
    for (const column of columns) clearStickyLayout(column);
    if (resolvedDisplayMode === "compact") return;

    const rowStyle = getComputedStyle(rowElement);
    const gap = finitePixels(rowStyle.columnGap);
    const configuredPeek = stickyPeekProbe?.getBoundingClientRect().width ?? 0;
    let stackOffset = 0;
    let withinLeadingStack = true;

    for (const column of columns) {
      const requested = column.dataset.sticky === "true";
      if (!withinLeadingStack || !requested) {
        withinLeadingStack = false;
        continue;
      }

      const width = column.getBoundingClientRect().width;
      const collapsed = column.dataset.uiPart === "collapsed-column";
      const effectivePeek = collapsed ? width : Math.min(configuredPeek, width);

      column.dataset.stickyState = "flowing";
      column.style.setProperty(
        "--ui-column-canvas-sticky-stack-offset",
        `${stackOffset}px`,
      );
      column.style.setProperty(
        "--ui-column-canvas-sticky-effective-peek-width",
        `${effectivePeek}px`,
      );
      stackOffset += effectivePeek + gap;
    }

    scheduleStickyStateUpdate();
  }

  function inlineStartPosition(root: HTMLElement, column: HTMLElement): number {
    const rootRect = root.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return getComputedStyle(root).direction === "rtl"
      ? rootRect.right - columnRect.right
      : columnRect.left - rootRect.left;
  }

  function updateStickyStates(): void {
    const root = ref;
    if (!root || resolvedDisplayMode === "compact") return;

    const rootStyle = getComputedStyle(root);
    const paddingStart = finitePixels(rootStyle.paddingInlineStart);
    const hasScrolled = Math.abs(root.scrollLeft) > 1;
    for (const column of visibleColumns()) {
      if (!column.hasAttribute("data-sticky-state")) continue;
      const stackOffset = finitePixels(
        column.style.getPropertyValue("--ui-column-canvas-sticky-stack-offset"),
      );
      const effectivePeek = finitePixels(
        column.style.getPropertyValue(
          "--ui-column-canvas-sticky-effective-peek-width",
        ),
      );
      const collapsed = column.dataset.uiPart === "collapsed-column";
      const pinnedStart =
        paddingStart +
        stackOffset +
        (collapsed ? 0 : effectivePeek - column.getBoundingClientRect().width);
      const stuck =
        hasScrolled &&
        Math.abs(inlineStartPosition(root, column) - pinnedStart) < 2;
      column.dataset.stickyState = stuck ? "stuck" : "flowing";
    }
  }

  function requestStickyLayout(): void {
    void tick().then(() => {
      if (stickyLayoutFrame !== null) cancelAnimationFrame(stickyLayoutFrame);
      stickyLayoutFrame = requestAnimationFrame(() => {
        stickyLayoutFrame = null;
        syncStickyLayout();
      });
    });
  }

  function prefersReducedMotion(): boolean {
    return (
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
      false
    );
  }

  function cancelWheelAnimation(): void {
    if (wheelAnimationFrame !== null) {
      cancelAnimationFrame(wheelAnimationFrame);
    }
    wheelAnimationRoot?.removeAttribute("data-wheel-animating");
    wheelAnimationFrame = null;
    wheelAnimationRoot = null;
    wheelAnimationDirection = null;
  }

  function compactSnapPoints(root: HTMLElement): number[] {
    return visibleColumns().map((column) => targetScrollLeft(root, column));
  }

  function adjacentSnapPoint(
    root: HTMLElement,
    direction: WheelDirection,
  ): number | undefined {
    const points = compactSnapPoints(root);
    if (direction > 0) {
      return points.find((point) => point > root.scrollLeft + 2);
    }
    for (let index = points.length - 1; index >= 0; index -= 1) {
      if (points[index] < root.scrollLeft - 2) return points[index];
    }
    return undefined;
  }

  function easeInOutCubic(progress: number): number {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  function animateWheelToSnapPoint(
    root: HTMLElement,
    target: number,
    direction: WheelDirection,
  ): void {
    cancelWheelAnimation();
    if (prefersReducedMotion()) {
      root.scrollTo({ left: target, behavior: "auto" });
      return;
    }

    const start = root.scrollLeft;
    const distance = target - start;
    const startedAt = performance.now();
    wheelAnimationRoot = root;
    wheelAnimationDirection = direction;
    root.setAttribute("data-wheel-animating", "true");

    const step = (time: number): void => {
      const progress = Math.min(
        1,
        (time - startedAt) / COMPACT_WHEEL_SNAP_DURATION_MS,
      );
      root.scrollLeft = start + distance * easeInOutCubic(progress);
      if (progress < 1) {
        wheelAnimationFrame = requestAnimationFrame(step);
        return;
      }

      root.scrollLeft = target;
      root.removeAttribute("data-wheel-animating");
      wheelAnimationFrame = null;
      wheelAnimationRoot = null;
      wheelAnimationDirection = null;
    };

    wheelAnimationFrame = requestAnimationFrame(step);
  }

  function alignActiveColumn(): void {
    const root = ref;
    if (!root) return;
    cancelWheelAnimation();
    if (resolvedDisplayMode === "fixed") return;
    const columns = visibleColumns();
    const target = columns.at(-1);
    if (!target) return;
    root.scrollTo({
      left: targetScrollLeft(root, target),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function requestAlignment(): void {
    void tick().then(() => {
      if (alignmentFrame !== null) cancelAnimationFrame(alignmentFrame);
      alignmentFrame = requestAnimationFrame(() => {
        alignmentFrame = null;
        syncStickyLayout();
        alignActiveColumn();
      });
    });
  }

  setColumnCanvasContext({
    controller: rootController,
    get displayMode() {
      return resolvedDisplayMode;
    },
    requestAlignment,
    requestStickyLayout,
  });

  $effect(() => {
    void rootController.restoreLayout();
  });

  $effect(() => {
    // Path changes alter the deepest visible column.
    rootController.path.join("\u0000");
    requestAlignment();
  });

  $effect(() => {
    // Restoration can change width, collapse, and close state in one update.
    rootController.layoutReady;
    requestAlignment();
  });

  $effect(() => {
    // Re-align once when the responsive presentation mode changes.
    resolvedDisplayMode;
    requestAlignment();
  });

  onMount(() => {
    const root = ref;
    if (!root) return;

    const measure = (): void => {
      rootWidth = root.getBoundingClientRect().width;
      requestStickyLayout();
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  });

  onDestroy(() => {
    if (alignmentFrame !== null) cancelAnimationFrame(alignmentFrame);
    if (stickyLayoutFrame !== null) cancelAnimationFrame(stickyLayoutFrame);
    if (stickyStateFrame !== null) cancelAnimationFrame(stickyStateFrame);
    cancelWheelAnimation();
  });

  function handleScroll(
    event: UIEvent & { currentTarget: EventTarget & HTMLDivElement },
  ): void {
    onscroll?.(event);
    scheduleStickyStateUpdate();
  }

  function canScrollVertically(element: HTMLElement, delta: number): boolean {
    if (element.scrollHeight <= element.clientHeight + 1) return false;
    if (delta < 0) return element.scrollTop > 1;
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  function nearestVerticalScroller(event: WheelEvent): HTMLElement | null {
    for (const target of event.composedPath()) {
      // Only descendants belong to the canvas arbitration boundary. A
      // scrollable ancestor outside the root must not mask available
      // horizontal movement.
      if (target === ref) break;
      if (!(target instanceof HTMLElement)) continue;
      const overflow = getComputedStyle(target).overflowY;
      if (
        (overflow === "auto" || overflow === "scroll") &&
        target.scrollHeight > target.clientHeight + 1
      ) {
        return target;
      }
    }
    return null;
  }

  function handleWheel(
    event: WheelEvent & { currentTarget: EventTarget & HTMLDivElement },
  ): void {
    onwheel?.(event);
    if (event.defaultPrevented || resolvedDisplayMode !== "compact") return;
    if (
      Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
      event.deltaY === 0
    ) {
      return;
    }

    const verticalScroller = nearestVerticalScroller(event);
    if (
      verticalScroller &&
      canScrollVertically(verticalScroller, event.deltaY)
    ) {
      return;
    }

    const root = ref;
    if (!root) return;
    const maxScrollLeft = Math.max(0, root.scrollWidth - root.clientWidth);
    const canMove =
      event.deltaY < 0
        ? root.scrollLeft > 1
        : root.scrollLeft < maxScrollLeft - 1;
    if (!canMove) return;

    const direction: WheelDirection = event.deltaY < 0 ? -1 : 1;
    if (wheelAnimationFrame !== null && wheelAnimationDirection === direction) {
      event.preventDefault();
      return;
    }

    const target = adjacentSnapPoint(root, direction);
    if (target === undefined) return;
    event.preventDefault();
    animateWheelToSnapPoint(root, target, direction);
  }

  function navigateSnapPoint(key: string): boolean {
    const root = ref;
    if (!root) return false;
    const points = compactSnapPoints(root);
    if (points.length === 0) return false;

    let target: number | undefined;
    if (key === "Home") target = points[0];
    if (key === "End") target = points.at(-1);
    if (key === "ArrowRight") {
      target = points.find((point) => point > root.scrollLeft + 2);
    }
    if (key === "ArrowLeft") {
      for (let index = points.length - 1; index >= 0; index -= 1) {
        if (points[index] < root.scrollLeft - 2) {
          target = points[index];
          break;
        }
      }
    }
    if (target === undefined) return false;

    cancelWheelAnimation();
    root.scrollTo({
      left: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    return true;
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement },
  ): void {
    onkeydown?.(event);
    if (
      event.defaultPrevented ||
      resolvedDisplayMode !== "compact" ||
      event.target !== event.currentTarget
    ) {
      return;
    }
    if (!navigateSnapPoint(event.key)) return;
    event.preventDefault();
  }

  const spacerStyle = $derived(
    resolvedDisplayMode === "compact"
      ? "0px"
      : `${Math.max(0, rootController.trailingSpacerWidth)}px`,
  );
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable region supports snap-point keyboard navigation) -->
<div
  bind:this={ref}
  {...restProps}
  class={className}
  {tabindex}
  {role}
  aria-label={ariaLabel}
  data-ui-component="column-canvas"
  data-ui-part="root"
  data-layout-ready={rootController.layoutReady ? "true" : "false"}
  data-display-mode={resolvedDisplayMode}
  onkeydown={handleKeydown}
  onscroll={handleScroll}
  onwheel={handleWheel}
>
  <div
    bind:this={rowElement}
    data-ui-component="column-canvas"
    data-ui-part="row"
  >
    {@render children?.()}
    <div
      bind:this={stickyPeekProbe}
      data-ui-component="column-canvas"
      data-ui-part="sticky-peek-probe"
      aria-hidden="true"
    ></div>
    <div
      data-ui-component="column-canvas"
      data-ui-part="trailing-spacer"
      aria-hidden="true"
      style:width={spacerStyle}
      style:min-width={spacerStyle}
    ></div>
  </div>
</div>
