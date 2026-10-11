<script lang="ts">
  import "./column-canvas.css";
  import { onDestroy, tick, untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { Action } from "svelte/action";
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
    resolveColumnCanvasPinning,
    type PinningLayout,
  } from "./column-canvas-pinning.js";
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
    scrollViewport = null,
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
    trailingSpacer,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /**
     * App-owned controller. Do not destructure reactive fields.
     * Narrow column-id generics are accepted via structural cast at the call
     * site or by typing the const as `ColumnCanvasController`.
     */
    controller: ColumnCanvasController;
    /** Fixed canvases may use an enclosing Scroll Area's bound viewport. */
    scrollViewport?: HTMLElement | null;
    /** Adaptive by default; `fixed` preserves the original free-scroll canvas. */
    displayMode?: ColumnCanvasDisplayMode;
    /** Root-width threshold in CSS pixels used by `displayMode="auto"`. */
    compactBreakpoint?: number;
    children?: Snippet;
    /** Optional accessible content within the existing wide/fixed trailing spacer. */
    trailingSpacer?: Snippet;
  } = $props();

  const scrollingRoot = $derived(scrollViewport ?? ref);
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
  let activeFixedColumns = $state.raw<
    { element: HTMLElement; offset: number }[]
  >([]);
  let fixedPrefixLength = $state(0);
  let disposed = false;
  let alignmentFrame: number | null = null;
  let alignmentShouldActivateDeepest = false;
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
  let pairResizeScrollLeft: number | null = null;

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

  function scrollingColumns(): HTMLElement[] {
    return visibleColumns().slice(fixedPrefixLength);
  }

  function contentEnd(root: HTMLElement): number {
    const padding = Number.parseFloat(getComputedStyle(root).paddingInlineEnd);
    return (
      root.getBoundingClientRect().right -
      (Number.isFinite(padding) ? padding : 0)
    );
  }

  function targetScrollLeft(root: HTMLElement, target: HTMLElement): number {
    if (getComputedStyle(root).direction === "rtl") {
      const end =
        root.getBoundingClientRect().left +
        finitePixels(getComputedStyle(root).paddingInlineEnd);
      return Math.min(
        0,
        root.scrollLeft + target.getBoundingClientRect().left - end,
      );
    }
    const delta = target.getBoundingClientRect().right - contentEnd(root);
    return Math.max(0, root.scrollLeft + delta);
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
    reservedWidth = 0,
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
        reservedWidth -
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
    if (disposed) return;
    if (stickyStateFrame !== null) cancelAnimationFrame(stickyStateFrame);
    stickyStateFrame = requestAnimationFrame(() => {
      stickyStateFrame = null;
      if (!disposed) updateStickyStates();
    });
  }

  function syncStickyLayout(): void {
    if (disposed) return;
    const root = scrollingRoot;
    if (!root || !rowElement) return;
    const previousScrollLeft = root.scrollLeft;

    const columns = visibleColumns();
    for (const column of columns) {
      clearStickyLayout(column);
      clearResponsiveStageLayout(column);
    }
    for (const column of rowElement.querySelectorAll<HTMLElement>(
      ":scope > [data-fixed-active]",
    )) {
      column.removeAttribute("data-fixed-active");
      column.removeAttribute("data-fixed-state");
      column.style.removeProperty("--ui-column-canvas-fixed-offset");
    }
    activeStickyColumns = [];
    stuckStickyColumns = [];
    const rootStyle = getComputedStyle(ref ?? root);
    const gap = finitePixels(getComputedStyle(rowElement).columnGap);
    const pinning = measurePinning(columns, root, rootStyle, gap);
    activeFixedColumns = pinning.slots
      .filter((slot) => slot.kind === "fixed")
      .map((slot) => ({
        element: columns.find((column) => column.dataset.columnId === slot.id)!,
        offset: slot.offset,
      }));
    fixedPrefixLength = activeFixedColumns.length ? pinning.prefixLength : 0;
    syncResponsiveStageLayout(
      root,
      rowElement,
      rootStyle,
      columns.slice(fixedPrefixLength),
      fixedPrefixLength
        ? pinning.extent + (columns.length > fixedPrefixLength ? gap : 0)
        : 0,
    );
    for (const { element, offset } of activeFixedColumns) {
      // Native sticky positions in the internal root include its padding;
      // external Scroll Area viewports have no canvas padding of their own.
      const inset =
        offset -
        (scrollViewport ? 0 : finitePixels(rootStyle.paddingInlineStart));
      element.dataset.fixedActive = "true";
      element.style.setProperty(
        "--ui-column-canvas-fixed-offset",
        `${inset}px`,
      );
      const anchor = Array.from(
        rowElement.querySelectorAll<HTMLElement>(
          ":scope > [data-ui-part='column-preview-anchor']",
        ),
      ).find((anchor) => anchor.dataset.columnId === element.dataset.columnId);
      if (anchor) {
        anchor.dataset.fixedActive = "true";
        anchor.style.setProperty(
          "--ui-column-canvas-fixed-offset",
          `${inset}px`,
        );
      }
    }
    stickyLayerHeight = root.clientHeight;
    stickyLayerInlineOffset = scrollViewport
      ? 0
      : finitePixels(rootStyle.paddingInlineStart);
    stickyLayerBlockOffset = finitePixels(rootStyle.paddingBlockStart);
    if (resolvedDisplayMode === "compact") {
      for (const registration of stickyRegistrations)
        registration.setStuck(false);
      return;
    }

    const registrations = new Map(
      stickyRegistrations.map((registration) => [
        registration.id,
        registration,
      ]),
    );
    const configuredWidth =
      stickyWidthProbe?.getBoundingClientRect().width ?? 0;
    const active: ResolvedStickyColumn[] = [];
    for (const slot of pinning.slots) {
      if (slot.kind === "fixed") continue;
      const column = columns.find(
        (column) => column.dataset.columnId === slot.id,
      )!;
      const id = slot.id;
      const registration = id ? registrations.get(id) : undefined;
      if (!registration) break;

      const width = column.getBoundingClientRect().width;
      const collapsed = column.dataset.uiPart === "collapsed-column";
      const railWidth = collapsed ? width : Math.min(configuredWidth, width);

      column.dataset.stickyState = "flowing";
      active.push({
        id,
        registration,
        element: column,
        width: railWidth,
        offset: slot.offset,
      });
    }

    activeStickyColumns = active;
    // Measuring natural widths can briefly shrink the scrollable extent and
    // clamp the viewport. Restore its position after the responsive allocation.
    if (pairResizeScrollLeft !== null) {
      root.scrollLeft = pairResizeScrollLeft;
    } else if (resolvedDisplayMode === "wide") {
      root.scrollLeft = previousScrollLeft;
    }
    scheduleStickyStateUpdate();
  }

  function measurePinning(
    columns: HTMLElement[],
    root: HTMLElement,
    style: CSSStyleDeclaration,
    gap: number,
  ): PinningLayout {
    return resolveColumnCanvasPinning(
      columns.map((column) => {
        const columnStyle = getComputedStyle(column);
        const id = columnId(column);
        return {
          id: id ?? "",
          kind: !id
            ? null
            : column.dataset.fixed === "true"
              ? "fixed"
              : column.dataset.sticky === "true"
                ? "sticky"
                : null,
          expanded: column.dataset.uiPart === "column",
          width: column.getBoundingClientRect().width,
          minWidth: id ? rootController.getMinWidth(id) : 0,
          marginStart: finitePixels(columnStyle.marginInlineStart),
          marginEnd: finitePixels(columnStyle.marginInlineEnd),
        };
      }),
      {
        mode: resolvedDisplayMode,
        availableWidth:
          root.clientWidth -
          finitePixels(style.paddingInlineStart) -
          finitePixels(style.paddingInlineEnd),
        gap,
        railWidth: stickyWidthProbe?.getBoundingClientRect().width ?? 0,
        contextWidth: wideContextWidthProbe?.getBoundingClientRect().width ?? 0,
        activePairLeadingId,
      },
    );
  }

  function inlineStartPosition(root: HTMLElement, column: HTMLElement): number {
    const rootRect = root.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return getComputedStyle(root).direction === "rtl"
      ? rootRect.right - columnRect.right
      : columnRect.left - rootRect.left;
  }

  function updateStickyStates(): void {
    if (disposed) return;
    const root = scrollingRoot;
    if (!root || resolvedDisplayMode === "compact") {
      stuckStickyColumns = [];
      for (const registration of stickyRegistrations)
        registration.setStuck(false);
      return;
    }

    const hasScrolled = Math.abs(root.scrollLeft) > 1;
    for (const column of activeFixedColumns) {
      column.element.dataset.fixedState =
        hasScrolled &&
        inlineStartPosition(root, column.element) <=
          column.offset + root.clientLeft + 1
          ? "stuck"
          : "flowing";
    }
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
    for (const registration of stickyRegistrations) {
      registration.setStuck(
        stuckColumns.some((column) => column.id === registration.id),
      );
    }
  }

  function inlineEndPosition(root: HTMLElement, column: HTMLElement): number {
    const rootRect = root.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    return getComputedStyle(root).direction === "rtl"
      ? rootRect.right - columnRect.left
      : columnRect.right - rootRect.left;
  }

  function requestStickyLayout(): void {
    if (disposed) return;
    void tick().then(() => {
      if (disposed) return;
      if (stickyLayoutFrame !== null) cancelAnimationFrame(stickyLayoutFrame);
      stickyLayoutFrame = requestAnimationFrame(() => {
        stickyLayoutFrame = null;
        if (!disposed) syncStickyLayout();
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

  const stickyRailInteractions: Action<
    HTMLElement,
    ColumnCanvasStickyColumnRegistration
  > = (node, initial) => {
    let registration = initial;
    const enter = (event: PointerEvent) => registration.pointerEnter(event);
    const leave = (event: PointerEvent) => registration.pointerLeave(event);
    const press = (event: PointerEvent) => registration.pointerDown(event);
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("pointerdown", press);
    return {
      update(next) {
        registration = next;
      },
      destroy() {
        node.removeEventListener("pointerenter", enter);
        node.removeEventListener("pointerleave", leave);
        node.removeEventListener("pointerdown", press);
      },
    };
  };

  function returnToStickyColumn(column: ResolvedStickyColumn): void {
    const root = scrollingRoot;
    if (!root) return;
    const rootStyle = getComputedStyle(ref ?? root);
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
    scrollingRoot?.removeAttribute("data-wheel-routing");
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
        (direction > 0
          ? inlineScrollSign(root) *
            Math.max(0, root.scrollWidth - root.clientWidth)
          : 0);
      if (Math.abs(target - root.scrollLeft) <= 2) return;
      animateWheelToSnapPoint(root, target, direction);
    }, 240);
  }

  function columnSnapPoints(root: HTMLElement): number[] {
    return scrollingColumns().map((column) => targetScrollLeft(root, column));
  }

  function inlineScrollSign(root: HTMLElement): number {
    return getComputedStyle(root).direction === "rtl" ? -1 : 1;
  }

  function adjacentSnapPoint(
    root: HTMLElement,
    direction: WheelDirection,
  ): number | undefined {
    const points = columnSnapPoints(root);
    const sign = inlineScrollSign(root);
    const current = root.scrollLeft * sign;
    if (direction > 0) {
      return points.find((point) => point * sign > current + 2);
    }
    for (let index = points.length - 1; index >= 0; index -= 1) {
      if (points[index] * sign < current - 2) return points[index];
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

  function alignActivePair(): void {
    const root = scrollingRoot;
    if (!root) return;
    cancelWheelAnimation();
    if (resolvedDisplayMode === "fixed") return;
    const columns = scrollingColumns();
    const target =
      resolvedDisplayMode === "wide"
        ? activePair(columns).at(-1)
        : columns.at(-1);
    if (!target) return;
    const nextScrollLeft = targetScrollLeft(root, target);
    if (resolvedDisplayMode === "wide" || prefersReducedMotion()) {
      root.scrollLeft = nextScrollLeft;
      return;
    }
    root.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  }

  function requestAlignment(): void {
    requestPairAlignment(true);
  }

  function requestActivePairAlignment(): void {
    requestPairAlignment(false);
  }

  function requestPairAlignment(activateDeepest: boolean): void {
    if (disposed) return;
    alignmentShouldActivateDeepest =
      alignmentShouldActivateDeepest || activateDeepest;
    void tick().then(() => {
      if (disposed) return;
      if (alignmentFrame !== null) cancelAnimationFrame(alignmentFrame);
      alignmentFrame = requestAnimationFrame(() => {
        alignmentFrame = null;
        if (disposed) return;
        const shouldActivateDeepest = alignmentShouldActivateDeepest;
        alignmentShouldActivateDeepest = false;
        const columns = visibleColumns();
        if (shouldActivateDeepest) {
          activePairLeadingId = deepestPairLeadingId(columns);
          pairResizeScrollLeft = null;
        }
        syncStickyLayout();
        alignActivePair();
      });
    });
  }

  function getResizeBehavior(
    requestedColumnId: string,
  ): ColumnCanvasResizeBehavior {
    if (resolvedDisplayMode === "compact") return { kind: "hidden" };
    if (resolvedDisplayMode !== "wide") {
      return { kind: "column" };
    }
    if (
      activeFixedColumns.some(
        (column) => column.element.dataset.columnId === requestedColumnId,
      )
    )
      return { kind: "column" };
    if (
      activePairResize &&
      requestedColumnId === activePairResize.leadingColumnId
    ) {
      return activePairResize;
    }

    const expanded = scrollingColumns().filter(
      (column) => column.dataset.uiPart === "column",
    );
    const leadingIndex = expanded.findIndex(
      (column) => requestedColumnId === column.dataset.columnId,
    );
    const leading = expanded[leadingIndex];
    const trailing = expanded[leadingIndex + 1];
    const leadingId = leading ? columnId(leading) : undefined;
    const trailingId = trailing ? columnId(trailing) : undefined;
    if (
      !leading ||
      !trailing ||
      !leadingId ||
      !trailingId ||
      !rootController.isResizable(leadingId) ||
      !rootController.isResizable(trailingId)
    ) {
      return { kind: "hidden" };
    }
    return {
      kind: "pair",
      leadingColumnId: leadingId,
      trailingColumnId: trailingId,
      trailingTitle: trailing.dataset.columnTitle ?? trailingId,
      leadingWidth: leading.getBoundingClientRect().width,
      trailingWidth: trailing.getBoundingClientRect().width,
    };
  }

  function activateResizePair(columnId: string): ColumnCanvasResizeBehavior {
    const behavior = getResizeBehavior(columnId);
    if (resolvedDisplayMode !== "wide" || behavior.kind !== "pair") {
      if (
        behavior.kind === "column" &&
        activeFixedColumns.some(
          (column) => column.element.dataset.columnId === columnId,
        ) &&
        pairResizeScrollLeft === null
      )
        pairResizeScrollLeft = scrollingRoot?.scrollLeft ?? null;
      return behavior;
    }
    const root = scrollingRoot;
    if (root && pairResizeScrollLeft === null) {
      pairResizeScrollLeft = root.scrollLeft;
    }
    if (activePairLeadingId !== behavior.leadingColumnId) {
      activePairLeadingId = behavior.leadingColumnId;
      // Resizing is an explicit pair activation event. Reallocate the chosen
      // neighbours without aligning or otherwise moving the scroll position.
      syncStickyLayout();
    }
    return activePairResize ?? behavior;
  }

  function finishResizePair(): void {
    if (!scrollingRoot || pairResizeScrollLeft === null) return;
    // Layout measurements preserve the viewport themselves. Once the gesture
    // ends, a later native scroll owns its position even before queued layout.
    pairResizeScrollLeft = null;
    scheduleStickyStateUpdate();
  }

  setColumnCanvasContext({
    controller: rootController,
    get displayMode() {
      return resolvedDisplayMode;
    },
    requestAlignment,
    requestStickyLayout,
    getResizeBehavior,
    activateResizePair,
    finishResizePair,
    registerStickyColumn,
    get viewport() {
      return scrollingRoot;
    },
    getPreviewRail(id) {
      return (
        ref?.querySelector<HTMLElement>(
          `[data-sticky-for="${CSS.escape(id)}"]`,
        ) ?? null
      );
    },
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
    // Direct controller calls such as open/close/collapse/ensure can change
    // the rendered column structure without a path change or local trigger.
    rootController.structuralRevision;
    requestAlignment();
  });

  // Compare the durable ratios before scheduling layout. Transient previews
  // also update controller runtime state, but must never remeasure the canvas.
  const pairSplitIdentity = $derived(
    rootController
      .getLayout()
      .pairSplits.map(
        (split) =>
          `${split.leadingColumnId}\u0000${split.trailingColumnId}\u0000${split.leadingFraction}`,
      )
      .join("\u0001"),
  );
  $effect(() => {
    pairSplitIdentity;
    requestStickyLayout();
  });

  $effect(() => {
    // Re-align once when the responsive presentation mode changes.
    resolvedDisplayMode;
    requestAlignment();
  });

  $effect(() => {
    const root = scrollingRoot;
    if (!root) return;

    const measure = (): void => {
      const nextWidth = root.getBoundingClientRect().width;
      const shouldAlignActivePair =
        rootWidth !== null &&
        resolvedDisplayMode === "wide" &&
        Math.abs(nextWidth - rootWidth) > 1;
      rootWidth = nextWidth;
      if (shouldAlignActivePair) {
        requestActivePairAlignment();
      } else {
        requestStickyLayout();
      }
    };
    // Only the viewport owns this observer; its measured state must not
    // resubscribe the effect and replace a pending responsive alignment.
    untrack(measure);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  });

  onDestroy(() => {
    disposed = true;
    if (alignmentFrame !== null) cancelAnimationFrame(alignmentFrame);
    if (stickyLayoutFrame !== null) cancelAnimationFrame(stickyLayoutFrame);
    if (stickyStateFrame !== null) cancelAnimationFrame(stickyStateFrame);
    cancelWheelAnimation();
    stopStickyWheelRouting();
    pairResizeScrollLeft = null;
  });

  $effect(() => {
    const viewport = scrollViewport;
    if (!viewport) return;
    const onScroll = (event: Event) =>
      handleScroll(
        event as UIEvent & { currentTarget: EventTarget & HTMLDivElement },
      );
    viewport.addEventListener("scroll", onScroll);
    return () => viewport.removeEventListener("scroll", onScroll);
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
      if (target === scrollingRoot) break;
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
      resolvedDisplayMode === "compact" ||
      activeStickyColumns.length > 0 ||
      activeFixedColumns.length > 0;
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

    const root = scrollingRoot;
    if (!root) return;
    const maxScrollLeft = Math.max(0, root.scrollWidth - root.clientWidth);
    const sign = inlineScrollSign(root);
    const current = root.scrollLeft * sign;
    const canMove =
      event.deltaY < 0 ? current > 1 : current < maxScrollLeft - 1;
    if (!canMove) return;

    if (resolvedDisplayMode !== "compact") {
      event.preventDefault();
      cancelWheelAnimation();
      if (resolvedDisplayMode === "wide") {
        const direction: WheelDirection = event.deltaY < 0 ? -1 : 1;
        startStickyWheelRouting(root, direction);
      }
      root.scrollLeft =
        sign *
        Math.min(
          maxScrollLeft,
          Math.max(0, current + event.deltaY * STICKY_WHEEL_DELTA_SCALE),
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
    const root = scrollingRoot;
    if (!root) return false;
    const points = columnSnapPoints(root);
    if (points.length === 0) return false;

    let target: number | undefined;
    if (key === "Home") target = points[0];
    if (key === "End") target = points.at(-1);
    if (key === "ArrowRight" || key === "ArrowLeft") {
      const direction =
        (key === "ArrowRight" ? 1 : -1) * inlineScrollSign(root);
      target = adjacentSnapPoint(root, direction as WheelDirection);
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
  data-external-scroll={scrollViewport ? "true" : undefined}
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
        data-mixed={activeFixedColumns.length ? "true" : undefined}
        style:--ui-column-canvas-sticky-stack-width={`${Math.max(...stuckStickyColumns.map((column) => column.offset + column.width))}px`}
        aria-label="Previous columns"
      >
        {#each stuckStickyColumns as column (column.id)}
          <div
            data-ui-component="column-canvas"
            data-ui-part="sticky-rail"
            data-sticky-for={column.id}
            data-sticky-state="stuck"
            use:stickyRailInteractions={column.registration}
            style:--ui-column-canvas-sticky-rail-width={`${column.width}px`}
            style:--ui-column-canvas-sticky-rail-offset={`${column.offset}px`}
          >
            <Button
              variant="outline"
              size="icon-sm"
              data-ui-part="sticky-return"
              aria-label={`Return to ${column.registration.title} column`}
              title={`Return to ${column.registration.title}`}
              onclick={() => {
                rootController.dismissPreview(column.id);
                returnToStickyColumn(column);
              }}
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
        aria-hidden={trailingSpacer ? undefined : true}
        style:width={`${trailingSpacerWidth}px`}
        style:min-width={`${trailingSpacerWidth}px`}
      >
        {@render trailingSpacer?.()}
      </div>
    {/if}
  </div>
</div>
