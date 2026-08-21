<script lang="ts">
  import "./column-canvas.css";
  import { onDestroy, onMount, tick, untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { Button } from "../button/index.js";
  import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";
  import {
    allocateColumnCanvasPair,
    allocateColumnCanvasWidth,
  } from "./column-canvas-layout.js";
  import {
    setColumnCanvasContext,
    type ColumnCanvasResizeBehavior,
    type ColumnCanvasStickyColumnRegistration,
  } from "./context.svelte.js";
  import type {
    ColumnCanvasDisplayMode,
    ColumnCanvasResolvedDisplayMode,
  } from "./column-canvas-types.js";

  const DEFAULT_COMPACT_BREAKPOINT = 960;
  const COMPACT_WHEEL_SNAP_DURATION_MS = 650;
  const STICKY_WHEEL_DELTA_SCALE = 0.5;
  type WheelDirection = -1 | 1;
  type ResolvedStickyColumn = {
    id: string;
    registration: ColumnCanvasStickyColumnRegistration;
    element: HTMLElement;
    width: number;
    offset: number;
  };

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
  let wideContextWidthProbe = $state<HTMLDivElement | null>(null);
  let stickyWidthProbe = $state<HTMLDivElement | null>(null);
  let rootWidth = $state<number | null>(null);
  let stickyLayerHeight = $state(0);
  let stickyLayerInlineOffset = $state(0);
  let stickyLayerBlockOffset = $state(0);
  let stickyRegistrations = $state.raw<ColumnCanvasStickyColumnRegistration[]>(
    [],
  );
  let activeStickyColumns = $state.raw<ResolvedStickyColumn[]>([]);
  let stuckStickyColumns = $state.raw<ResolvedStickyColumn[]>([]);
  let alignmentFrame: number | null = null;
  let stickyLayoutFrame: number | null = null;
  let stickyStateFrame: number | null = null;
  let wheelAnimationFrame: number | null = null;
  let wheelAnimationRoot: HTMLElement | null = null;
  let wheelAnimationDirection: WheelDirection | null = null;
  let stickyWheelRoutingTimer: ReturnType<typeof setTimeout> | null = null;
  let activePairLeadingId = $state<string | null>(null);
  let activePairResize = $state.raw<
    Extract<ColumnCanvasResizeBehavior, { kind: "pair" }> | undefined
  >(undefined);

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

  function outerInlineSpacing(element: HTMLElement): number {
    const style = getComputedStyle(element);
    return (
      finitePixels(style.marginInlineStart) +
      finitePixels(style.marginInlineEnd)
    );
  }

  function clearStickyLayout(column: HTMLElement): void {
    column.removeAttribute("data-sticky-state");
  }

  function clearResponsiveStageLayout(column: HTMLElement): void {
    column.removeAttribute("data-responsive-stage");
    column.removeAttribute("data-responsive-stage-position");
    column.removeAttribute("data-responsive-context");
    column.style.removeProperty("--ui-column-canvas-wide-stage-width");
  }

  function columnId(column: HTMLElement): string | undefined {
    const id = column.dataset.columnId;
    return id && rootController.hasColumn(id) ? id : undefined;
  }

  function deepestPairLeadingId(columns: HTMLElement[]): string | null {
    const pair = columns
      .filter((column) => column.dataset.uiPart === "column")
      .slice(-2);
    return pair.length === 2 ? (columnId(pair[0]) ?? null) : null;
  }

  function activePair(columns: HTMLElement[]): HTMLElement[] {
    const expanded = columns.filter(
      (column) => column.dataset.uiPart === "column",
    );
    if (expanded.length <= 2) return expanded;
    const activeIndex = activePairLeadingId
      ? expanded.findIndex((column) => columnId(column) === activePairLeadingId)
      : -1;
    const leadingIndex =
      activeIndex >= 0 && activeIndex < expanded.length - 1
        ? activeIndex
        : expanded.length - 2;
    return expanded.slice(leadingIndex, leadingIndex + 2);
  }

  function widthBounds(id: string) {
    return {
      preferredWidth: rootController.getWidth(id),
      minWidth: rootController.getMinWidth(id),
      maxWidth: rootController.getMaxWidth(id),
    };
  }

  function syncResponsiveStageLayout(
    root: HTMLElement,
    row: HTMLElement,
    rootStyle: CSSStyleDeclaration,
    columns: HTMLElement[],
  ): void {
    for (const column of columns) clearResponsiveStageLayout(column);
    activePairResize = undefined;
    if (resolvedDisplayMode !== "wide" || columns.length === 0) return;

    const pair = activePair(columns);
    if (pair.length === 0) return;
    const pairStartIndex = columns.indexOf(pair[0]);
    const context = columns
      .slice(0, pairStartIndex)
      .filter((column) => column.dataset.uiPart === "column")
      .at(-1);
    for (const [index, column] of pair.entries()) {
      column.dataset.responsiveStage = "pair";
      column.dataset.responsiveStagePosition =
        index === 0 ? "leading" : "trailing";
    }
    if (context) context.dataset.responsiveContext = "true";

    const contentWidth = Math.max(
      0,
      root.clientWidth -
        finitePixels(rootStyle.paddingInlineStart) -
        finitePixels(rootStyle.paddingInlineEnd),
    );
    const gap = finitePixels(getComputedStyle(row).columnGap);
    const configuredContextWidth =
      wideContextWidthProbe?.getBoundingClientRect().width ?? 0;
    const contextWidth = context
      ? Math.min(configuredContextWidth, context.getBoundingClientRect().width)
      : 0;
    const stageStartIndex = context ? columns.indexOf(context) : 0;
    const stageColumns = columns.slice(stageStartIndex);
    const collapsedStageColumns = stageColumns.filter(
      (column) => column.dataset.uiPart === "collapsed-column",
    );
    const collapsedStageWidth = collapsedStageColumns.reduce(
      (total, column) =>
        total +
        column.getBoundingClientRect().width +
        outerInlineSpacing(column),
      0,
    );
    const pairOuterInlineSpacing = pair.reduce(
      (total, column) => total + outerInlineSpacing(column),
      0,
    );
    const contextOuterInlineSpacing = context ? outerInlineSpacing(context) : 0;
    const gapCount = Math.max(0, stageColumns.length - 1);
    const availableExpandedWidth = Math.max(
      0,
      contentWidth -
        contextWidth -
        contextOuterInlineSpacing -
        pairOuterInlineSpacing -
        collapsedStageWidth -
        gap * gapCount,
    );
    if (pair.length === 1) {
      const expanded = pair[0];
      const id = columnId(expanded);
      if (!id) return;
      expanded.style.setProperty(
        "--ui-column-canvas-wide-stage-width",
        `${allocateColumnCanvasWidth(availableExpandedWidth, widthBounds(id))}px`,
      );
      return;
    }

    const leadingId = columnId(pair[0]);
    const trailingId = columnId(pair[1]);
    if (!leadingId || !trailingId) return;
    const allocation = allocateColumnCanvasPair(
      availableExpandedWidth,
      widthBounds(leadingId),
      widthBounds(trailingId),
      rootController.getPairSplit(leadingId, trailingId),
    );
    pair[0].style.setProperty(
      "--ui-column-canvas-wide-stage-width",
      `${allocation.leadingWidth}px`,
    );
    pair[1].style.setProperty(
      "--ui-column-canvas-wide-stage-width",
      `${allocation.trailingWidth}px`,
    );
    if (
      rootController.isResizable(leadingId) &&
      rootController.isResizable(trailingId)
    ) {
      activePairResize = {
        kind: "pair",
        leadingColumnId: leadingId,
        trailingColumnId: trailingId,
        trailingTitle: pair[1].dataset.columnTitle ?? trailingId,
        leadingWidth: allocation.leadingWidth,
        trailingWidth: allocation.trailingWidth,
      };
    }
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
    activeStickyColumns = [];
    stuckStickyColumns = [];
    const rootStyle = getComputedStyle(root);
    syncResponsiveStageLayout(root, rowElement, rootStyle, columns);
    stickyLayerHeight = root.clientHeight;
    stickyLayerInlineOffset = finitePixels(rootStyle.paddingInlineStart);
    stickyLayerBlockOffset = finitePixels(rootStyle.paddingBlockStart);
    if (resolvedDisplayMode === "compact") return;

    const registrations = new Map(
      stickyRegistrations.map((registration) => [
        registration.id,
        registration,
      ]),
    );
    const configuredWidth =
      stickyWidthProbe?.getBoundingClientRect().width ?? 0;
    const active: ResolvedStickyColumn[] = [];
    let stackOffset = 0;
    let withinLeadingStack = true;

    for (const column of columns) {
      const requested = column.dataset.sticky === "true";
      if (!withinLeadingStack || !requested) {
        withinLeadingStack = false;
        continue;
      }

      const id = column.dataset.columnId;
      const registration = id ? registrations.get(id) : undefined;
      if (!id || !registration) {
        withinLeadingStack = false;
        continue;
      }

      const width = column.getBoundingClientRect().width;
      const collapsed = column.dataset.uiPart === "collapsed-column";
      const railWidth = collapsed ? width : Math.min(configuredWidth, width);

      column.dataset.stickyState = "flowing";
      active.push({
        id,
        registration,
        element: column,
        width: railWidth,
        offset: stackOffset,
      });
      stackOffset += railWidth;
    }

    activeStickyColumns = active;
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
    if (!root || resolvedDisplayMode === "compact") {
      stuckStickyColumns = [];
      return;
    }

    const hasScrolled = Math.abs(root.scrollLeft) > 1;
    const stuckColumns: ResolvedStickyColumn[] = [];
    for (const column of activeStickyColumns) {
      const activationEdge =
        stickyLayerInlineOffset + column.offset + column.width;
      const isStuck =
        hasScrolled &&
        inlineEndPosition(root, column.element) <= activationEdge + 1;
      column.element.dataset.stickyState = isStuck ? "stuck" : "flowing";
      if (isStuck) stuckColumns.push(column);
    }
    stuckStickyColumns = stuckColumns;
  }

  function inlineEndPosition(root: HTMLElement, column: HTMLElement): number {
    const rootRect = root.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return getComputedStyle(root).direction === "rtl"
      ? rootRect.right - columnRect.left
      : columnRect.right - rootRect.left;
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

  function registerStickyColumn(
    registration: ColumnCanvasStickyColumnRegistration,
  ): () => void {
    stickyRegistrations = [
      ...stickyRegistrations.filter((entry) => entry.id !== registration.id),
      registration,
    ];
    requestStickyLayout();
    return () => {
      stickyRegistrations = stickyRegistrations.filter(
        (entry) => entry !== registration,
      );
      requestStickyLayout();
    };
  }

  function returnToStickyColumn(column: ResolvedStickyColumn): void {
    const root = ref;
    if (!root) return;
    const rootStyle = getComputedStyle(root);
    const paddingStart = finitePixels(rootStyle.paddingInlineStart);
    const currentStart = inlineStartPosition(root, column.element);
    const desiredStart = paddingStart + column.offset;
    const delta = currentStart - desiredStart;
    const nextScrollLeft =
      rootStyle.direction === "rtl"
        ? root.scrollLeft - delta
        : root.scrollLeft + delta;
    root.scrollTo({
      left: nextScrollLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
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

  function stopStickyWheelRouting(): void {
    if (stickyWheelRoutingTimer !== null) {
      clearTimeout(stickyWheelRoutingTimer);
      stickyWheelRoutingTimer = null;
    }
    ref?.removeAttribute("data-wheel-routing");
  }

  function startStickyWheelRouting(
    root: HTMLElement,
    direction: WheelDirection,
  ): void {
    if (stickyWheelRoutingTimer !== null) {
      clearTimeout(stickyWheelRoutingTimer);
    }
    root.setAttribute("data-wheel-routing", "true");
    stickyWheelRoutingTimer = setTimeout(() => {
      stickyWheelRoutingTimer = null;
      root.removeAttribute("data-wheel-routing");
      const target =
        adjacentSnapPoint(root, direction) ??
        (direction > 0 ? Math.max(0, root.scrollWidth - root.clientWidth) : 0);
      if (Math.abs(target - root.scrollLeft) <= 2) return;
      animateWheelToSnapPoint(root, target, direction);
    }, 240);
  }

  function columnSnapPoints(root: HTMLElement): number[] {
    return visibleColumns().map((column) => targetScrollLeft(root, column));
  }

  function adjacentSnapPoint(
    root: HTMLElement,
    direction: WheelDirection,
  ): number | undefined {
    const points = columnSnapPoints(root);
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
        const columns = visibleColumns();
        activePairLeadingId = deepestPairLeadingId(columns);
        syncStickyLayout();
        alignActiveColumn();
      });
    });
  }

  function getResizeBehavior(columnId: string): ColumnCanvasResizeBehavior {
    if (resolvedDisplayMode === "compact") return { kind: "hidden" };
    if (resolvedDisplayMode !== "wide" || !activePairResize) {
      return { kind: "column" };
    }
    if (columnId === activePairResize.leadingColumnId) return activePairResize;
    if (columnId === activePairResize.trailingColumnId) {
      return { kind: "hidden" };
    }
    return { kind: "column" };
  }

  setColumnCanvasContext({
    controller: rootController,
    get displayMode() {
      return resolvedDisplayMode;
    },
    requestAlignment,
    requestStickyLayout,
    getResizeBehavior,
    registerStickyColumn,
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
    // Pair ratios are controller-owned durable state and may be changed by a
    // consumer without a pointer event from this mounted canvas.
    rootController
      .getLayout()
      .pairSplits.map(
        (split) =>
          `${split.leadingColumnId}\u0000${split.trailingColumnId}\u0000${split.leadingFraction}`,
      )
      .join("\u0001");
    requestStickyLayout();
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
    stopStickyWheelRouting();
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
    const routesUnusedVerticalWheel =
      resolvedDisplayMode === "compact" || activeStickyColumns.length > 0;
    if (event.defaultPrevented || !routesUnusedVerticalWheel) return;
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

    if (resolvedDisplayMode !== "compact") {
      event.preventDefault();
      cancelWheelAnimation();
      if (resolvedDisplayMode === "wide") {
        const direction: WheelDirection = event.deltaY < 0 ? -1 : 1;
        startStickyWheelRouting(root, direction);
      }
      root.scrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, root.scrollLeft + event.deltaY * STICKY_WHEEL_DELTA_SCALE),
      );
      return;
    }

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
    const points = columnSnapPoints(root);
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

  const trailingSpacerWidth = $derived(
    resolvedDisplayMode === "compact"
      ? 0
      : Math.max(0, rootController.trailingSpacerWidth),
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
    data-ui-component="column-canvas"
    data-ui-part="sticky-layer"
    style:--ui-column-canvas-sticky-layer-height={`${stickyLayerHeight}px`}
    style:--ui-column-canvas-sticky-layer-inline-offset={`${stickyLayerInlineOffset}px`}
    style:--ui-column-canvas-sticky-layer-block-offset={`${stickyLayerBlockOffset}px`}
  >
    {#if stuckStickyColumns.length > 0}
      <div
        role="navigation"
        data-ui-component="column-canvas"
        data-ui-part="sticky-stack"
        aria-label="Previous columns"
      >
        {#each stuckStickyColumns as column (column.id)}
          <div
            data-ui-component="column-canvas"
            data-ui-part="sticky-rail"
            data-sticky-for={column.id}
            data-sticky-state="stuck"
            style:--ui-column-canvas-sticky-rail-width={`${column.width}px`}
          >
            <Button
              variant="outline"
              size="icon-sm"
              data-ui-part="sticky-return"
              aria-label={`Return to ${column.registration.title} column`}
              title={`Return to ${column.registration.title}`}
              onclick={() => returnToStickyColumn(column)}
            >
              {#if column.registration.rail}
                {@render column.registration.rail()}
              {:else}
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              {/if}
            </Button>
            <span
              data-ui-component="column-canvas"
              data-ui-part="sticky-rail-label"
            >
              {column.registration.title}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div
    bind:this={rowElement}
    data-ui-component="column-canvas"
    data-ui-part="row"
  >
    {@render children?.()}
    <div
      bind:this={wideContextWidthProbe}
      data-ui-component="column-canvas"
      data-ui-part="wide-context-width-probe"
      aria-hidden="true"
    ></div>
    <div
      bind:this={stickyWidthProbe}
      data-ui-component="column-canvas"
      data-ui-part="sticky-width-probe"
      aria-hidden="true"
    ></div>
    {#if trailingSpacerWidth > 0}
      <div
        data-ui-component="column-canvas"
        data-ui-part="trailing-spacer"
        aria-hidden="true"
        style:width={`${trailingSpacerWidth}px`}
        style:min-width={`${trailingSpacerWidth}px`}
      ></div>
    {/if}
  </div>
</div>
