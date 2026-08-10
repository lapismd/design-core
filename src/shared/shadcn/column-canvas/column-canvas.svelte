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
  const COMPACT_WHEEL_SCROLL_FACTOR = 0.75;

  let {
    ref = $bindable(null),
    controller,
    displayMode = "auto",
    compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
    tabindex = 0,
    role = "region",
    "aria-label": ariaLabel = "Column canvas",
    onkeydown,
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
  let rootWidth = $state<number | null>(null);
  let alignmentFrame: number | null = null;

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

  function prefersReducedMotion(): boolean {
    return (
      globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
      false
    );
  }

  function alignActiveColumn(): void {
    const root = ref;
    if (!root || resolvedDisplayMode === "fixed") return;
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
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  });

  onDestroy(() => {
    if (alignmentFrame !== null) cancelAnimationFrame(alignmentFrame);
  });

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

    event.preventDefault();
    root.scrollBy({
      left: event.deltaY * COMPACT_WHEEL_SCROLL_FACTOR,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function navigateSnapPoint(key: string): boolean {
    const root = ref;
    if (!root) return false;
    const points = visibleColumns().map((column) =>
      targetScrollLeft(root, column),
    );
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
      ? "var(--ui-column-canvas-padding, 0.75rem)"
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
  onwheel={handleWheel}
>
  <div
    bind:this={rowElement}
    data-ui-component="column-canvas"
    data-ui-part="row"
  >
    {@render children?.()}
    <div
      data-ui-component="column-canvas"
      data-ui-part="trailing-spacer"
      aria-hidden="true"
      style:width={spacerStyle}
      style:min-width={spacerStyle}
    ></div>
  </div>
</div>
